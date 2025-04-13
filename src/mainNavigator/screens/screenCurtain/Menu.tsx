/* eslint-disable react-hooks/exhaustive-deps */
import {
  Canvas,
  Fill,
  Group,
  Image,
  LinearGradient,
  Paint,
  RoundedRect,
  rrect,
  RuntimeShader,
  SkHostRect,
  Skia,
  rect as skRect,
  useImage,
  vec,
} from '@shopify/react-native-skia';
import {useEffect, useMemo, useRef} from 'react';
import {PixelRatio, StyleSheet, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {
  clamp,
  DerivedValue,
  runOnJS,
  SharedValue,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {images} from '../../../assets';
import {flex1} from '../../../constants';
import {getSkRect, useCanvasSize} from '../../../utils';
import {useProgress} from '../../../utils/reanimated';

const PI = Math.PI;
const COEFFICIENT = 30;
const PD = PixelRatio.get();

const curtainEffect = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform float2 pointerPos;
uniform float2 res;


  vec4 recolor(vec4 color, float factor) {
    vec3 target = factor > 0.0 ? vec3(0.0, 0.0, 0.0) : vec3(1, 1, 1); // Black for darkening, white for brightening
    return vec4(mix(color.rgb, target, abs(factor)), color.a);
  }


    vec4 main(vec2 p) {
  
    float2 uv = p / res;
    float coefficient = ${COEFFICIENT};
    // distortion-x factor
    float dxcf = abs(uv.y - pointerPos.y);
  
    float xCompressionFactor = 1 - 0.5 * pow(sin(dxcf * ${
      PI / 2
    }), 2) * ((1 - pointerPos.x) * 1.2);
  
    uv.x = uv.x / pointerPos.x * xCompressionFactor;
  
    float yOffset = sin( uv.x * ${COEFFICIENT} * ${PI} ) / 200 * (1 - pointerPos.x);
  
    uv.y = uv.y + yOffset;
  
    if(uv.x > 1.0 || uv.x < 0.0 || uv.y > 1.0 || uv.y < 0.0) return vec4(0.0, 0.0, 0.0, 0.0);
    return recolor(image.eval(uv * res), yOffset * 10);
  }
`)!;

export const Menu = ({
  closeMenu,
  isMenuOpen,
}: {
  closeMenu: () => void;
  isMenuOpen: boolean;
}) => {
  const rootView = useRef<View>(null);

  const size = useCanvasSize();
  const rect = useDerivedValue(() => getSkRect({size}));
  const rRect = useDerivedValue(() => rrect(rect.value, 32, 32));
  const [progress, setProgress] = useProgress();
  const panX = useSharedValue(0);
  const pointerY = useSharedValue(0);
  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .onChange(change => {
        panX.value = -change.translationX;
        pointerY.value = change.absoluteY;
      })
      .onEnd(e => {
        console.log(e.translationX, size.value.width / 2);
        pointerY.value = withTiming(size.value.height / 2);
        if (e.translationX < -size.value.width / 2) {
          panX.value = withTiming(size.value.width, undefined, () => {
            progress.value = withTiming(0);
            runOnJS(closeMenu)();
          });
        } else {
          panX.value = withTiming(0);
        }
      });

    const tap = Gesture.Tap()
      .onBegin(() => {})
      .onEnd(() => {
        console.log('Tap end');
      });

    return Gesture.Race(pan, tap);
  }, []);


  useEffect(() => {
    if (isMenuOpen) {
      panX.value = 0;
    }
    setProgress.set(isMenuOpen ? 1 : 0);
    rootView.current?.setNativeProps({
      pointerEvents: isMenuOpen ? 'auto' : 'none',
    });
  }, [isMenuOpen]);
  const overlayOpacity = useDerivedValue(() => progress.value * 0.7);

  return (
    <View ref={rootView} style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Canvas onSize={size} style={flex1}>
          <Group clip={rRect}>
            <Fill opacity={overlayOpacity} color="black" />
            <Overlay
              size={size}
              pointerY={pointerY}
              panX={panX}
              rect={rect}
              progress={progress}
            />
            <RoundedRect
              rect={rRect}
              style={'stroke'}
              strokeWidth={4}
              color="white"
            />
          </Group>
        </Canvas>
      </GestureDetector>
    </View>
  );
};

const Overlay = ({
  size,
  pointerY,
  panX,
  rect,
  progress,
}: {
  size: SharedValue<{width: number; height: number}>;
  pointerY: SharedValue<number>;
  panX: SharedValue<number>;
  rect: DerivedValue<SkHostRect>;
  progress: SharedValue<number>;
}) => {
  const imageRect = useDerivedValue(() =>
    skRect(0, 0, rect.value.width * 0.8, rect.value.height),
  );

  const boundingRect = useDerivedValue(() => rrect(imageRect.value, 32, 32));

  const gradEnd = useDerivedValue(() =>
    vec(imageRect.value.width, imageRect.value.height),
  );

  const tx = useDerivedValue(() => [
    {translateX: -imageRect.value.width * (1 - progress.value)},
  ]);
  const content = useImage(images.menuContent);
  const origin = useDerivedValue(() => ({
    x: imageRect.value.width / 2,
    y: imageRect.value.height,
  }));
  const imageTransform = useDerivedValue(() => [
    {scale: 0.8},
    {translateY: -imageRect.value.width * 0.1},
  ]);

  const uniforms = useDerivedValue(() => {
    return {
      pointerPos: vec(
        clamp(1 - panX.value / imageRect.value.width, 0, 1),
        pointerY.value / size.value.height,
      ),
      res: vec(imageRect.value.width * PD, imageRect.value.height * PD),
    };
  });

  return (
    <Group transform={[{scale: 1 / PD}]}>
      <Group
        transform={[{scale: PD}]}
        layer={
          <Paint>
            <RuntimeShader uniforms={uniforms} source={curtainEffect} />
          </Paint>
        }>
        <Group transform={tx}>
          <RoundedRect rect={boundingRect}>
            <LinearGradient
              colors={['#222549', '#6F74A0']}
              start={vec(0, 0)}
              end={gradEnd}
            />
          </RoundedRect>
          <Image
            key={2}
            origin={origin}
            fit="contain"
            transform={imageTransform}
            rect={imageRect}
            image={content}
          />
        </Group>
      </Group>
    </Group>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    position: 'absolute',
    aspectRatio: 9 / 16,
  },
});
