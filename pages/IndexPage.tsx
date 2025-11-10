import { useState, useEffect, useCallback, Fragment } from 'react';
import {
  Alert,
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
import { File } from 'expo-file-system';
import { StorageAccessFramework, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { getNotes, NoteEntity, RawNoteEntity, replaceNotesAsync, SortingDirection, SortingField } from '../helpers/db';
import { Note } from '../components/Note';
import { prettyDateTime } from '../helpers/date';
import { commonStyles } from '../helpers/commonStyles';

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

  const refetchSortedNotes = useCallback(() => {
    const nextNotes = getNotes(db, currentSortingField, sortingDirection);
    setNotes(nextNotes);
    setFilteredNotes(nextNotes);
  }, [db, currentSortingField, sortingDirection]);

  useEffect(() => {
    refetchSortedNotes();
  }, [refetchSortedNotes]);

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

  const exportToFile = async () => {
    try {
      const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        Alert.alert('Операция отменена!', 'Не выбрана папка для сохранения или не выданы права');

        return;
      }

      const filepath = await StorageAccessFramework.createFileAsync(permissions.directoryUri, 'synergy-notes.json', 'application/json')
      await writeAsStringAsync(filepath, JSON.stringify(notes, null, 2), { encoding: EncodingType.UTF8 });
      Alert.alert('Заметки экспортированы', `Количество экспортированных заметок: ${notes.length}`);
    } catch (error) {
      Alert.alert('Ошибка!', error.message);
    }
  };

  const importFromFile = async () => {
    const text = await (async () => {
      try {
        const file = await (async () => {
          const result = await File.pickFileAsync(undefined, 'application/json');

          return Array.isArray(result) ? result[0] : result;
        })();

        return file.textSync();
      } catch (error) {
        Alert.alert('Ошибка!', 'Выбор файла отменен или нет доступа!');
      }
    })();

    if (!text) {
      return;
    }

    const json = (() => {
      try {
        return JSON.parse(text);
      } catch (error) {
        Alert.alert('Ошибка!', 'Содержимое файла не является корректным JSON!');
      }
    })();

    if (!json) {
      return;
    }

    const isValidJSON = (() => {
      if (!Array.isArray(json)) {
        return false;
      }

      return json.every((item) => {
        return typeof item.id === 'number'
          && typeof item.title === 'string'
          && typeof item.content === 'string'
          && typeof item.date === 'string'
          && !Number.isNaN(Date.parse(item.date))
          && typeof item.created_at === 'string'
          && !Number.isNaN(Date.parse(item.created_at))
          && typeof item.updated_at === 'string'
          && !Number.isNaN(Date.parse(item.updated_at));
      });
    })();

    if (!isValidJSON) {
      Alert.alert('Ошибка!', 'JSON из файла не соответствует схеме приложения!');

      return;
    }

    const parsedRawNotes: RawNoteEntity[] = json;

    if (notes.length > 0) {
      Alert.alert(
        'Импорт',
        `Вы собираетесь импортировать заметок: ${parsedRawNotes.length}. Все текущие заметки будут удалены. Продолжить?`,
        [
          {
            style: 'cancel',
            text: 'Отмена',
          },
          {
            style: 'destructive',
            text: 'Да',
            onPress: async () => {
              await replaceNotesAsync(db, parsedRawNotes);
              refetchSortedNotes();
            },
          }
        ],
      );
    } else {
      await replaceNotesAsync(db, parsedRawNotes);
      refetchSortedNotes();
    }
  };

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
      <Text style={[commonStyles.heading, commonStyles.title]}>Синергичные заметки</Text>
      {notes && notes.length > 0 ? (
        <TouchableOpacity
          style={[commonStyles.titleButton, { top: insets.top, right: insets.right + 36 }]}
          onPress={exportToFile}
        >
          <Text style={commonStyles.heading}>📤</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        style={[commonStyles.titleButton, { top: insets.top, right: insets.right + 4 }]}
        onPress={importFromFile}
      >
        <Text style={commonStyles.heading}>📥</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.addButton, { bottom: insets.bottom + 8 }]}
        onPress={createNote}
      >
        <Text style={commonStyles.heading}>+</Text>
      </TouchableOpacity>

      <ScrollView style={[styles.listArea, { marginBottom: -insets.bottom }]}>
        {notes ? (
          <View style={{ paddingBottom: 2 * insets.bottom }}>
            {notes.length === 0 ? (
              <Text style={styles.sectionHeading}>Пока нет заметок! Создайте новую, нажав на + в углу, или импортируйте из файла!</Text>
            ) : (
              <>
                <TextInput
                  onChangeText={setSearchText}
                  placeholder="Введите текст для поиска..."
                  style={commonStyles.input}
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
  listArea: {
    backgroundColor: '#f0f0f0',
    flex: 1,
    marginTop: 16,
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
