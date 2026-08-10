import { run } from 'node:test';
import fs from 'node:fs';

const files = fs.readdirSync('tests')
  .filter(f => f.endsWith('.test.mjs'))
  .map(f => 'tests/' + f);

let failedFiles = [];

const stream = run({
  files: files,
  concurrency: 1,
});

stream.on('test:fail', (data) => {
  if (data.file) {
    failedFiles.push(data.file);
  }
});

stream.on('end', () => {
  const uniqueFailedFiles = [...new Set(failedFiles)];
  fs.writeFileSync('failed_tests.json', JSON.stringify(uniqueFailedFiles, null, 2));
  console.log('Failed tests:', uniqueFailedFiles.length);
});
