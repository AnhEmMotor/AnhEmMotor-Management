const fs = require('fs');
const glob = require('glob');
const pattern = '{src/router/modules/**/*.ts,src/modules/**/Menu/index.ts}';
const files = glob.sync(pattern, { nodir: true });
let changedFiles = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let newContent = content.split('\n').map(line => {
    const match = line.match(/^(\s+)component:\s*[\"']\/index\/index[\"'],?/);
    if (match && match[1].length >= 4) {
      return line.replace(/[\"']\/index\/index[\"']/, '\"\"');
    }
    return line;
  }).join('\n');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf-8');
    changedFiles++;
    console.log('Fixed ' + file);
  }
}
console.log('Total fixed: ' + changedFiles);
