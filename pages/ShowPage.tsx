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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  selectedId: number;
  goToList: () => void;
  startEditing: () => void;
};

export function ShowPage({ selectedId, goToList, startEditing }: Props) {
  const insets = useSafeAreaInsets();
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
    <View style={[
      styles.container,
      {
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right
      }
    ]}>
      <View style={[styles.titleButton, { top: insets.top, left: insets.left + 4 }]}>
        <TouchableOpacity onPress={goToList}>
          <Text style={styles.heading}>←</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.titleButton, { top: insets.top, right: insets.right + 36 }]}>
        <TouchableOpacity onPress={startEditing}>
          <Text style={styles.heading}>✏️</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.titleButton, { top: insets.top, right: insets.right + 4 }]}>
        <TouchableOpacity onPress={remove}>
          <Text style={styles.heading}>🗑️</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.heading, styles.title]}>{note.title}</Text>

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
    flex: 1,
  },
  titleButton: {
    position: 'absolute',
    padding: 8,
    zIndex: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    textAlign: 'center',
    paddingTop: 8,
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
