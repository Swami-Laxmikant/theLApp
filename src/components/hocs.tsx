import React, {FunctionComponent, useState} from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import {flex1} from '../constants';
import {useNavigation} from '../utils';
import {images} from '../assets/images';

export const withSafeArea = <T,>(
  Comp: FunctionComponent<T>,
  styles?: ViewStyle,
) => {
  return (props: T & JSX.IntrinsicAttributes) => (
    <SafeAreaView style={[flex1, styles]}>
      <Comp {...props} />
    </SafeAreaView>
  );
};

export const withHomeButton = <T,>(Comp: FunctionComponent<T>) => {
  return (props: T & JSX.IntrinsicAttributes) => {
    const navigation = useNavigation();
    const [key, setKey] = useState(0);
    return (
      <>
        <Comp key={key} {...props} />
        <TouchableOpacity
          style={styles.homeIconContainer}
          onPress={navigation.goBack}>
          <Image style={styles.homeIcon} source={images.homeIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.resetIconContainer}
          onPress={() => setKey(key + 1)}>
          <Image style={styles.resetIcon} source={images.reset} />
        </TouchableOpacity>
      </>
    );
  };
};

const styles = StyleSheet.create({
  homeIconContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    borderRadius: 26,
    aspectRatio: 1,
    backgroundColor: '#1E1E1E',
    width: 50,
    borderWidth: 1,
    padding: 10,
    borderColor: 'white',
  },
  resetIconContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16 + 50 + 16,
    borderRadius: 26,
    aspectRatio: 1,
    backgroundColor: '#1E1E1E',
    width: 50,
    borderWidth: 1,
    padding: 12,
    borderColor: 'white',
  },
  homeIcon: {
    width: '100%',
    height: '100%',
  },
  resetIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
