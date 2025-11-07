import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NoteEntity } from '../helpers/db';
import { prettyDateTime } from '../helpers/date';

type Props = {
  note: NoteEntity;
};

export function Note({ note }: Props) {
  return (
    <View style={styles.noteContainer}>
      <Text style={styles.text}>{note.content ? `${note.title}: ${note.content}` : note.title}</Text>
      <Text style={styles.text}>Дата: {prettyDateTime(note.date)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  noteContainer: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#e0d27c',
    backgroundColor: '#fef7b1',
    paddingHorizontal: 8,
    paddingTop: 4,
    marginBottom: 8,
  },
  text: {
    fontSize: 18,
    marginBottom: 8,
  },
});
