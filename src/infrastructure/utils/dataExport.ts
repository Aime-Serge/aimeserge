// src/utils/dataExport.ts
import { ZodSchema } from "zod";

/**
 * Export any serializable object as a JSON file.
 */
export function exportJSON<T>(filename: string, data: T): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Export an array of objects as a CSV file, with optional schema validation.
 */
export function exportCSV<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  schema?: ZodSchema<T>
): void {
  if (rows.length === 0) {
    console.warn("exportCSV: no data to export.");
    return;
  }

  // Optional schema validation
  if (schema) {
    const allValid = rows.every((row) => schema.safeParse(row).success);
    if (!allValid) {
      console.error("exportCSV: some rows failed validation, export cancelled.");
      return;
    }
  }

  const headers = Object.keys(rows[0]);

  const escapeCsv = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const str =
      typeof value === "object" ? JSON.stringify(value) : String(value);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
