import { useState, useEffect, useCallback, Fragment } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getNotes, NoteEntity, SortingDirection, SortingField } from '../helpers/db';

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
    setNotes(getNotes(db, currentSortingField, sortingDirection));
  }, [db, currentSortingField, sortingDirection]);

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
        style={styles.addButton}
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
                {notes.map((note) => (
                  <Note
                    key={note.id}
                    note={note}
                    onPressItem={selectId}
                  />
                ))}
                {notes.map((note) => (
                  <Note
                    key={note.id}
                    note={note}
                    onPressItem={selectId}
                  />
                ))}
                {notes.map((note) => (
                  <Note
                    key={note.id}
                    note={note}
                    onPressItem={selectId}
                  />
                ))}
                {notes.map((note) => (
                  <Note
                    key={note.id}
                    note={note}
                    onPressItem={selectId}
                  />
                ))}
                {notes.map((note) => (
                  <Note
                    key={note.id}
                    note={note}
                    onPressItem={selectId}
                  />
                ))}
                {notes.map((note) => (
                  <Note
                    key={note.id}
                    note={note}
                    onPressItem={selectId}
                  />
                ))}
                {notes.map((note) => (
                  <Note
                    key={note.id}
                    note={note}
                    onPressItem={selectId}
                  />
                ))}
                {notes.map((note) => (
                  <Note
                    key={note.id}
                    note={note}
                    onPressItem={selectId}
                  />
                ))}
                {notes.map((note) => (
                  <Note
                    key={note.id}
                    note={note}
                    onPressItem={selectId}
                  />
                ))}
                {notes.map((note) => (
                  <Note
                    key={note.id}
                    note={note}
                    onPressItem={selectId}
                  />
                ))}
                {notes.map((note) => (
                  <Note
                    key={note.id}
                    note={note}
                    onPressItem={selectId}
                  />
                ))}
                <Note
                  key={notes[0].id}
                  note={{
                    ...notes[0],
                    title: 'LAST'
                  }}
                  onPressItem={selectId}
                />
              </>
            )}
          </View>
        ) : null}
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
  const { id, title, content, date } = note;
  return (
    <TouchableOpacity
      onPress={() => onPressItem && onPressItem(id)}
      style={[styles.item, title && styles.itemDone]}
    >
      <Text style={[styles.itemText, content && styles.itemTextDone]}>
        {title}
      </Text>
      <Text style={[styles.itemText, content && styles.itemTextDone]}>
        {date.toISOString()}
      </Text>
    </TouchableOpacity>
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
