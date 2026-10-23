// ==============================================================================
// BrightPath CRM — CSV Export Utility
// RFC 4180 compliant escaping with UTF-8 BOM for Microsoft Excel compatibility
// ==============================================================================

export type CSVRow = (string | number | boolean | null | undefined)[];

/**
 * Escapes a single cell value for CSV formatting according to RFC 4180
 */
export function escapeCSVCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  // If the cell contains quotes, commas, or newlines, enclose in quotes and escape internal quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Formats headers and data rows into a valid CSV string with UTF-8 BOM
 */
export function generateCSVContent(headers: string[], rows: CSVRow[]): string {
  const headerLine = headers.map(escapeCSVCell).join(',');
  const rowLines = rows.map((row) => row.map(escapeCSVCell).join(','));
  // UTF-8 BOM (\uFEFF) ensures Excel opens multilingual text correctly
  return '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
}

/**
 * Triggers a browser download of the generated CSV file
 */
export function downloadCSV(filename: string, headers: string[], rows: CSVRow[]): boolean {
  try {
    const csvContent = generateCSVContent(headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up memory
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);

    return true;
  } catch (err) {
    console.error('Failed to export CSV:', err);
    return false;
  }
}
