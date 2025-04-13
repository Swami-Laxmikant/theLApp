import {DataSourceParam, SkRect, SkPath, useImage, Group, Paint, Shadow, Image, Path} from '@shopify/react-native-skia';
import {SharedValue} from 'react-native-reanimated';
import {ShadowConfig} from './types';

export const CoverImage = ({
  image,
  strokeWidth,
  rect,
  path,
  shadowConfig,
  applyShadow,
}: {
  image: DataSourceParam;
  rect: SharedValue<SkRect>;
  path: SharedValue<SkPath>;
  strokeWidth: SharedValue<number>;
  shadowConfig?: ShadowConfig;
  applyShadow?: boolean;
}) => {
  const skImage = useImage(image);

  return (
    <Group layer={applyShadow ? <ShadowLayer config={shadowConfig} /> : true}>
      <Image fit={'cover'} image={skImage} rect={rect} />
      <Path
        blendMode={'clear'}
        path={path}
        style={'stroke'}
        strokeJoin={'round'}
        strokeCap={'round'}
        strokeWidth={strokeWidth}
        color={'white'}
      />
    </Group>
  );
};

const ShadowLayer = ({config}: {config?: ShadowConfig}) => (
  <Paint>
    <Shadow dx={config?.dx || 0} dy={config?.dy || 0} color={config?.color ?? 'black'} blur={config?.blur ?? 4} />
  </Paint>
);
