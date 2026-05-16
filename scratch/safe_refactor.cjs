const fs = require('fs');
const path = require('path');

let dictionary = {};
let counter = 1;

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Only operate inside <template>
    const templateRegex = /<template>([\s\S]*?)<\/template>/;
    const match = content.match(templateRegex);
    
    if (match) {
        let templateContent = match[1];
        
        // 1. Text inside tags: >中文<
        templateContent = templateContent.replace(/>([^<]*[\u4e00-\u9fa5]+[^<]*)</g, (m, text) => {
            let trimmed = text.trim();
            if (!trimmed || trimmed.includes('{{') || trimmed.includes('}}')) return m;

            let key = 'admin.t' + counter++;
            dictionary[key] = trimmed;
            
            let replaced = text.replace(trimmed, `{{ $t('${key}') }}`);
            modified = true;
            return `>${replaced}<`;
        });

        // 2. Attributes with double quotes (plain or bound with :)
        // Matches: title="中文" or :title="`中文 ${var}`" or :title="'中文'"
        const attrRegex = /\b([a-zA-Z-]+)="([^"]*[\u4e00-\u9fa5]+[^"]*)"/g;
        templateContent = templateContent.replace(attrRegex, (m, attrName, attrValue) => {
            // Skip if it's already a $t call
            if (attrValue.includes("$t('")) return m;

            let key = 'admin.t' + counter++;
            dictionary[key] = attrValue;
            modified = true;

            // If it was already a bound attribute (starts with :), we handle the value replacement
            if (attrName.startsWith(':') || attrName.startsWith('@')) {
                 // If it's a template literal `...`
                 if (attrValue.startsWith('`') && attrValue.endsWith('`')) {
                    // Replace the Chinese part inside the backticks
                    // This is complex, but for simple cases like `欢迎回来 ${name}`
                    // We can try to extract just the Chinese part or translate the whole string logic
                    // For now, let's just translate the literal parts
                    let newVal = attrValue.replace(/[\u4e00-\u9fa5]+/g, (match) => {
                        let subKey = 'admin.t' + counter++;
                        dictionary[subKey] = match;
                        return `\${$t('${subKey}')}`;
                    });
                    return `${attrName}="${newVal}"`;
                 }
                 // If it's a single quoted string inside double quotes :label="'中文'"
                 if (attrValue.startsWith("'") && attrValue.endsWith("'")) {
                    return `${attrName}="$t('${key}')"`;
                 }
                 // Otherwise it might be a variable or complex expr, skipping for safety
                 return m;
            } else {
                // Normal attribute title="中文" -> :title="$t('admin.tX')"
                return `:${attrName}="$t('${key}')"`;
            }
        });

        if (modified) {
            content = content.replace(templateRegex, `<template>${templateContent}</template>`);
            fs.writeFileSync(filePath, content, 'utf8');
        }
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

// First restore to original state to ensure a clean run
// (Assuming git restore or similar was done, but let's just run on current)
const targetDir = path.join(process.cwd(), 'src/views/dashboard');
walkDir(targetDir);

fs.writeFileSync(path.join(process.cwd(), 'scratch/extracted.json'), JSON.stringify(dictionary, null, 2), 'utf8');
console.log(`Extracted ${Object.keys(dictionary).length} strings.`);
