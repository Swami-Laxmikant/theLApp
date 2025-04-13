import {DataSourceParam, Image, SkSize, rect, useImage} from '@shopify/react-native-skia';
import {SharedValue, useDerivedValue} from 'react-native-reanimated';

export const BackgroundImage = ({image, size}: {image: DataSourceParam; size: SharedValue<SkSize>}) => {
  const skImage = useImage(image);
  const imageRect = useDerivedValue(() => {
    return rect(0, 0, size.value.width, size.value.height);
  }, [size]);

  return <Image image={skImage} opacity={0.2} rect={imageRect} fit={'cover'} />;
};
