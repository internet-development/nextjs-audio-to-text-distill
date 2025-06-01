import fs from 'fs/promises';
import path from 'path';

import * as Constants from '@common/constants';
import * as Server from '@common/server';
import * as Utilities from '@common/utilities';

import { existsSync } from 'fs';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function apiUpdatePrompt(req, res) {
  await Server.cors(req, res);

  const { prompt } = req.body || {};

  if (Utilities.isEmpty(prompt)) {
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

  const filePath = path.join(repoRoot, `public`, `__prompt.txt`);

  if (!existsSync(filePath)) {
    return res.status(404).json({ error: true, data: null });
  }

  await fs.writeFile(filePath, prompt, {
    encoding: 'utf-8',
    flag: 'w',
  });

  return res.status(200).json({ success: true, data: prompt, out: filePath });
}
