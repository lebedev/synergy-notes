import { SQLiteDatabase } from 'expo-sqlite';

export async function addNoteAsync(db: SQLiteDatabase, title: string, content: string): Promise<number> {
  const { lastInsertRowId } = await db.runAsync(
    'INSERT INTO notes (title, content) VALUES (?, ?);',
    title,
    content,
  );

  return lastInsertRowId;
}

export async function updateNoteAsync(
  db: SQLiteDatabase,
  id: number,
  title: string,
  content: string,
  date: Date,
): Promise<void> {
  await db.runAsync('UPDATE notes SET title = ?, content = ?, date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;', title, content, date.toISOString(), id);
}

export async function deleteNoteAsync(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM notes WHERE id = ?;', id);
}

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 3;
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
  if (currentDbVersion === 2) {
    await db.runAsync(
      'UPDATE notes SET date = ? WHERE date IS NULL;',
      (new Date()).toISOString()
    );
    currentDbVersion = 3;
  }
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

export function getNote(db: SQLiteDatabase, id: number): NoteEntity | null {
  const rawNote: RawNoteEntity = db.getFirstSync('SELECT * FROM notes WHERE id = ?', id);

  return {
    ...rawNote,
    date: new Date(rawNote.date),
    createdAt: new Date(rawNote.created_at),
    updatedAt: new Date(rawNote.updated_at),
  };
}

type RawNoteEntity = {
  id: number;
  title: string;
  content: string;
  date: string;
  created_at: string;
  updated_at: string;
};

export type NoteEntity = {
  id: number;
  title: string;
  content: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};
