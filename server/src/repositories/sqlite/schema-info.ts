import type { Database } from 'better-sqlite3';

/** Column names of a table, read with PRAGMA table_info (the table name is internal, never user input). */
export function columnNames(db: Database, table: string): Set<string> {
  const rows: unknown = db.pragma(`table_info(${table})`);
  const names = new Set<string>();
  if (Array.isArray(rows)) {
    for (const row of rows) {
      if (typeof row === 'object' && row !== null && 'name' in row && typeof row.name === 'string') names.add(row.name);
    }
  }
  return names;
}
