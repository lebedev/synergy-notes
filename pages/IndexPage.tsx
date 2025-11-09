import { useState, useEffect, useCallback, Fragment } from 'react';
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
import { getNotes, NoteEntity, SortingDirection, SortingField } from '../helpers/db';
import { Note } from '../components/Note';
import { prettyDateTime } from '../helpers/date';

type Props = {
  selectId: (id: number) => void;
  createNote: () => void;
};

const SORTING_FIELDS: SortingField[] = ['date', 'created_at', 'updated_at'];
const SORTING_FIELDS_LABELS: Record<SortingField, string> = {
  date: 'дата',
  created_at: 'дата создания',
  updated_at: 'дата обновления',
};

export function IndexPage({ selectId, createNote }: Props) {
  const insets = useSafeAreaInsets();
  const db = useSQLiteContext();
  const [currentSortingField, setCurrentSortingField] = useState<SortingField>('created_at');
  const [sortingDirection, setSortingDirection] = useState<SortingDirection>('DESC');
  const [notes, setNotes] = useState<NoteEntity[] | null>(null);
  const [filteredNotes, setFilteredNotes] = useState<NoteEntity[]>([]);

  const [searchText, setSearchText] = useState('');

  const changeSorting = useCallback((sortingField: SortingField) => {
    setCurrentSortingField(sortingField);

    const nextSortingDirection = (() => {
      if (currentSortingField === sortingField) {
        return sortingDirection === 'DESC' ? 'ASC' : 'DESC';
      } else {
        return 'DESC';
      }
    })();
    setSortingDirection(nextSortingDirection);
  }, [currentSortingField, sortingDirection]);

  useEffect(() => {
    const nextNotes = getNotes(db, currentSortingField, sortingDirection);
    setNotes(nextNotes);
    setFilteredNotes(nextNotes);
  }, [db, currentSortingField, sortingDirection]);

  useEffect(() => {
    if (!notes) {
      return;
    }

    const searchParts = searchText.toLowerCase().split(' ');

    setFilteredNotes(searchText ? notes.filter(({ title, content, date }) => {
      const [titleLowercase, contentLowercase] = [title.toLowerCase(), content.toLowerCase()];

      return searchParts.every((searchPart) => titleLowercase.includes(searchPart) || contentLowercase.includes(searchPart) || prettyDateTime(date).includes(searchPart));
    }) : notes);
  }, [notes, searchText]);

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
      <Text style={styles.heading}>Синергичные заметки</Text>
      <TouchableOpacity
        style={[styles.addButton, { bottom: insets.bottom + 8 }]}
        onPress={createNote}
      >
        <Text style={styles.heading}>+</Text>
      </TouchableOpacity>

      <ScrollView style={[styles.listArea, { marginBottom: -insets.bottom }]}>
        {notes ? (
          <View style={{ paddingBottom: 2 * insets.bottom }}>
            {notes.length === 0 ? (
              <Text style={styles.sectionHeading}>Пока нет заметок! Создайте новую, нажав на + в углу.</Text>
            ) : (
              <>
                <TextInput
                  onChangeText={setSearchText}
                  placeholder="Введите текст для поиска..."
                  style={styles.input}
                  value={searchText}
                />
                {filteredNotes.length === 0 ? (
                  <Text style={styles.sectionHeading}>Ничего не найдено! Попробуйте другой поисковый запрос!</Text>
                ) : (
                  <>
                    <View style={styles.flexRow}>
                      <Text style={styles.sectionHeading}>Сортировка: </Text>

                      {SORTING_FIELDS.map((sortingField, index) => (
                        <Fragment key={sortingField}>
                          <TouchableOpacity
                            onPress={() => changeSorting(sortingField)}
                          >
                            <Text style={styles.sectionHeading}>
                              <Text style={currentSortingField === sortingField && styles.bold}>
                                {SORTING_FIELDS_LABELS[sortingField]}
                                {currentSortingField === sortingField ? (
                                  <Text>{sortingDirection === 'DESC' ? ' ↓' : ' ↑'}</Text>
                                ) : null}
                              </Text>
                            </Text>
                          </TouchableOpacity>
                          {index !== SORTING_FIELDS.length - 1 ? (
                            <Text style={styles.sectionHeading}>, </Text>
                          ) : null}
                        </Fragment>
                      ))}
                    </View>
                    {filteredNotes.map((note) => (
                      <TouchableOpacity
                        key={note.id}
                        onPress={() => selectId(note.id)}
                      >
                        <Note note={note} />
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </>
            )}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 8,
  },
  addButton: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    width: 64,
    height: 64,
    backgroundColor:'#fff',
    borderRadius: 32,
    zIndex: 1,
  },
  input: {
    borderColor: '#4630eb',
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    height: 48,
    marginBottom: 8,
    padding: 8,
  },
  listArea: {
    backgroundColor: '#f0f0f0',
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeading: {
    fontSize: 18,
    marginBottom: 8,
  },
  flexRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bold: {
    fontWeight: 'bold',
  },
});
