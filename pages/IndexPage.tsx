import { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useSQLiteContext,
} from 'expo-sqlite';
import { NoteEntity } from '../helpers/db';

type Props = {
  selectId: (id: number) => void;
  createNote: () => void;
};

export function IndexPage({ selectId, createNote }: Props) {
  const db = useSQLiteContext();
  const [notes, setNotes] = useState<NoteEntity[]>([]);

  const refetchItems = useCallback(() => {
    async function refetch() {
      await db.withExclusiveTransactionAsync(async () => {
        setNotes(
          await db.getAllAsync<NoteEntity>(
            'SELECT * FROM notes'
          )
        );
      });
    }
    refetch();
  }, [db]);

  useEffect(() => {
    refetchItems();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Синергичные заметки</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={createNote}
      >
        <Text style={styles.heading}>+</Text>
      </TouchableOpacity>

      <ScrollView style={styles.listArea}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Todo</Text>
          {notes.map((note) => (
            <Note
              key={note.id}
              note={note}
              onPressItem={selectId}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Note({
  note,
  onPressItem,
}: {
  note: NoteEntity;
  onPressItem: (id) => void | Promise<void>;
}) {
  const { id, title, content } = note;
  return (
    <TouchableOpacity
      onPress={() => onPressItem && onPressItem(id)}
      style={[styles.item, title && styles.itemDone]}
    >
      <Text style={[styles.itemText, content && styles.itemTextDone]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 64,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addButton: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    bottom: 32,
    width: 64,
    height: 64,
    backgroundColor:'#fff',
    borderRadius: 32,
    zIndex: 1,
  },
  input: {
    borderColor: '#4630eb',
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    height: 48,
    margin: 16,
    padding: 8,
  },
  listArea: {
    backgroundColor: '#f0f0f0',
    flex: 1,
    paddingTop: 16,
  },
  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionHeading: {
    fontSize: 18,
    marginBottom: 8,
  },
  item: {
    backgroundColor: '#fff',
    borderColor: '#000',
    borderWidth: 1,
    padding: 8,
  },
  itemDone: {
    backgroundColor: '#1c9963',
  },
  itemText: {
    color: '#000',
  },
  itemTextDone: {
    color: '#fff',
  },
});
