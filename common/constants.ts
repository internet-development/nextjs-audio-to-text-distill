export const MAX_SIZE_BYTES = 15728640;

// NOTE(jimmylee):
// https://github.com/internet-development/apis
// export const API = `http://localhost:10001/api`;
export const API = `https://api.internet.dev/api`;

export const Query = {
  directives: `
- Return a response with <plain_text_response> and </plain_text_response> tags around the answer.`,
};

export const Users = {
  tiers: {
    UNVERIFIED: 0,
    VERIFIED: 10,
    PAYING: 20,
    GENERAL_CO_WORKING: 30,
    PARTNER: 40,
    ADMIN: 100,
  },
};

export const Tiers = {
  PAYING: 899,
  GENERAL_CO_WORKING: 32900,
  PARTNER: 279000,
};

export const Payments = {
  899: 'PAYING',
  32900: 'GENERAL_CO_WORKING',
  279000: 'PARTNER',
};

export const Payouts = {
  PAYING: 1500,
  GENERAL_CO_WORKING: 45000,
  PARTNER: 45000,
};

export const TERMINAL_COLORS = {
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',
  Underscore: '\x1b[4m',
  Blink: '\x1b[5m',
  Reverse: '\x1b[7m',
  Hidden: '\x1b[8m',

  FgBlack: '\x1b[30m',
  FgRed: '\x1b[31m',
  FgGreen: '\x1b[32m',
  FgYellow: '\x1b[33m',
  FgBlue: '\x1b[34m',
  FgMagenta: '\x1b[35m',
  FgCyan: '\x1b[36m',
  FgWhite: '\x1b[37m',

  BgBlack: '\x1b[40m',
  BgRed: '\x1b[41m',
  BgGreen: '\x1b[42m',
  BgDarkGreen: '\x1b[48;5;22m',
  BgYellow: '\x1b[43m',
  BgBlue: '\x1b[44m',
  BgMagenta: '\x1b[45m',
  BgCyan: '\x1b[46m',
  BgWhite: '\x1b[47m',
};
