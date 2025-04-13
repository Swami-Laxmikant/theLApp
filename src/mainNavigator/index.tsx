import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { withHomeButton, withSafeArea } from '../components';
import type { MainStack } from './mainStackTypes';
import { FluidMenu, MainScreen, ScratchCardScreen, ScreenCurtain, ThanosSnapScreen } from './screens';

const MainStack = createNativeStackNavigator<MainStack>();

export function MainNavigator() {
  return (
      <NavigationContainer>
      <MainStack.Navigator
        initialRouteName="Main"
        >
        <MainStack.Screen options={{headerShown: false}} name="Main" component={withSafeArea(MainScreen)} />
        <MainStack.Screen options={{headerShown: false}} name="ScreenCurtain" component={withHomeButton(ScreenCurtain)} />
        <MainStack.Screen options={{headerShown: false}} name="FluidMenu" component={withHomeButton(FluidMenu)} />
        <MainStack.Screen options={{headerShown: false}} name="ScratchCard" component={withHomeButton(ScratchCardScreen)} />
        <MainStack.Screen options={{headerShown: false}} name="ImageSnap" component={withHomeButton(ThanosSnapScreen)} />
      </MainStack.Navigator>
    </NavigationContainer>
  );
}
