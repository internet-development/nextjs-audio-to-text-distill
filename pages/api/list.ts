import * as Server from '@common/server';
import * as Constants from '@common/constants';

import fs from 'fs/promises';
import path from 'path';

import { existsSync } from 'fs';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function apiList(req, res) {
  await Server.cors(req, res);

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

  const directory = path.join(repoRoot, 'public');
  const files = await fs.readdir(directory);
  const audio = files.filter((fileName) => /\.(mp3|wav|ogg|flac|m4a)$/i.test(fileName));

  return res.status(200).json({
    success: true,
    data: audio,
  });
}
