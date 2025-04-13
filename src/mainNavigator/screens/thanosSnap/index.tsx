import {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {allCenter, flex1, textBoldAtk} from '../../../constants';
import {SnapCanvas} from './SnapCanvas';

export const ThanosSnapScreen = () => {
  const [isStarted, setIsStarted] = useState(false);
  return (
    <View style={[flex1, allCenter, styles.rootView]}>
      <SnapCanvas isStarted={isStarted} />
      <TouchableOpacity
        onPress={() => setIsStarted(true)}
        style={styles.buttonContainer}>
        <Text style={[textBoldAtk, styles.buttonText]}>Snap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
  buttonContainer: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 10,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  rootView: {
    backgroundColor: 'black',
  },
});
