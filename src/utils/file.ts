import fs from 'fs';
import path from 'path';

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

export { saveJson, loadJson };
