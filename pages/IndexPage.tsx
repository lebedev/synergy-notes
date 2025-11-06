import { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useSQLiteContext,
} from 'expo-sqlite';
import { addNoteAsync, NoteEntity } from '../helpers/db';

type Props = {
  selectId: (id: number) => void;
};

export function IndexPage({ selectId }: Props) {
  const db = useSQLiteContext();
  const [text, setText] = useState('');
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

  window.selectId = selectId;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Синергичные заметки</Text>

      <View style={styles.flexRow}>
        <TextInput
          onChangeText={(text) => setText(text)}
          onSubmitEditing={async () => {
            await addNoteAsync(db, text);
            await refetchItems();
            setText('');
          }}
          placeholder="what do you need to do?"
          style={styles.input}
          value={text}
        />
      </View>

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
        {content}
      </Text>
    </TouchableOpacity>
  );
}

//#endregion

//#region Styles

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
  flexRow: {
    flexDirection: 'row',
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

//#endregion