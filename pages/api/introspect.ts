import fs from 'fs/promises';
import path from 'path';

import * as Constants from '@common/constants';
import * as Server from '@common/server';
import * as Utilities from '@common/utilities';

import { Agent } from 'undici';
import { existsSync } from 'fs';

const noTimeoutAgent = new Agent({
  headersTimeout: 0,
  bodyTimeout: 0,
});

function extractPlainText(rawOutput) {
  if (!rawOutput) return null;

  if (Array.isArray(rawOutput)) {
    if (typeof rawOutput[1] === 'string') {
      return rawOutput[1].trimEnd();
    }
    rawOutput = rawOutput[0];
  }

  if (typeof rawOutput === 'string') {
    const tagRegex = /<plain_text_response>\s*([\s\S]*?)\s*<\/plain_text_response>/i;
    const match = rawOutput.match(tagRegex);
    if (match && typeof match[1] === 'string') {
      return match[1].trimEnd();
    }
    return rawOutput.trimEnd();
  }

  return null;
}

function normalizeMultilineText(input) {
  const lines = input
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const current = lines[i];
    const next = lines[i + 1] || '';

    if (current.endsWith('-') && next) {
      result.push(current.slice(0, -1));
    } else {
      if (current.match(/[a-zA-Z0-9)]$/) && next && !next.startsWith(',') && !next.startsWith('.') && !next.startsWith(';') && !next.startsWith(':')) {
        result.push(current + ' ');
      } else {
        result.push(current);
      }
    }
  }

  return result.join('').replace(/\s+/g, ' ').trim();
}

async function queryOllamaHTTP(promptText) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemma3:27b',
      prompt: promptText,
      stream: false,
    }),
    dispatcher: noTimeoutAgent,
  });

  if (!response.ok) {
    return null;
  }

  const jsonResp = await response.json();

  let introspectionResult = jsonResp.response.trim();
  const jsonRegex = /<plain_text_response>\s*([\s\S]*?)\s*<\/plain_text_response>/i;
  const jsonMatch = introspectionResult.match(jsonRegex);

  return extractPlainText(jsonMatch);
}

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function apiIntrospect(req, res) {
  await Server.cors(req, res);

  const { name } = req.body || {};

  if (Utilities.isEmpty(name)) {
    return res.status(400).json({ error: true, data: null });
  }

  const entryScript = process.cwd();
  let repoRoot = entryScript;
  if (!existsSync(path.join(entryScript, 'global.scss'))) {
    let dir = path.dirname(entryScript);
    while (dir !== '/' && !existsSync(path.join(dir, 'global.scss'))) {
      dir = path.dirname(dir);
    }
    repoRoot = dir;
  }
  if (!repoRoot) {
    return res.status(409).json({ error: true, data: null });
  }

  const filePath = path.join(repoRoot, `public`, `${name}.txt`);
  const promptPath = path.join(repoRoot, `public`, `__prompt.txt`);

  if (!existsSync(filePath)) {
    return res.status(404).json({ error: true, data: null });
  }

  const transcript = await fs.readFile(filePath, 'utf-8');
  const prompt = await fs.readFile(promptPath, 'utf-8');
  let normalizedTranscription = normalizeMultilineText(transcript);

  const query = `<transcript>
"${normalizedTranscription}"
</transcript>

${prompt}
${Constants.Query.directives}`;

  let answer = await queryOllamaHTTP(query);

  const outPath = filePath.replace('.txt', `.introspection.txt`);
  try {
    await fs.unlink(outPath);
    console.log(`Deleted existing file: ${path.basename(outPath)}`);
  } catch (err) {}

  await fs.writeFile(outPath, answer, {
    encoding: 'utf-8',
    flag: 'w',
  });

  return res.status(200).json({ success: true, data: answer, out: outPath });
}
