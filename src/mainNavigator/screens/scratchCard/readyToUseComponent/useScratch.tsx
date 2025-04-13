import {Gesture} from 'react-native-gesture-handler';
import {UseScratchConfig} from './types';
import {useMemo} from 'react';
import {
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {Skia, Transforms3d, Vector, notifyChange, rect, size} from '@shopify/react-native-skia';
import {getScratchFraction} from './utils';

export const useScratch = ({
  enabled,
  revealFraction,
  onReveal,
  onRevealWorklet,
  onScratchEnd,
  onScratchEndWorklet,
  maxGlow,
  thumbWidth,
  scale,
  imageRect: [ix, iy, iw, ih],
}: UseScratchConfig) => {
  const canvasSize = useSharedValue(size(0, 0));
  const rScale = useSharedValue(1);
  const imageRect = useDerivedValue(() => {
    return rect(ix || 0, iy || 0, iw || canvasSize.value.width, ih || canvasSize.value.height);
  }, [canvasSize]);

  const transform = useDerivedValue<Transforms3d>(
    () => [
      {
        scale: rScale.value,
      },
    ],
    [rScale],
  );

  const origin = useDerivedValue<Vector>(
    () => ({
      x: imageRect.value.x + imageRect.value.width / 2,
      y: imageRect.value.y + imageRect.value.height / 2,
    }),
    [imageRect],
  );

  const path = useSharedValue(Skia.Path.Make());
  const strokeWidth = useSharedValue(thumbWidth);
  const blurRadius = useSharedValue(0);

  const runGlow = () => {
    'worklet';
    blurRadius.value = withSequence(
      withTiming(maxGlow! / 4, {duration: 333}),
      withRepeat(withTiming(maxGlow!, {duration: 1000}), -1, true),
    );
  };

  const scratchHandler = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled)
        .onStart(e => {
          path.value.moveTo(e.x, e.y);
          path.value.lineTo(e.x, e.y);
          notifyChange(path);
        })
        .onUpdate(e => {
          path.value.lineTo(e.x, e.y);
          notifyChange(path);
        })
        .onFinalize(() => {
          const scratchedAreaFraction = getScratchFraction(path.value, thumbWidth, imageRect.value);
          onScratchEndWorklet && onScratchEndWorklet(scratchedAreaFraction);
          onScratchEnd && runOnJS(onScratchEnd)(scratchedAreaFraction);

          if (scratchedAreaFraction > revealFraction) {
            const toStrokeWidth = Math.hypot(imageRect.value.width, imageRect.value.height);
            strokeWidth.value = withTiming(toStrokeWidth, {duration: 1000}, done => {
              if (done) {
                rScale.value = withSpring(scale);

                maxGlow && runGlow();
                onRevealWorklet && onRevealWorklet();
                onReveal && runOnJS(onReveal)();
              }
            });
          }
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled],
  );

  return {
    scratchHandler,
    path,
    canvasSize,
    strokeWidth,
    imageRect,
    blurRadius,
    transform,
    origin,
  };
};
