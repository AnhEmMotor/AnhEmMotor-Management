const fs = require('fs');
const path = require('path');

const dictPath = path.join(process.cwd(), 'scratch/extracted.json');
const dictionary = JSON.parse(fs.readFileSync(dictPath, 'utf8'));

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Restore text nodes
    for (const [key, value] of Object.entries(dictionary)) {
        const textTarget = `{{ $t('${key}') }}`;
        if (content.includes(textTarget)) {
            // Need to handle both tag and attributes
            content = content.replaceAll(textTarget, value);
            modified = true;
        }

        const attrRegex1 = new RegExp(`:([a-zA-Z-]+)="\\$t\\('${key}'\\)"`, 'g');
        if (attrRegex1.test(content)) {
            content = content.replaceAll(attrRegex1, (match, attrName) => {
                return `${attrName}="${value}"`;
            });
            modified = true;
        }
    }

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

console.log('Restored files.');
