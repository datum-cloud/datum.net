import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_LOCATION = '.persistent/';

async function saveJson(fileName: string, json: object): Promise<void> {
  const filePath = path.join(DB_LOCATION, fileName);
  const content = JSON.stringify(json, null, 2);
  fs.writeFileSync(filePath, content, 'utf8');
}

async function loadJson(fileName: string): Promise<object> {
  const filePath = path.join(DB_LOCATION, fileName);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent);
}

function sha256(value: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(value.toLowerCase());
  return hash.digest('hex');
}

export { saveJson, loadJson, sha256 };
