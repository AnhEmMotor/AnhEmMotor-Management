import fs from 'fs';
import path from 'path';
import { translate } from '@vitalets/google-translate-api';

const extractedPath = path.join(process.cwd(), 'scratch/extracted.json');
const langsDir = path.join(process.cwd(), 'src/locales/langs');

const extracted = JSON.parse(fs.readFileSync(extractedPath, 'utf8'));
const entries = Object.entries(extracted);

const languages = [
  { code: 'vi', name: 'Vietnamese' },
  { code: 'en', name: 'English' },
  { code: 'ara', name: 'Arabic' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'fra', name: 'French' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese', targetFile: 'jp' },
  { code: 'ko', name: 'Korean', targetFile: 'kor' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ro', name: 'Romanian', targetFile: 'rom' },
  { code: 'ru', name: 'Russian' },
  { code: 'es', name: 'Spanish', targetFile: 'spa' },
  { code: 'sv', name: 'Swedish', targetFile: 'swe' }
];

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function translateLang(langObj) {
    const { code, targetFile } = langObj;
    const fileName = targetFile || code;
    const filePath = path.join(langsDir, `${fileName}.json`);
    
    console.log(`Translating to ${langObj.name} (${fileName})...`);
    
    let langData = {};
    try {
        langData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        langData = {};
    }
    langData.admin = langData.admin || {};

    for (const [key, value] of entries) {
        const shortKey = key.split('.')[1];
        // Only translate if not already translated or if we want to force refresh
        try {
            const res = await translate(value, { to: code });
            langData.admin[shortKey] = res.text;
            console.log(`  ${value} -> ${res.text}`);
            await sleep(1000); // 1 second delay between strings
        } catch (e) {
            console.error(`  Error translating "${value}":`, e.message);
            langData.admin[shortKey] = value; // fallback
            await sleep(5000); // Wait longer on error
        }
    }

    fs.writeFileSync(filePath, JSON.stringify(langData, null, 2), 'utf8');
}

async function main() {
    for (const lang of languages) {
        await translateLang(lang);
        console.log(`Finished ${lang.name}`);
        await sleep(2000); // 2 second delay between languages
    }
}

main().catch(console.error);
