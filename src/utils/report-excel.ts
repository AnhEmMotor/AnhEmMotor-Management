import * as XLSX from "xlsx";

export type ReportExcelCell =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;

export type ReportExcelRow = Record<string, ReportExcelCell>;

export interface ReportExcelSheet {
  name: string;
  rows: ReportExcelRow[];
}

interface ExportReportWorkbookOptions {
  fileName: string;
  sheets: ReportExcelSheet[];
}

const EMPTY_ROW: ReportExcelRow = {
  "Thông báo": "Không có dữ liệu trong kỳ đã chọn",
};

function sanitizeCellValue(value: ReportExcelCell): ReportExcelCell {
  if (typeof value === "string" && /^[=+\-@]/.test(value)) {
    return `'${value}`;
  }

  return value;
}

function sanitizeRows(rows: ReportExcelRow[]) {
  return (rows.length > 0 ? rows : [EMPTY_ROW]).map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        sanitizeCellValue(value),
      ]),
    ),
  );
}

function calculateColumnWidths(rows: ReportExcelRow[]) {
  const headers = Object.keys(rows[0] ?? EMPTY_ROW);

  return headers.map((header) => {
    const contentLength = rows.reduce((maxLength, row) => {
      const value = row[header];
      return Math.max(maxLength, String(value ?? "").length);
    }, header.length);

    return { wch: Math.min(Math.max(contentLength + 2, 12), 42) };
  });
}

function normalizeSheetName(name: string, index: number) {
  const sanitized = name.replace(/[\\/?*[\]:]/g, " ").trim();
  return (sanitized || `Sheet ${index + 1}`).slice(0, 31);
}

export function exportReportWorkbook({
  fileName,
  sheets,
}: ExportReportWorkbookOptions) {
  const workbook = XLSX.utils.book_new();

  sheets.forEach((sheet, index) => {
    const rows = sanitizeRows(sheet.rows);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = calculateColumnWidths(rows);
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      normalizeSheetName(sheet.name, index),
    );
  });

  const normalizedFileName = fileName.toLowerCase().endsWith(".xlsx")
    ? fileName
    : `${fileName}.xlsx`;

  XLSX.writeFile(workbook, normalizedFileName, {
    bookType: "xlsx",
    compression: true,
  });
}
