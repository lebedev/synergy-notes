import { SQLiteDatabase } from 'expo-sqlite';

export async function addNoteAsync(
  db: SQLiteDatabase,
  title: string,
  content: string,
  date: Date,
): Promise<number> {
  const { lastInsertRowId } = await db.runAsync(
    'INSERT INTO notes (title, content, date) VALUES (?, ?, ?);',
    title,
    content,
    date.toString(),
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

export async function replaceNotesAsync(
  db: SQLiteDatabase,
  notes: RawNoteEntity[],
): Promise<void> {
  await db.withExclusiveTransactionAsync(async () => {
    await db.runAsync('DELETE FROM notes;');
    for (const note of notes) {
      await db.runAsync(
        'INSERT INTO notes (id, title, content, date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?);',
        note.id,
        note.title,
        note.content,
        note.date,
        note.created_at,
        note.updated_at,
      );
    }
  });
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

function prepareNote(rawNote: RawNoteEntity): NoteEntity {
  return {
    ...rawNote,
    date: new Date(rawNote.date),
    created_at: new Date(rawNote.created_at),
    updated_at: new Date(rawNote.updated_at),
  };
}

export function getNote(db: SQLiteDatabase, id: number): NoteEntity | null {
  const rawNote: RawNoteEntity = db.getFirstSync('SELECT * FROM notes WHERE id = ?;', id);

  return rawNote ? prepareNote(rawNote) : null;
}

export function getNotes(db: SQLiteDatabase, sortingField: SortingField, sortingDirection: SortingDirection): NoteEntity[] {
  const rawNotes: RawNoteEntity[] = db.getAllSync(`SELECT * FROM notes ORDER BY datetime(${sortingField}) ${sortingDirection};`);

  return rawNotes.map(prepareNote);
}

export type SortingField = 'date' | 'created_at' | 'updated_at';
export type SortingDirection = 'ASC' | 'DESC';

export type RawNoteEntity = {
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
  created_at: Date;
  updated_at: Date;
};
