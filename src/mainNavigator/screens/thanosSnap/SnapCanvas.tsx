/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
import {
  AlphaType,
  Blur,
  Canvas,
  ColorType,
  Group,
  Image,
  rect,
  Skia,
  SkImage,
  useImage,
} from '@shopify/react-native-skia';
import {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  createWorkletRuntime,
  Easing,
  runOnJS,
  runOnRuntime,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {images} from '../../../assets';
import {allCenter, flex1, textRegAtk} from '../../../constants';

const TOTAL_CANVASES = 16;
const MAX_TRANSLATION = 55;
const BASE_DURATION = 700;
const VAR_DURATION = 100;
const SCREEN_WIDTH = Math.floor(Dimensions.get('window').width);
const CANVAS_WIDTH = SCREEN_WIDTH - 24;
const IMAGE_WIDTH = 200;
const IMAGE_ASPECT_RATIO = 736 / 920;
const IMAGE_HEIGHT = Math.floor(IMAGE_WIDTH / IMAGE_ASPECT_RATIO);

const IMAGE_PROCESSOR_THREAD = createWorkletRuntime('imageProcessor');

export const SnapCanvas = ({isStarted}: {isStarted: boolean}) => {
  const image = useImage(images.landscape);
  const [isMaskedImageReady, setIsMaskedImageReady] = useState(false);

  const [skImages, setSkImages] = useState<(SkImage | null)[]>([]);

  const upateImages = (images: (SkImage | null)[]) => {
    setSkImages(images);
    setIsMaskedImageReady(true);
  };

  useMemo(() => {
    if (!image || isMaskedImageReady) {
      return [];
    }
    runOnRuntime(
      IMAGE_PROCESSOR_THREAD,
      (_image: SkImage, upateImages: (images: (SkImage | null)[]) => void) => {
        'worklet';
        const offscreenSurface = Skia.Surface.MakeOffscreen(IMAGE_WIDTH, IMAGE_HEIGHT);
        if (!offscreenSurface) return;
        const offscreenCanvas = offscreenSurface.getCanvas();
        offscreenCanvas.drawImageRect(
          _image,
          rect(0, 0, _image.width(), _image.height()),
          rect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
          Skia.Paint(),
          true,
        );
        const image = offscreenSurface.makeImageSnapshot();

        const pixels = image.readPixels();

        if (!pixels?.length) {
          return;
        }
        const masks = Array(TOTAL_CANVASES)
          .fill(0)
          .map(() => new Uint8Array(pixels.length));
        masks.forEach(m => m.fill(0));
        const totalPoints = pixels.length / 4;

        for (let i = 0; i < totalPoints; i++) {
          const j = Math.floor((i / totalPoints) * TOTAL_CANVASES);
          const canvaIndex = weightedRandomDistribution(j);
          const x = i % IMAGE_WIDTH;
          const y = Math.floor(i / IMAGE_WIDTH);
          const index = (y * IMAGE_WIDTH + x) * 4;

          masks[canvaIndex][index] = pixels[index];
          masks[canvaIndex][index + 1] = pixels[index + 1];
          masks[canvaIndex][index + 2] = pixels[index + 2];
          masks[canvaIndex][index + 3] = pixels[index + 3];
        }

        const images = masks.map(m =>
          Skia.Image.MakeImage(
            {
              width: IMAGE_WIDTH,
              height: IMAGE_HEIGHT,
              alphaType: AlphaType.Opaque,
              colorType: ColorType.RGBA_8888,
            },
            Skia.Data.fromBytes(m),
            IMAGE_WIDTH * 4,
          ),
        );
        runOnJS(upateImages)(images);
      },
    )(image, upateImages);
  }, [image]);

  const blur = useSharedValue(0);
  const opacity = useSharedValue(1);
  useEffect(() => {
    if (isStarted) {
      opacity.value = withTiming(0);
    }
  }, [isStarted]);

  if (!isMaskedImageReady) {
    return <Loader />;
  }

  return (
    <View style={styles.canvas}>
      <Canvas style={flex1}>
        <Group transform={[{translateX: 95}, {translateY: 140}]}>
          <Image
            opacity={opacity}
            image={image}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            fit="cover"
          />
          {skImages.map((image: SkImage | null, index: number) => (
            <MaskedImage
              key={index}
              isStarted={isStarted}
              myImg={image}
              index={index}
            />
          ))}
          <Blur blur={blur} />
        </Group>
      </Canvas>
    </View>
  );
};

const Loader = () => {
  return (
    <View style={[styles.canvas, allCenter]}>
      <ActivityIndicator size={24} color="white" />
      <Text style={[textRegAtk, styles.loadingText]}>Loading...</Text>
    </View>
  );
};

function MaskedImage({
  myImg,
  isStarted,
  index,
}: {
  index: number;
  myImg: SkImage | null;
  isStarted: boolean;
}) {
  const opacity = useSharedValue(1);
  const translation = useSharedValue(0);

  const angleDeviation =
    ((Math.PI / 36 - Math.PI / 6) / 36) * index + Math.PI / 6;
  const angle = useSharedValue(0);
  const finalAngle = (Math.random() * angleDeviation) / 2;

  useEffect(() => {
    if (!isStarted) {
      return;
    }
    const delay = index * 30;
    const config = {
      duration: BASE_DURATION + index * VAR_DURATION,
      easing: Easing.linear,
    };
    setTimeout(() => {
      opacity.value = withTiming(0, config);
      translation.value = withTiming(MAX_TRANSLATION, config);
      angle.value = withTiming(finalAngle, config);
    }, delay);
  }, [isStarted]);

  const transform = useDerivedValue(() => {
    return [
      {translateX: translation.value},
      {translateY: -translation.value},
      {rotate: angle.value},
    ];
  });

  return (
    <Image
      origin={{x: IMAGE_WIDTH / 2, y: IMAGE_HEIGHT}}
      transform={transform}
      opacity={opacity}
      x={0}
      y={0}
      width={IMAGE_WIDTH}
      height={IMAGE_HEIGHT}
      image={myImg}
      fit="cover"
    />
  );
}

function weightedRandomDistribution(peak: number): number {
  'worklet';
  let prob = [],
    seq = [],
    sum = 0;
  for (let i = 0; i < TOTAL_CANVASES; i++) {
    let p = Math.pow(TOTAL_CANVASES - Math.abs(peak - i), 3);
    sum += p;
    prob.push(p);
    seq.push(i);
  }

  function weightedRandom(
    values: number[],
    weights: number[],
    totalWeight: number,
  ): number {
    let random = Math.random() * totalWeight;
    let weight = 0;
    for (let i = 0; i < values.length; i++) {
      weight += weights[i];
      if (random < weight) {
        return values[i];
      }
    }
    return 0;
  }

  return weightedRandom(seq, prob, sum);
}

const styles = StyleSheet.create({
  canvas: {
    width: CANVAS_WIDTH,
    aspectRatio: 3 / 4,
    backgroundColor: '#111',
    borderRadius: 24,
    overflow: 'hidden',
  },
  loadingText: {
    fontSize: 20,
    color: 'white',
    marginTop: 12,
  },
});
