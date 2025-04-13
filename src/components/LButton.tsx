import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {allCenter, textBoldAtk} from '../constants';
interface ButtonProps {
  title: string;
  onPress: () => void;
}

export const LButton = ({title, onPress}: ButtonProps) => {
  return (
    <TouchableOpacity style={[styles.container, allCenter]} onPress={onPress}>
      <Text style={[textBoldAtk, styles.text]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'black',
    borderRadius: 0,
    paddingVertical: 12,
  },
  text: {
    color: 'white',
  },
});
