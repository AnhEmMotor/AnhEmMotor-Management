import { execSync } from 'child_process';
import fs from 'fs';

const files = fs.readdirSync('tests');
const failed = [];

for (const file of files) {
  if (file.endsWith('.test.mjs') || file.endsWith('.test.ts')) {
    try {
      execSync(`npx tsx tests/${file}`, { stdio: 'ignore' });
    } catch (e) {
      failed.push(file);
    }
  }
}

fs.writeFileSync('failed_tests.json', JSON.stringify(failed, null, 2));
console.log('Failed:', failed);
