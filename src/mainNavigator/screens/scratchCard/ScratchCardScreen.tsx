/* eslint-disable react-native/no-inline-styles */
import { Dimensions, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { flex1 } from '../../../constants';
import { Example4 } from './Examples';

const windowWidth = Dimensions.get('window').width;

export function ScratchCardScreen() {

  return (
    <View style={[flex1, {backgroundColor: 'white'}]}>
      <GestureHandlerRootView>
      <View style={styels.itemCont}>
        <Example4 />
      </View>
      </GestureHandlerRootView>
    </View>
  );
}



const styels = StyleSheet.create({
  itemCont: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compCont: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBtn: {
    fontSize: 30,
    color: 'black',
    width: 50,
    height: 50,
    textAlign: 'center',
    fontWeight: 'bold',
    lineHeight: 46,
  },
  titleCont: {
    flexDirection: 'row',
    alignItems: 'center',
    width: windowWidth,
    height: 50,
    gap: 4,
    marginHorizontal: 8,
    marginVertical: 16,
  },
});
