import fs from 'fs';
import { translate } from '@vitalets/google-translate-api';

const strings = fs.readFileSync('scratch/all_chinese_strings.txt', 'utf8').split('\n').filter(s => s.length > 0);
const map = {};

async function run() {
    const batchSize = 20;
    console.log(`Translating ${strings.length} strings in batches of ${batchSize}...`);
    
    for (let i = 0; i < strings.length; i += batchSize) {
        const batch = strings.slice(i, i + batchSize);
        const textToTranslate = batch.join('\n');
        
        try {
            const res = await translate(textToTranslate, { to: 'vi' });
            const translatedBatch = res.text.split('\n');
            
            batch.forEach((orig, idx) => {
                map[orig] = translatedBatch[idx] || orig;
            });
            
            console.log(`Progress: ${Math.min(i + batchSize, strings.length)}/${strings.length}`);
            
            // Delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 2000));
        } catch (e) {
            console.error(`Error at batch ${i}:`, e.message);
            // On error, wait longer and retry one by one for this batch
            await new Promise(r => setTimeout(r, 10000));
            for (const s of batch) {
                try {
                    const res = await translate(s, { to: 'vi' });
                    map[s] = res.text;
                    await new Promise(r => setTimeout(r, 1000));
                } catch (err) {
                    map[s] = s;
                }
            }
        }
        
        // Save progress
        fs.writeFileSync('scratch/translation_map.json', JSON.stringify(map, null, 2), 'utf8');
    }
    console.log("Translation complete.");
}

run();
