import { useState } from 'react';
import {
  SQLiteProvider,
} from 'expo-sqlite';
import { migrateDbIfNeeded } from './helpers/db';
import { IndexPage } from './pages/IndexPage';
import { ShowPage } from './pages/ShowPage';
import { UpsertPage } from './pages/UpsertPage';

export default function App() {
  return (
    <SQLiteProvider databaseName="db.db" onInit={migrateDbIfNeeded}>
      <Router />
    </SQLiteProvider>
  );
}

function Router() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  if (!selectedId && !isEditing) {
    return (
      <IndexPage
        selectId={setSelectedId}
        createNote={() => {
          setIsEditing(true);
        }}
      />
    );
  }

  if (isEditing) {
    return (
      <UpsertPage
        selectedId={selectedId}
        goToList={() => {
          setSelectedId(null);
          setIsEditing(false);
        }}
        stopEditing={() => setIsEditing(false)}
        selectId={setSelectedId}
      />
    );
  }

  return (
    <ShowPage
      selectedId={selectedId}
      goToList={() => setSelectedId(null)}
      startEditing={() => setIsEditing(true)}
    />
  );
}