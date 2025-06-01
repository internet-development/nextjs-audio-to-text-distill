import * as Constants from '@common/constants';
import * as Server from '@common/server';
import * as Utilities from '@common/utilities';

import fs from 'fs/promises';
import path from 'path';

import { existsSync } from 'fs';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function apiGetPrompt(req, res) {
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

  const filePath = path.join(repoRoot, `public`, `__prompt.txt`);
  if (!existsSync(filePath)) {
    return res.status(404).json({ error: true, data: null });
  }

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return res.status(200).json({ success: true, data: content });
  } catch {
    return res.status(500).json({ error: true, data: null });
  }
}
