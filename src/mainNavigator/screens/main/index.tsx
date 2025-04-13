import {FlatList} from 'react-native';
import {LButton} from '../../../components';
import {g4, p4} from '../../../constants';
import {useNavigation} from '../../../utils';
import {list} from './list';

export const MainScreen = () => {
  const navigation = useNavigation();

  return (
    <FlatList
      data={list}
      contentContainerStyle={[g4, p4]}
      keyExtractor={item => item.id.toString()}
      renderItem={({item}) => (
        <LButton
          title={item.title}
          onPress={() => navigation.navigate(item.destination)}
        />
      )}
    />
  );
};
