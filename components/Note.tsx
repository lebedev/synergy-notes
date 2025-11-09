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
    <View style={[styles.noteContainer, [styles.yellow, styles.blue, styles.pink, styles.green][note.created_at.getTime() / 1000 % 4]]}>
      <Text style={styles.text}>{note.content ? `${note.title}: ${note.content}` : note.title}</Text>
      <Text style={styles.text}>Дата: {prettyDateTime(note.date)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  noteContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingTop: 4,
    marginBottom: 8,
  },
  yellow: {
    borderColor: '#e0d27c',
    backgroundColor: '#fef7b1',
  },
  blue: {
    borderColor: '#79caec',
    backgroundColor: '#acd7f9',
  },
  pink: {
    borderColor: '#f16bc3',
    backgroundColor: '#f9b4df',
  },
  green: {
    borderColor: '#c5e84c',
    backgroundColor: '#dbef94',
  },
  text: {
    fontSize: 18,
    marginBottom: 8,
  },
});
