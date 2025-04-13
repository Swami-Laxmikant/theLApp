/* eslint-disable react-native/no-inline-styles */
import { useWindowDimensions, View } from 'react-native';
import { images } from '../../../assets';
import { ScratchCard } from './readyToUseComponent';
import { flex1 } from '../../../constants';

export const Example4 = () => {
  const screenWidth = useWindowDimensions().width;
  const canvasWidth = screenWidth;
  const canvasHeight = useWindowDimensions().height;

  const imageWidth = canvasWidth / 2;
  const imageHeight = imageWidth * 1.5;

  const imageX = (canvasWidth - imageWidth) / 2;
  const imageY = (canvasHeight - imageHeight) / 2;

  return (
    <View
      style={{
        width: canvasWidth,
        height: canvasHeight,
      }}>
      <ScratchCard
        canvasStyles={flex1}
        coverImage={images.cover}
        imageX={imageX}
        imageY={imageY}
        backgroundImage={images.background}
        rewardImage={images.reward}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        applyGlow
        scaleOnReveal={1.5}
        applyShadowBeneathCover
        borderRadius={16}
      />
    </View>
  );
};
