import fs from 'fs/promises';
import path from 'path';

import * as Constants from '@common/constants';
import * as Server from '@common/server';
import * as Utilities from '@common/utilities';

import { existsSync } from 'fs';
import { nodewhisper } from 'nodejs-whisper';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function apiTranscribe(req, res) {
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

  const destDir = path.join(repoRoot, 'public');
  const destPath = path.join(destDir, `${name}`);

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

  return res.status(200).json({ success: true, data: destPath });
}
