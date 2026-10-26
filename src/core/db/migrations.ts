import type * as SQLite from 'expo-sqlite';

/**
 * Kullanıcı-verisi tabloları. İçerik (kitap/film/makale) buraya KOPYALANMAZ;
 * yalnızca kullanıcının ilerlemesi ve test sonuçları tutulur.
 */

export const READING_PROGRESS_DDL = `
  CREATE TABLE IF NOT EXISTS reading_progress (
    content_id TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'book',
    last_page INTEGER NOT NULL DEFAULT 0,
    total_pages INTEGER NOT NULL DEFAULT 0,
    finished INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

export const TEST_RESULTS_DDL = `
  CREATE TABLE IF NOT EXISTS test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    taken_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

export const initUserDataTables = (db: SQLite.SQLiteDatabase): void => {
  db.execSync(READING_PROGRESS_DDL);
  db.execSync(TEST_RESULTS_DDL);
};
