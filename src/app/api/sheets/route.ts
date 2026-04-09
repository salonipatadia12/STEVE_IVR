import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Read from local xlsx file (parent directory)
    const filePath = join(process.cwd(), '..', 'IVR2.0.xlsx');
    const buffer = readFileSync(filePath);
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const sheets: Record<string, Record<string, unknown>[]> = {};
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      sheets[sheetName] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    }

    return NextResponse.json(sheets);
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to read Excel file: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
