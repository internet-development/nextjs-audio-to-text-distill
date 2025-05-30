import * as Constants from '@common/constants';
import * as Server from '@common/server';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function apiIndex(req, res) {
  await Server.cors(req, res);

  res.json({
    success: true,
    message: 'hey there, friend.',
  });
}
