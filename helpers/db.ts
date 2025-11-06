import { SQLiteDatabase } from 'expo-sqlite';

export async function addNoteAsync(db: SQLiteDatabase, text: string): Promise<void> {
  if (text !== '') {
    await db.runAsync(
      'INSERT INTO notes (title, content) VALUES (?, ?);',
      text,
      text,
    );
  }
}

export async function updateItemAsDoneAsync(
  db: SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync('UPDATE items SET done = ? WHERE id = ?;', true, id);
}

export async function deleteItemAsync(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM items WHERE id = ?;', id);
}

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 2;
  let { user_version: currentDbVersion } = await db.getFirstAsync<{
    user_version: number;
  }>('PRAGMA user_version');
  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }
  if (currentDbVersion === 0) {
    await db.execAsync(`
PRAGMA journal_mode = 'wal';
CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY NOT NULL, done INT, value TEXT);
`);
    currentDbVersion = 1;
  }
  if (currentDbVersion === 1) {
    await db.execAsync(`
CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY NOT NULL, title TEXT, content TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, date DATETIME);
DROP TABLE IF EXISTS items;
`);
    currentDbVersion = 2;
  }
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

export type NoteEntity = {
  id: number;
  title: string;
  content: string;
};
