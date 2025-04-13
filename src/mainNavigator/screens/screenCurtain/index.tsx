/* eslint-disable react-native/no-inline-styles */
import {useState} from 'react';
import {View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {allCenter, flex1} from '../../../constants';
import {Content} from './Content';
import {Menu} from './Menu';

export function ScreenCurtain() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <GestureHandlerRootView style={flex1}>
      <View style={[flex1, allCenter, {backgroundColor: '#222'}]}>
        <Content onPress={() => setIsMenuOpen(true)} />
        <Menu closeMenu={() => setIsMenuOpen(false)} isMenuOpen={isMenuOpen} />
      </View>
    </GestureHandlerRootView>
  );
}
