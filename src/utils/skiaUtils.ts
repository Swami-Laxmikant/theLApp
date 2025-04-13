import {
    rect as skRect,
    Transforms3d,
    vec,
} from '@shopify/react-native-skia';
import { useEffect, useState } from 'react';
import {
    cancelAnimation,
    isSharedValue,
    makeMutable,
    SharedValue,
    useSharedValue,
} from 'react-native-reanimated';

export const useMutableValue = <T>(getValue: (() => T)) => {

    const value = useState(() => makeMutable(getValue()))[0];

    useEffect(()=>{
        return () => cancelAnimation(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return value;

};

export const useCanvasSize = () => {
    const size = useSharedValue({ width: 0, height: 0 });
    return size;
};

type WithPossibleSharedValue<T> = {
    [K in keyof T]: T[K] | (SharedValue<NonNullable<T[K]>>);
}

type RectConfig = WithPossibleSharedValue<{x?: number, y?: number, x2?: number, y2?: number, width?: (number | (() => number)), height?: (number | (() => number)), size?: {width: number, height: number}, aspectRatio?: number}>

export const getSkRect = (rectConfg: RectConfig) => {
    'worklet';
    let x = (isSharedValue(rectConfg.x) ? rectConfg.x.value : rectConfg.x) as number | undefined;
    let y = (isSharedValue(rectConfg.y) ? rectConfg.y.value : rectConfg.y) as number | undefined;
    let x2 = (isSharedValue(rectConfg.x2) ? rectConfg.x2.value : rectConfg.x2) as number | undefined;
    let y2 = (isSharedValue(rectConfg.y2) ? rectConfg.y2.value : rectConfg.y2) as number | undefined;
    let width = (isSharedValue(rectConfg.width) ? rectConfg.width.value : rectConfg.width) as number | (() => number) | undefined;
    let height = (isSharedValue(rectConfg.height) ? rectConfg.height.value : rectConfg.height) as number | (() => number) | undefined;
    let size = (isSharedValue(rectConfg.size) ? rectConfg.size.value : rectConfg.size) as {width: number, height: number} | undefined;
    let aspectRatio = (isSharedValue(rectConfg.aspectRatio) ? rectConfg.aspectRatio.value : rectConfg.aspectRatio) as number | undefined;

    const aspectRatioExist = aspectRatio !== undefined;
    const x2Exist = x2 !== undefined;
    const y2Exist = y2 !== undefined;

    width = (typeof width === 'function' ? width() : width) as number | undefined;
    height = (typeof height === 'function' ? height() : height) as number | undefined;

    x = x ?? 0;
    y = y ?? 0;
    width = (x2Exist ? (x2 - x) : undefined) ?? width ?? size?.width ?? (aspectRatioExist ? (height ?? size?.height ?? 0) * aspectRatio : 0);
    height = (y2Exist ? (y2 - y) : undefined) ?? height ?? size?.height ?? (aspectRatioExist ? (width ?? size?.width ?? 0) / aspectRatio : 0);

    return skRect(x, y, width, height);
};

export const getOrigin = (config: RectConfig) => {
    'worklet';
    const rect = getSkRect(config);
    return vec(rect.x + rect.width / 2, rect.y + rect.height / 2);
};

type Sizeable = {width: number, height: number} | {width: () => number, height: () => number}

export const getAspectRatio = (size?: Sizeable | null) => {
    'worklet';
    if (!size) {return 1;}

    if (typeof size.width === 'function' && typeof size.height === 'function') {
        return size.width() / size.height();
    }

    if(typeof size.width === 'number' && typeof size.height === 'number') {
        return size.width / size.height;
    }

    return 1;
};

export const mergeTransformations = (...transformations: (Transforms3d | SharedValue<Transforms3d>)[]) => {
    'worklet';
    return transformations.reduce<Transforms3d>((acc, curr) => {
        if(isSharedValue(curr)) {
            return acc.concat(curr.value as Transforms3d);
        } else {
            return acc.concat(curr as Transforms3d);
        }
    }, []);
};
