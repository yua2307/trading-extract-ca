import * as fs from 'fs';

export function readFileSession() {
  try {
    return fs.readFileSync('session-telegram.txt', { encoding: 'utf-8' });
  } catch (e) {
    return ''; // Return empty string if file doesn't exist
  }
}
