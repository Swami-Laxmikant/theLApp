import {PaintStyle, SkPath, SkRect, Skia, StrokeCap, StrokeJoin, rect} from '@shopify/react-native-skia';
import {ScratchCardProps, UseScratchConfig} from './types';

export const getScratchFraction = (path: SkPath, strokeWid: number, boundingRect: SkRect) => {
  'worklet';
  const scale = Math.min(1, 50 / boundingRect.width);
  const w = boundingRect.width * scale;
  const h = boundingRect.height * scale;

  const surface = Skia.Surface.MakeOffscreen(w, h)!;
  const canvas = surface.getCanvas();
  canvas.scale(scale, scale);
  canvas.translate(-boundingRect.x, -boundingRect.y);
  const paint = Skia.Paint();
  paint.setStyle(PaintStyle.Stroke);
  paint.setStrokeWidth(strokeWid);
  paint.setColor(Skia.Color('white'));
  paint.setStrokeCap(StrokeCap.Round);
  paint.setStrokeJoin(StrokeJoin.Round);

  canvas.drawPath(path, paint);
  surface.flush();
  let pixelsInfo = surface.makeImageSnapshot().readPixels();

  if (!pixelsInfo?.length) {
    return 0;
  }

  let rChannelSum = 0;

  for (let i = 0; i < pixelsInfo.length; i += 4) {
    rChannelSum += pixelsInfo[i];
  }

  let rChannleAvg = rChannelSum / (pixelsInfo.length / 4);

  return rChannleAvg / 255;
};

export const processPropsForScratchHandler = (props: ScratchCardProps): UseScratchConfig => {
  return {
    maxGlow: props.applyGlow ? props.glowConfig?.radius ?? 18 : undefined,
    enabled: props.scratchEnabled ?? true,
    revealFraction: props.revealFraction || 0.3,
    onReveal: props.onReveal,
    onRevealWorklet: props.onRevealWorklet,
    onScratchEnd: props.onScratchEnd,
    onScratchEndWorklet: props.onScratchEndWorklet,
    imageRect: [props.imageX, props.imageY, props.imageWidth, props.imageHeight],
    thumbWidth: props.thumbWidth || 35,
    scale: typeof props.scaleOnReveal === 'number' ? props.scaleOnReveal : 1,
  };
};
