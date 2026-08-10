import fs from 'fs';

const data = fs.readFileSync('test_results.log', 'utf16le');
const lines = data.split('\n');
const failedTests = [];

for (const line of lines) {
  if (line.includes('✖ tests\\') || line.includes('✖ tests/')) {
    failedTests.push(line.trim());
  }
}

fs.writeFileSync('failed_tests.json', JSON.stringify(failedTests, null, 2));
