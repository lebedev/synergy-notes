import { useState } from 'react';
import {
  View,
  Text,
} from 'react-native';
import {
  SQLiteProvider,
} from 'expo-sqlite';
import { migrateDbIfNeeded } from './helpers/db';
import { IndexPage } from 'pages/IndexPage';

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
    <View><Text>selected note {selectedId}</Text></View>
  ) : (
    <IndexPage selectId={setSelectedId} />
  );
}