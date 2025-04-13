import { Color, DataSourceParam } from '@shopify/react-native-skia';
import { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';

export type CanvasStyle = StyleProp<ViewStyle>

export type GlowConfig = {
    color?: Color;
    radius?: number;
}

export type ShadowConfig = {
    dx?: number;
    dy?: number;
    blur?: number;
    color?: Color;
}

export interface ScratchCardProps {
    canvasStyles: CanvasStyle;
    onLayout?: (event: LayoutChangeEvent) => void;
    scratchEnabled?: boolean;
    applyGlow?: boolean;
    glowConfig?: GlowConfig;
    scaleOnReveal?: number | boolean;
    rewardImage: DataSourceParam;
    coverImage: DataSourceParam;
    imageX?: number;
    imageY?: number;
    imageWidth?: number;
    imageHeight?: number;
    thumbWidth?: number;
    revealFraction?: number;
    applyShadowBeneathCover?: boolean;
    shadowConfig?: ShadowConfig;
    backgroundImage?: DataSourceParam;
    borderRadius?: number;

    onReveal?: () => void;
    onRevealWorklet?: () => void;
    onScratchEnd?: (scratchedFraction: number) => void;
    onScratchEndWorklet?: (scratchedFraction: number) => void;
  }

export interface UseScratchConfig {
    enabled: boolean;
    scale: number;
    maxGlow: number | undefined;

    revealFraction: number;

    imageRect: [number?, number?, number?, number?];
    thumbWidth: number;

    onReveal?: () => void;
    onRevealWorklet?: () => void;

    onScratchEnd?: (scratchedFraction: number) => void;
    onScratchEndWorklet?: (scratchedFraction: number) => void;
}
