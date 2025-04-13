import { useNavigation as useN } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStack } from '../../mainNavigator/mainStackTypes';


export const useNavigation = () => useN<NativeStackNavigationProp<MainStack>>();
