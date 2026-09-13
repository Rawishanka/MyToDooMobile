#!/usr/bin/env node
/**
 * Script to standardize all hardcoded fontSize values to use RFValue()
 * across all .tsx and .ts files in the src/ directory.
 * 
 * Replaces: fontSize: 16  → fontSize: RFValue(16)
 * Adds import if RFValue not already imported.
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');
const IMPORT_LINE = "import { RFValue } from '@/src/shared/utils/responsive';";
const IMPORT_PATTERNS = [
  /import\s+\{[^}]*RFValue[^}]*\}\s+from\s+['"][^'"]*responsive['"]/,
  /import\s+RFValue\s+from\s+['"][^'"]*responsive['"]/,
  /import\s+\{[^}]*RFValue[^}]*\}\s+from\s+['"]react-native-responsive-fontsize['"]/,
];

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

function alreadyHasRFValueImport(content) {
  return IMPORT_PATTERNS.some(p => p.test(content));
}

function addRFValueImport(content) {
  // Try to add after existing react-native import, or at top
  const lines = content.split('\n');
  let lastImportIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, IMPORT_LINE);
  } else {
    lines.unshift(IMPORT_LINE);
  }
  return lines.join('\n');
}

function hasFontSizeNumbers(content) {
  return /fontSize:\s*\d+/.test(content);
}

function replaceFontSizes(content) {
  // Replace fontSize: NUMBER (not already wrapped in RFValue)
  // Negative lookbehind for RFValue( — but JS regex can handle this
  return content.replace(/fontSize:\s*(\d+)(?!\))/g, (match, num) => {
    return `fontSize: RFValue(${num})`;
  });
}

const files = getAllFiles(SRC_DIR);
let changedCount = 0;
let skippedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!hasFontSizeNumbers(content)) {
    skippedCount++;
    continue;
  }

  let newContent = replaceFontSizes(content);
  
  // Add import if we added RFValue usage and it's not already imported
  if (newContent !== content && !alreadyHasRFValueImport(newContent)) {
    newContent = addRFValueImport(newContent);
  }

  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    const relativePath = path.relative(path.join(__dirname, '..'), file);
    console.log(`✅ Updated: ${relativePath}`);
    changedCount++;
  }
}

console.log(`\n📊 Summary: ${changedCount} files updated, ${skippedCount} files skipped (no fontSize numbers)`);
