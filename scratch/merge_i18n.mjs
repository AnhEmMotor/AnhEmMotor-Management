import fs from 'fs'

const langs = [
  'vi',
  'en',
  'ara',
  'de',
  'el',
  'fra',
  'it',
  'jp',
  'kor',
  'nl',
  'pl',
  'pt',
  'rom',
  'ru',
  'spa',
  'swe'
]

const translationDict = JSON.parse(fs.readFileSync('scratch/translation_dict.json', 'utf8'))

function translate(text, toLang) {
  if (toLang === 'vi') return translationDict[text] || text
  return text
}

langs.forEach((lang) => {
  const jsonPath = `src/locales/langs/${lang}.json`
  const tsPath = `src/i18n/package/${lang}.ts`

  if (fs.existsSync(jsonPath)) {
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    // Load existing admin keys if any, or generate new ones from extracted_full.json
    const extracted = JSON.parse(fs.readFileSync('scratch/extracted_full.json', 'utf8'))
    const adminKeys = {}
    for (const [key, value] of Object.entries(extracted)) {
      if (key.startsWith('admin.')) {
        const k = key.split('.')[1]
        adminKeys[k] = lang === 'vi' ? translate(value, 'vi') : value
      }
    }
    const mergedData = {
      ...jsonData,
      admin: adminKeys
    }
    const content = `export default ${JSON.stringify(mergedData, null, 2)}`
    fs.writeFileSync(tsPath, content, 'utf8')
    console.log(`Updated ${tsPath}`)
  }
})
