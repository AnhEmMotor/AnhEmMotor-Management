const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules')) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.vue')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let changed = 0;

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let newContent = content
        .replace(/(['"`])(\.\.?)\/store\/modules\//g, '$1$2/application/store/')
        .replace(/(['"`])(\.\.?)\/api\//g, '$1$2/infrastructure/api/');
    
    if (content !== newContent) {
        fs.writeFileSync(f, newContent);
        changed++;
        console.log(`Updated ${f}`);
    }
});
console.log(`Fixed relative imports in ${changed} files`);
