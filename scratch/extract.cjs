const fs = require('fs');
const path = require('path');

function findChineseStrings(dir) {
  let results = new Set();
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findChineseStrings(fullPath).forEach(s => results.add(s));
    } else if (fullPath.endsWith('.vue') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/[\u4e00-\u9fa5]+/g);
      if (matches) {
        matches.forEach(m => results.add(m));
      }
    }
  });
  return results;
}

const dashboardPath = path.join(__dirname, 'src/views/dashboard');
const strings = findChineseStrings(dashboardPath);
console.log(Array.from(strings).join('\n'));
