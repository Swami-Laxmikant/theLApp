/* eslint-disable react-native/no-inline-styles */
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { images } from '../../../assets';

export const Content = ({onPress}: {onPress: () => void}) => {
    return <View style={styles.container}>
        <Image
        style={[styles.fullSize, {resizeMode: 'cover'}]}
        source={images.screenBg}
    />
    <TouchableOpacity style={styles.pin} onPress={onPress}>
        <Image
            style={[styles.fullSize, {resizeMode: 'contain'}]}
            source={images.pin}
        />
    </TouchableOpacity>
    </View>;
};

const styles = StyleSheet.create({
    container: {
        width: '90%',
        aspectRatio: 9 / 16,
        backgroundColor: 'black',
        overflow: 'hidden',
        borderRadius: 32,
    },
    fullSize: {
        width: '100%',
        height: '100%',
    },
    pin: {
        position: 'absolute',
        top: 53,
        left: 0,
        width: 50,
        height: 40,
        padding: 12,
        paddingBottom: 14,
        paddingTop: 10,
        paddingRight: 16,
        paddingLeft: 16,
        backgroundColor: '#0008',
        borderTopRightRadius: 100,
        borderBottomRightRadius: 100,
    },
});
