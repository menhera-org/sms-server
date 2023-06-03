import path from 'node:path';
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import { spawn, execFile } from 'node:child_process';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export {};
