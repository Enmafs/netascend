function escapeCell(value: string | number): string {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Genera el texto CSV (con comillas escapadas). */
export function toCSV(headers: string[], rows: (string | number)[][]): string {
  return [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n');
}

/** Descarga un CSV en el navegador. Incluye BOM para que Excel respete los acentos. */
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const blob = new Blob(['\ufeff', toCSV(headers, rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
