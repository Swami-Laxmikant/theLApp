import {SharedValue} from 'react-native-reanimated';
import {ScratchCardProps} from './types';
import {Blur, RoundedRect, SkRRect} from '@shopify/react-native-skia';

export const Glow = ({
  props,
  rrect,
  r,
}: {
  props: ScratchCardProps;
  r: SharedValue<number>;
  rrect: SharedValue<SkRRect>;
}) => {
  if (!props.applyGlow) {
    return false;
  }

  return (
    <RoundedRect rect={rrect} color={props.glowConfig?.color || 'white'}>
      <Blur blur={r} />
    </RoundedRect>
  );
};
