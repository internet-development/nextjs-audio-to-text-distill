import fs from 'fs/promises';
import path from 'path';

import * as Constants from '@common/constants';
import * as Server from '@common/server';

import { existsSync } from 'fs';
import { nodewhisper } from 'nodejs-whisper';

export const config = {
  api: {
    responseLimit: false,
    bodyParser: false,
  },
};

export default async function apiUpload(req, res) {
  await Server.cors(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: true, data: null });
  }

  const contentType = req.headers['content-type'] || '';
  const match = contentType.match(/boundary=(.*)$/);
  if (!match) {
    return res.status(400).json({ success: false, message: 'Missing boundary' });
  }

  const boundary = match[1];
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  const boundaryBuffer = Buffer.from(`--${boundary}`, 'utf-8');
  const headerBoundaryIndex = buffer.indexOf(boundaryBuffer);
  if (headerBoundaryIndex === -1) {
    return res.status(400).json({ error: true, data: null });
  }

  const partHeaderStart = headerBoundaryIndex + boundaryBuffer.length + 2;
  const headerEndIndex = buffer.indexOf(Buffer.from('\r\n\r\n', 'utf-8'), partHeaderStart);
  if (headerEndIndex === -1) {
    return res.status(400).json({ error: true, data: null });
  }

  const headerPart = buffer.slice(partHeaderStart, headerEndIndex).toString('utf-8');
  const filenameMatch = headerPart.match(/filename="([^"]+)"/);
  if (!filenameMatch) {
    return res.status(400).json({ error: true, data: null });
  }

  const filename = path.basename(filenameMatch[1]);
  const nextBoundaryBuffer = Buffer.from(`\r\n--${boundary}`, 'utf-8');
  const nextBoundaryIndex = buffer.indexOf(nextBoundaryBuffer, headerEndIndex + 4);
  if (nextBoundaryIndex === -1) {
    return res.status(400).json({ error: true, data: null });
  }

  const fileStart = headerEndIndex + 4;
  const fileEnd = nextBoundaryIndex;
  const fileBuffer = buffer.slice(fileStart, fileEnd);

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

  const destDir = path.join(repoRoot, 'public');
  const destPath = path.join(destDir, filename);

  await fs.writeFile(destPath, fileBuffer);

  await nodewhisper(destPath, {
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
      timestamps_length: 30,
      splitOnWord: false,
    },
  });

  return res.status(200).json({ success: true, data: filename });
}
