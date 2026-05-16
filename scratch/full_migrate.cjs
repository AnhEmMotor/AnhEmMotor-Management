const fs = require('fs');
const path = require('path');

const translationMap = JSON.parse(fs.readFileSync('scratch/translation_map.json', 'utf8'));

function translate(text) {
    return translationMap[text] || text;
}

const extracted = JSON.parse(fs.readFileSync('scratch/extracted_full.json', 'utf8'));
const viPackage = {};

// Process UI strings for i18n
for (const [key, value] of Object.entries(extracted)) {
    if (key.startsWith('admin.')) {
        viPackage[key.split('.')[1]] = translate(value);
    }
}

// Update vi.ts
const viContent = `export default {
  admin: ${JSON.stringify(viPackage, null, 2)}
};`;
fs.writeFileSync('src/i18n/package/vi.ts', viContent, 'utf8');

// Second pass: Replace literals in files
function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace comments and literals
    // We match Chinese characters sequence
    content = content.replace(/[\u4e00-\u9fa5]+/g, (match) => {
        return translate(match);
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) walkDir(fullPath);
        } else if (fullPath.endsWith('.vue') || fullPath.endsWith('.ts') || fullPath.endsWith('.js') || fullPath.endsWith('.json')) {
            processFile(fullPath);
        }
    }
}

walkDir('src');
console.log("Migration complete.");
