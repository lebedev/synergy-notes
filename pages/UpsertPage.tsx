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
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [note] = useState<NoteEntity | null>(() => getNote(db, selectedId));

  const [title, setTitle] = useState<string>(note?.title ?? '');
  const [content, setContent] = useState<string>(note?.content ?? '');
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time' | null>(null);
  const [date, setDate] = useState<Date>(note?.date ?? new Date());

  const saveNote = async () => {
    if (selectedId) {
      await updateNoteAsync(db, selectedId, title, content, date);
    } else {
      const createdNoteId = await addNoteAsync(db, title, content, date);
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

      <ScrollView style={[styles.listArea, { marginBottom: -insets.bottom, paddingBottom: insets.bottom }]}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Заголовок:</Text>
          <TextInput
            onChangeText={setTitle}
            placeholder="Заголовок..."
            style={styles.input}
            value={title}
          />
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Текст:</Text>
          <TextInput
            onChangeText={setContent}
            placeholder="Текст..."
            style={styles.input}
            value={content}
          />
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Дата:</Text>
          <View style={styles.flexRow}>
            <Text>{date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} (</Text>
            <TouchableOpacity onPress={() => setDatePickerMode('date')}>
              <Text style={styles.pressable}>Изменить 📅</Text>
            </TouchableOpacity>
            <Text>) (</Text>
            <TouchableOpacity onPress={() => setDatePickerMode('time')}>
              <Text style={styles.pressable}>Изменить 🕒</Text>
            </TouchableOpacity>
            <Text>)</Text>

            {datePickerMode ? (
              <DateTimePicker
                mode={datePickerMode}
                value={date}
                is24Hour
                onChange={(event, selectedDate) => {
                  setDate(selectedDate);
                  setDatePickerMode(null);
                }}
              />
            ) : null}
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
  flexRow: {
    flexDirection: 'row',
  },
  pressable: {
    color: 'dodgerblue',
  },
});
