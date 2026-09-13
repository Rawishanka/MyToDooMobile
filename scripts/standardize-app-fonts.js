#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '..', 'app');
const IMPORT_LINE = "import { RFValue } from '@/src/shared/utils/responsive';";
const IMPORT_PATTERN = /import\s+\{[^}]*RFValue[^}]*\}\s+from\s+['"][^'"]*responsive['"]/;

function getAllFiles(dir, exts = ['.tsx', '.ts']) {
  let results = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(full, exts));
    } else if (exts.includes(path.extname(item))) {
      results.push(full);
    }
  }
  return results;
}

const files = getAllFiles(APP_DIR);
let count = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!/fontSize:\s*\d+/.test(content)) continue;

  let newContent = content.replace(/fontSize:\s*(\d+)(?!\))/g, (m, n) => 'fontSize: RFValue(' + n + ')');

  if (newContent !== content && !IMPORT_PATTERN.test(newContent)) {
    const lines = newContent.split('\n');
    let lastImport = -1;
    lines.forEach((l, i) => { if (l.startsWith('import ')) lastImport = i; });
    lines.splice(lastImport + 1, 0, IMPORT_LINE);
    newContent = lines.join('\n');
  }

  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated: ' + path.relative(path.join(__dirname, '..'), file));
    count++;
  }
}

console.log('Done: ' + count + ' files updated');
