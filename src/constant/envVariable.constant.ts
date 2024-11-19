import 'dotenv/config';
import * as process from 'process';

const TELEGRAM_APP_ID = Number(process.env['TELEGRAM_APP_ID']) as number;
const TELEGRAM_API_HASH = process.env['TELEGRAM_API_HASH'] as string;
const TELEGRAM_BOT_ID = process.env['TELEGRAM_BOT_ID'] as string;

// CHECK ENVIRONMENT VARIABLE
const IS_ENABLE_TELEGRAM_SERVICE = Boolean(
  Number(process.env['IS_ENABLE_TELEGRAM_SERVICE']),
) as boolean;

//TELEGRAM
const SESSION_AUTH_KEY = process.env['SESSION_TELEGEAM_AUTH_KEY'] as string;

export const envVariables = {
  TELEGRAM_APP_ID,
  TELEGRAM_API_HASH,
  TELEGRAM_BOT_ID,
  IS_ENABLE_TELEGRAM_SERVICE,
  SESSION_AUTH_KEY,
};
