import fs from 'fs'

const viPath = 'd:/DATN/AnhEmMotor/AnhEmMotor-Management/src/i18n/package/vi.ts'
const insertPath = 'd:/DATN/AnhEmMotor/AnhEmMotor-Management/src/i18n/package/contact_insert.ts'

const viLines = fs.readFileSync(viPath, 'utf8').split('\n')
const insertLines = fs.readFileSync(insertPath, 'utf8').split('\n')

// Replace lines 436-437 (1-indexed) with insertLines
// Lines 1-435 stay, then insertLines, then lines 438-end
const result = [...viLines.slice(0, 435), ...insertLines, ...viLines.slice(437)]

fs.writeFileSync(viPath, result.join('\n'), 'utf8')
console.log('Done')
