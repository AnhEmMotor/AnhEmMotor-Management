const fs = require('fs');
const path = require('path');

let dictionary = {};
let counter = 1;

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Text inside tags
    content = content.replace(/>([^<]*[\u4e00-\u9fa5]+[^<]*)</g, (match, text) => {
        let trimmed = text.trim();
        if (!trimmed || trimmed.includes('{{') || trimmed.includes('}}')) return match;

        let key = 'admin.t' + counter++;
        dictionary[key] = trimmed;
        
        let replaced = text.replace(trimmed, `{{ $t('${key}') }}`);
        modified = true;
        return `>${replaced}<`;
    });

    // 2. Attributes
    const attrRegex = /([a-zA-Z-]+)="([^"]*[\u4e00-\u9fa5]+[^"]*)"/g;
    content = content.replace(attrRegex, (match, attrName, attrValue) => {
        if (attrName.startsWith(':') || attrName.startsWith('@')) return match;
        let key = 'admin.t' + counter++;
        dictionary[key] = attrValue;
        modified = true;
        return `:${attrName}="$t('${key}')"`;
    });
    
    const attrRegex2 = /([a-zA-Z-]+)='([^']*[\u4e00-\u9fa5]+[^']*)'/g;
    content = content.replace(attrRegex2, (match, attrName, attrValue) => {
        if (attrName.startsWith(':') || attrName.startsWith('@')) return match;
        let key = 'admin.t' + counter++;
        dictionary[key] = attrValue;
        modified = true;
        return `:${attrName}="$t('${key}')"`;
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.vue')) {
            processFile(fullPath);
        }
    }
}

const targetDir = path.join(process.cwd(), 'src/views');
walkDir(targetDir);

fs.writeFileSync(path.join(process.cwd(), 'scratch/extracted.json'), JSON.stringify(dictionary, null, 2), 'utf8');
console.log(`Extracted ${Object.keys(dictionary).length} strings.`);
