#!/usr/bin/env node

import untranslated from './scripts/find-untranslated.mjs';

const byFile = {};
untranslated.forEach(entry => {
  if (!byFile[entry.file]) byFile[entry.file] = 0;
  byFile[entry.file]++;
});

console.log('Untranslated entries by file:');
Object.entries(byFile).sort((a,b) => b[1] - a[1]).forEach(([file, count]) => {
  console.log(`${file}: ${count}`);
});
console.log(`Total: ${untranslated.length}`);