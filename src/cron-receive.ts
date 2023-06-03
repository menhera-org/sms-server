import path from 'node:path';
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import { execFile } from 'node:child_process';
import * as crypto from 'node:crypto';
import 'dotenv/config';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const RECEIVE_EXEC_PATH = path.join(__dirname, '..', 'mm', 'sms-receive');

const RECEIVE_DATA_PATH = process.env.RECEIVE_DATA_PATH || '/tmp/received-sms';

interface Sms {
  number: string;
  text: string;
  timestamp: number; // milliseconds since epoch
}

const main = async () => {
  await fs.mkdir(RECEIVE_DATA_PATH, { recursive: true });
  const json = await new Promise<string>((resolve, reject) => {
    execFile(RECEIVE_EXEC_PATH, [], (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
  if (!json) {
    console.warn('SNS receive failed');
    return;
  }
  const data = JSON.parse(json);
  const messages: Sms[] = [];
  for (const record of data) {
    const rawTimestamp = record.timestamp;
    const date = new Date(rawTimestamp.replace(/[+-]\d{2}(?:\d{2})?$/, ''));
    const timestamp = date.getTime();
    const text = record.text;
    const number = record.number;
    messages.push({ number, text, timestamp });
  }

  let count = 0;
  for (const message of messages) {
    const uuid = crypto.randomUUID();
    const filename = `${message.timestamp}_${uuid}.json`;
    const json = JSON.stringify(message);
    const filepath = path.join(RECEIVE_DATA_PATH, filename);
    await fs.writeFile(filepath, json);
    count++;
  }
  if (count > 0) {
    console.info(`Received ${count} message(s) from SNS`);
  }
};

main().catch((e) => {
  console.error(e);
});
