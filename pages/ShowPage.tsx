import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useSQLiteContext,
} from 'expo-sqlite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { deleteNoteAsync, getNote, NoteEntity } from '../helpers/db';

type Props = {
  selectedId: number;
  goToList: () => void;
  startEditing: () => void;
};

export function ShowPage({ selectedId, goToList, startEditing }: Props) {
  const insets = useSafeAreaInsets();
  const db = useSQLiteContext();
  const [note] = useState<NoteEntity | null>(() => getNote(db, selectedId));

  if (!note) {
    goToList();

    return null;
  }

  const remove = () => {
    Alert.alert(
      'Удалить заметку?',
      undefined,
        [
          {
            text: 'Да',
            style: 'destructive',
            onPress: async () => {
              await deleteNoteAsync(db, selectedId);
              goToList();
            },
          },
          {
            text: 'Отмена',
            style: 'cancel',
          },
        ]
    );
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

      <ScrollView style={[styles.listArea, { marginBottom: -insets.bottom, paddingBottom: insets.bottom }]}>
        <View style={styles.noteContainer}>
          <Text style={styles.text}>{note.content ? `${note.title}: ${note.content}` : note.title}</Text>
          <Text style={styles.text}>Дата: {note.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.text}>Заметка создана: {note.createdAt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          {note.createdAt.getTime() !== note.updatedAt.getTime() ? (
            <Text style={styles.text}>Заметка обновлена: {note.updatedAt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          ) : null}
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
  listArea: {
    backgroundColor: '#f0f0f0',
    flex: 1,
    marginTop: 16,
    paddingTop: 8,
  },
  noteContainer: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'gray',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingTop: 4,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  text: {
    fontSize: 18,
    marginBottom: 8,
  },
});
