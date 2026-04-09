// Pre-build script: reads IVR2.0.xlsx and writes public/data.json
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Look in parent dir first (local dev), then current dir (CI/GitHub Actions)
let xlsxPath = join(__dirname, '..', '..', 'IVR2.0.xlsx');
if (!existsSync(xlsxPath)) {
  xlsxPath = join(__dirname, '..', 'IVR2.0.xlsx');
}
const outPath = join(__dirname, '..', 'public', 'data.json');

console.log('Reading', xlsxPath);
const buffer = readFileSync(xlsxPath);
const workbook = XLSX.read(buffer, { type: 'buffer' });

const sheets = {};
for (const name of workbook.SheetNames) {
  sheets[name] = XLSX.utils.sheet_to_json(workbook.Sheets[name], { defval: '' });
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(sheets, null, 2));
console.log('Wrote', outPath, '—', Object.keys(sheets).length, 'sheets');
