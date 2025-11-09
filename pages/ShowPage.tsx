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
import { prettyDate } from '../helpers/date';
import { Note } from '../components/Note';
import { commonStyles } from '../helpers/commonStyles';

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
      commonStyles.container,
      {
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right
      }
    ]}>
      <TouchableOpacity
        style={[commonStyles.titleButton, { top: insets.top, left: insets.left + 4 }]}
        onPress={goToList}
      >
        <Text style={commonStyles.heading}>←</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[commonStyles.titleButton, { top: insets.top, right: insets.right + 36 }]}
        onPress={startEditing}
      >
        <Text style={commonStyles.heading}>✏️</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[commonStyles.titleButton, { top: insets.top, right: insets.right + 4 }]}
        onPress={remove}
      >
        <Text style={commonStyles.heading}>🗑️</Text>
      </TouchableOpacity>
      <Text style={[commonStyles.heading, commonStyles.title]}>{note.title}</Text>

      <ScrollView style={[styles.listArea, { marginBottom: -insets.bottom, paddingBottom: insets.bottom }]}>
        <Note note={note} />
        <View style={styles.sectionContainer}>
          <Text style={styles.text}>Заметка создана: {prettyDate(note.created_at)}</Text>
          {note.created_at.getTime() !== note.updated_at.getTime() ? (
            <Text style={styles.text}>Заметка обновлена: {prettyDate(note.updated_at)}</Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  listArea: {
    backgroundColor: '#f0f0f0',
    flex: 1,
    marginTop: 16,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 8,
  },
  text: {
    fontSize: 18,
    marginBottom: 8,
  },
});
