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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addNoteAsync, getNote, NoteEntity, updateNoteAsync } from '../helpers/db';

type Props = {
  selectedId: number | null;
  goToList: () => void;
  stopEditing: () => void;
  selectId: (id: number) => void;
};

export function UpsertPage({ selectedId, selectId, goToList, stopEditing }: Props) {
  const insets = useSafeAreaInsets();
  const db = useSQLiteContext();
  const [note, setNote] = useState<NoteEntity | null>(() => getNote(db, selectedId));

  const [title, setTitle] = useState<string>(note?.title ?? '');
  const [content, setContent] = useState<string>(note?.content ?? '');

  const saveNote = async () => {
    if (selectedId) {
      await updateNoteAsync(db, selectedId, title, content);
    } else {
      const createdNoteId = await addNoteAsync(db, title, content);
      selectId(createdNoteId);
    }
    stopEditing();
  };

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
      <View style={[styles.titleButton, { top: insets.top, right: insets.right + 4 }]}>
        <TouchableOpacity onPress={saveNote}>
          <Text style={styles.heading}>💾</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.heading, styles.title]}>{title}</Text>

      <ScrollView style={styles.listArea}>
        <View style={styles.sectionContainer}>
          <Text>Заголовок:</Text>
          <View>
            <TextInput
              onChangeText={setTitle}
              placeholder="Заголовок..."
              style={styles.input}
              value={title}
            />
          </View>
        </View>
        <View style={styles.sectionContainer}>
          <Text>Текст:</Text>
          <View>
            <TextInput
              onChangeText={setContent}
              placeholder="Текст..."
              style={styles.input}
              value={content}
            />
          </View>
        </View>
      </ScrollView>
    </View>
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
  input: {
    borderColor: '#4630eb',
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    height: 48,
    padding: 8,
  },
  listArea: {
    backgroundColor: '#f0f0f0',
    flex: 1,
    marginTop: 16,
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
