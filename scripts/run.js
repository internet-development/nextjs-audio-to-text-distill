import fs from 'fs/promises';
import path from 'path';

import * as Constants from '../common/constants';

import { Agent } from 'undici';
import { spawn } from 'child_process';
import { nodewhisper } from 'nodejs-whisper';

const AGENT_LABEL = 'LOCALHOST 0.0.1';
const NAME = `run.js`;
const AUDIO_PATH = path.resolve(__dirname, '../public/the-motivation-mindset-with-risa-williams.mp3');
const BASE_NAME = path.basename(AUDIO_PATH, path.extname(AUDIO_PATH));

const THOUGHT_COLOR = '\x1b[90m';

const THEME_SUCCESS = {
  background: Constants.TERMINAL_COLORS.BgGreen,
  foreground: Constants.TERMINAL_COLORS.FgBlack,
};

const THEME_ERROR = {
  background: Constants.TERMINAL_COLORS.BgRed,
  foreground: Constants.TERMINAL_COLORS.FgWhite,
};

const THEME_NEUTRAL = {
  background: Constants.TERMINAL_COLORS.BgWhite,
  foreground: Constants.TERMINAL_COLORS.FgBlack,
};

const noTimeoutAgent = new Agent({
  headersTimeout: 0,
  bodyTimeout: 0,
});

function colorText(text, color) {
  return `${color}${text}${Constants.TERMINAL_COLORS.Reset}`;
}

function log({ stage, message, colors }) {
  const stageWidth = 20;
  const paddedStage = stage.padEnd(stageWidth);
  const formattedStage = colors
    ? colorText(paddedStage, colors.background + colors.foreground)
    : colorText(paddedStage, Constants.TERMINAL_COLORS.BgBlue + Constants.TERMINAL_COLORS.FgWhite);
  const terminalWidth = process.stdout.columns || 80;
  const maxWidth = terminalWidth - stageWidth - 1;
  function wrapLine(line, width) {
    const words = line.split(' ');
    const lines = [];
    let currentLine = '';
    for (const word of words) {
      if ((currentLine + word).length + 1 > width) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    }
    if (currentLine.trim().length > 0) {
      lines.push(currentLine.trim());
    }
    return lines;
  }
  let wrappedLines = [];
  message.split('\n').forEach((line) => {
    if (line.length > maxWidth) {
      wrappedLines = wrappedLines.concat(wrapLine(line, maxWidth));
    } else {
      wrappedLines.push(line);
    }
  });
  console.log(`${formattedStage} ${wrappedLines[0]}`);
  for (let i = 1; i < wrappedLines.length; i++) {
    console.log(`${' '.repeat(stageWidth)} ${wrappedLines[i]}`);
  }
}

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
    log({
      stage: AGENT_LABEL,
      message: `I could not query Ollama, make sure it is running.`,
      colors: THEME_ERROR,
    });
    return;
  }

  const jsonResp = await response.json();

  let introspectionResult = jsonResp.response.trim();
  const jsonRegex = /<plain_text_response>\s*([\s\S]*?)\s*<\/plain_text_response>/i;
  const jsonMatch = introspectionResult.match(jsonRegex);

  return extractPlainText(jsonMatch);
}

async function run() {
  log({
    stage: AGENT_LABEL,
    message: AUDIO_PATH,
    colors: THEME_NEUTRAL,
  });

  await nodewhisper(AUDIO_PATH, {
    modelName: 'large-v3-turbo',
    autoDownloadModelName: 'large-v3-turbo',
    removeWavFileAfterTranscription: false,
    withCuda: false,
    logger: console,
    whisperOptions: {
      outputInCsv: false,
      outputInJson: false,
      outputInJsonFull: false,
      outputInLrc: false,
      outputInSrt: false,
      outputInText: true,
      outputInVtt: false,
      outputInWords: false,
      translateToEnglish: false,
      wordTimestamps: false,
      timestamps_length: 20,
      splitOnWord: false,
    },
  });

  const textPath = path.join(path.dirname(AUDIO_PATH), `${BASE_NAME}.wav.txt`);

  log({
    stage: AGENT_LABEL,
    message: textPath,
    colors: THEME_NEUTRAL,
  });

  let transcription = await fs.readFile(textPath, 'utf-8');
  let normalizedTranscription = normalizeMultilineText(transcription);

  log({
    stage: AGENT_LABEL,
    message: `This transcription process will go over a body of text that is ${normalizedTranscription.length} characters long.`,
    colors: THEME_NEUTRAL,
  });

  const query = `<transcript>
"${normalizedTranscription}"
</transcript>

${Constants.Query.directives}`;

  log({
    stage: AGENT_LABEL,
    message: 'We will start pursuing the deepest insights from this work. Our process will involve trying to obtain 5 meaningful insights.',
    colors: THEME_NEUTRAL,
  });

  let answer = await queryOllamaHTTP(query);

  if (!answer) {
    log({
      stage: AGENT_LABEL,
      message: 'No answer was returned.',
      colors: THEME_ERROR,
    });

    return;
  }

  log({
    stage: AGENT_LABEL,
    message: answer,
    colors: THEME_SUCCESS,
  });

  const outPath = path.join(path.dirname(AUDIO_PATH), `${BASE_NAME}.wav.introspection.txt`);

  log({
    stage: AGENT_LABEL,
    message: outPath,
    colors: THEME_SUCCESS,
  });

  await fs.writeFile(outPath, answer, 'utf-8');
}

console.log(`RUNNING: ${NAME}`);

run();
