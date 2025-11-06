import { useState } from 'react';
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
import { deleteNoteAsync, getNote, NoteEntity } from '../helpers/db';

type Props = {
  selectedId: number;
  goToList: () => void;
  startEditing: () => void;
};

export function ShowPage({ selectedId, goToList, startEditing }: Props) {
  const db = useSQLiteContext();
  const [note, setNote] = useState<NoteEntity | null>(() => getNote(db, selectedId));

  if (!note) {
    goToList();

    return null;
  }

  const remove = async () => {
    await deleteNoteAsync(db, selectedId);
    goToList();
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={goToList}
        style={styles.backButton}
      >
        <Text
          style={styles.heading}
        >
          ←
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={startEditing}
        style={styles.editButton}
      >
        <Text
          style={styles.heading}
        >
          ✏️
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={remove}
        style={styles.removeButton}
      >
        <Text
          style={styles.heading}
        >
          🗑️
        </Text>
      </TouchableOpacity>
      <Text style={styles.heading}>{note.title}</Text>

      <View style={styles.flexRow}>
        <TextInput
          onChangeText={() => {}}
          onSubmitEditing={() => {}}
          placeholder="what do you need to do?"
          style={styles.input}
          value={"azaza"}
        />
      </View>

      <ScrollView style={styles.listArea}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Todo</Text>
            <Note
              key={note.id}
              note={note}
              onPressItem={() => {}}
            />
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 64,
  },
  backButton: {
    position: 'absolute',
    left: 4,
    top: 58,
    padding: 8,
    zIndex: 1,
  },
  editButton: {
    position: 'absolute',
    right: 36,
    top: 58,
    padding: 8,
    zIndex: 1,
  },
  removeButton: {
    position: 'absolute',
    right: 4,
    top: 58,
    padding: 8,
    zIndex: 1,
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
