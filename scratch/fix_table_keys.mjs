import fs from 'fs'

const filePath = 'src/views/examples/tables/index.vue'
let content = fs.readFileSync(filePath, 'utf8')

// Fix keys in handleGetTableInfo
content = content.replace('Dữ liệuđiềusố:', 'dataCount:')
content = content.replace('vịtrongđiềusố:', 'selectedCount:')
content = content.replace('cộtsố:', 'columnCount:')
content = content.replace('khitrướctrang:', 'currentPage:')
content = content.replace('mỗitrangKích thước:', 'pageSize:')
content = content.replace('tổngđiềusố:', 'totalCount:')

// Fix other identifiers if any
content = content.replace('info.Dữ liệuđiềusố', 'info.dataCount')

// Fix searchFormState keys if they were translated
// I need to see what searchFormState looks like.
// Let's check lines 200-300
fs.writeFileSync(filePath, content, 'utf8')
console.log('Repaired keys in tables/index.vue')
