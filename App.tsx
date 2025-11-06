import { useState } from 'react';
import {
  SQLiteProvider,
} from 'expo-sqlite';
import { migrateDbIfNeeded } from './helpers/db';
import { IndexPage } from './pages/IndexPage';
import { ShowPage } from './pages/ShowPage';

export default function App() {
  return (
    <SQLiteProvider databaseName="db.db" onInit={migrateDbIfNeeded}>
      <Router />
    </SQLiteProvider>
  );
}

function Router() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return selectedId ? (
    <ShowPage selectedId={selectedId} goBack={() => setSelectedId(null)} />
  ) : (
    <IndexPage selectId={setSelectedId} />
  );
}