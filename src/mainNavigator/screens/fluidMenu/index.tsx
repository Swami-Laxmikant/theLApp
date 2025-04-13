import { Canvas, Circle, CornerPathEffect, Group, notifyChange, Path, SkFont, Skia, SkPath, SkPoint, Text, Transforms3d, useFont, vec } from '@shopify/react-native-skia';
import { Fragment, useState } from 'react';
import { Pressable } from 'react-native';
import { DerivedValue, Extrapolation, interpolate, makeMutable, SharedValue, useDerivedValue, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { fonts } from '../../../assets';
import { flex1 } from '../../../constants';
import { array, getOrigin, mergeTransformations, randomInt, randomNumber, useCanvasSize } from '../../../utils';
import { useProgress } from '../../../utils/reanimated';

const menuBar = Skia.Path.Make();
const circleR = 30;
const circleGap = 15;
const barWidth = circleR * 2 - circleGap * 2;
const barGap = 5;
const strokeWidth = 5;
menuBar.moveTo(-barWidth / 2, 0);
menuBar.rLineTo(barWidth, 0);

const uShapeConfig = {
    startY: 35.217,
    height: 50,
    maxXOffset(width: number){
        'worklet';
        return 116 - width * 3;
    },
};


type SharedPaths = {
    leftPaths: {
        startPath: SharedValue<SkPath>,
        endPath: SharedValue<SkPath>,
        currPath: SharedValue<SkPath>
    }[],
    rightPaths: {
        startPath: SharedValue<SkPath>
        endPath: SharedValue<SkPath>
        currPath: SharedValue<SkPath>
    }[]
}

const getStartPoint = (width: number, index: number) => {
    'worklet';
    switch(index){
        case 0:
        return -width / 2 + randomNumber(-1, 1) * width;
        case 1:
        return width * 3 + randomNumber(-1, 1) * width;
        default:
        return width * 5 + randomNumber(-1, 1) * width;
    }
};

const initializeUShapes = (
    leftPaths: SharedPaths['leftPaths'],
    rightPaths: SharedPaths['rightPaths']
) => {
    const shapesInLeft = array(randomInt(2, 3));
    const shapesInRight = array(randomInt(2, 3));

    const assignPath = (index: number, paths: SharedPaths['leftPaths'] | SharedPaths['rightPaths']) => {

        const width = randomNumber(10, 18);
        const startPoint = getStartPoint(width, index);

        const startPath = Skia.Path.Make();
        startPath.moveTo(startPoint, uShapeConfig.startY)
        .rLineTo(width, 0)
        .rLineTo(0, uShapeConfig.height)
        .rLineTo(width, 0)
        .rLineTo(0, -uShapeConfig.height)
        .rLineTo(width, 0);

        const endPath = Skia.Path.Make();
        endPath.moveTo(startPoint, uShapeConfig.startY)
        .rLineTo(width * 1.5, 0)
        .rLineTo(0, uShapeConfig.height)
        .rLineTo(0, 0)
        .rLineTo(0, -uShapeConfig.height)
        .rLineTo(width * 1.5, 0);

        paths[index].endPath.value = endPath;
        paths[index].startPath.value = startPath;
        paths[index].currPath.value = startPath;
    };

    shapesInLeft.map((_, index) => assignPath(index, leftPaths));
    shapesInRight.map((_, index) => assignPath(index, rightPaths));


    if(shapesInLeft.length === 2){
        leftPaths[2].startPath.value = Skia.Path.Make();
        leftPaths[2].endPath.value = Skia.Path.Make();
        leftPaths[2].currPath.value = Skia.Path.Make();
    }

    if(shapesInRight.length === 2){
        rightPaths[2].startPath.value = Skia.Path.Make();
        rightPaths[2].endPath.value = Skia.Path.Make();
        rightPaths[2].currPath.value = Skia.Path.Make();
    }
};


const hand = Skia.Path.MakeFromSVGString('M126.172 3.545C124.687 1.3295 122.195 0 119.528 0H8C3.5817 0 0 3.5817 0 8V27.2174C0 31.6357 3.5817 35.2174 8 35.2174H136.642L149.489 54H160L126.172 3.545Z')!;
const handBounds = hand.getBounds();
const txMatrix = Skia.Matrix();
txMatrix.translate(-15, 0);
hand.transform(txMatrix);

export const FluidMenu = () => {

    const [progress, setProgress] = useProgress();
    const canvasSize = useCanvasSize();

    const progressForY = useDerivedValue(() => interpolate(progress.value, [0, 0.3], [0, 1], {
        extrapolateLeft: Extrapolation.EXTEND,
        extrapolateRight: Extrapolation.CLAMP,
    }));

    const progressForRotation = useDerivedValue(() => interpolate(progress.value, [0, 0.3, 1], [0, 0, 1]));

    const origin = useDerivedValue(() => getOrigin({size: canvasSize}));

    const handTransform = useDerivedValue<Transforms3d>(() => {
        const py = interpolate(progress.value, [0, 0.7, 1], [0, 0, 1]);
        return [
            // for container
            { translateY: 25 * (1 - py) },
            { scaleX: interpolate(progress.value, [0, 1], [0, 1], 'clamp') },
            { scaleY: interpolate(progress.value, [0, 0.7, 1], [0.7, 1, 1], 'clamp') },

            // for hand
            { translateX: origin.value.x - handBounds.width },
            { translateY: origin.value.y - handBounds.height },
        ];
    });

    const circleTransform = useDerivedValue<Transforms3d>(() => {
        return [
            { translateX: origin.value.x },
            { translateY: origin.value.y },
        ];
    });

    const ushapepaths = useState(() => {
        const leftPaths = array(3, () => ({
            startPath: makeMutable(Skia.Path.Make()),
            endPath: makeMutable(Skia.Path.Make()),
            currPath: makeMutable(Skia.Path.Make()),
        }));
        const rightPaths = array(3, () => ({
            startPath: makeMutable(Skia.Path.Make()),
            endPath: makeMutable(Skia.Path.Make()),
            currPath: makeMutable(Skia.Path.Make()),
        }));

        return {
            leftPaths,
            rightPaths,
        };
    })[0];

    const pathInterpolationProgress = useSharedValue(1);
    const pathRad = useSharedValue(0);
    const textOpacity = useDerivedValue(()=>interpolate(progress.value, [0, 0.5, 1], [0, 0, 1]));

    useDerivedValue(() => {
        const interpolationProgress = 1 - pathInterpolationProgress.value;// interpolate(progress.value, [0.8, 1], [0, 1], 'clamp')
        ushapepaths.leftPaths.forEach(p => {
            p.currPath.value = p.startPath.value.interpolate(p.endPath.value, interpolationProgress)!;
            notifyChange(p.currPath);
        });
        ushapepaths.rightPaths.forEach(p => {
            p.currPath.value = p.startPath.value.interpolate(p.endPath.value, interpolationProgress)!;
            notifyChange(p.currPath);
        });
    });

    const [isOpen, setIsOpen] = useState(false);

    const onPress = () => {
        if(isOpen){
            setProgress.animateToStart({overshootClamping: true, duration: 900});
            pathInterpolationProgress.value = 1;
            setIsOpen(false);
        } else {
            initializeUShapes(ushapepaths.leftPaths, ushapepaths.rightPaths);
            setProgress.animateToEnd({duration: 1000});

            pathRad.value = 20;
            pathRad.value = withDelay(300, withTiming(0, {duration: 350}));
            pathInterpolationProgress.value = withDelay(320, withSequence(
                withTiming(0, {duration: 0}),
                withTiming(1, {duration: 350})
            ));
            setIsOpen(true);
        }
    };

    const atkFont = useFont(fonts.AtkinsonHyperlegibleRegular.source, 16);

    return <Pressable onPress={onPress} style={flex1}>
        <Canvas onSize={canvasSize} style={[flex1, { backgroundColor: 'white' }]}>
            <Hand textOpacity={textOpacity} font={atkFont} r={pathRad} index={0} origin={origin} baseTransform={handTransform} paths={ushapepaths.leftPaths} />
            <Hand textOpacity={textOpacity} font={atkFont} r={pathRad} index={1} origin={origin} baseTransform={handTransform} paths={ushapepaths.rightPaths} />
            <Hand textOpacity={textOpacity} font={atkFont} r={pathRad} index={2} origin={origin} baseTransform={handTransform} paths={ushapepaths.leftPaths} />
            <Hand textOpacity={textOpacity} font={atkFont} r={pathRad} index={3} origin={origin} baseTransform={handTransform} paths={ushapepaths.rightPaths} />
            <Group opacity={1} transform={circleTransform}>
                <Circle c={vec(0, 0)} r={circleR} color="black" />
                <BurgerBar index={0} progressForY={progressForY} progressForRotation={progressForRotation} />
                <BurgerBar index={1} progressForY={progressForY} progressForRotation={progressForRotation} />
            </Group>
        </Canvas>
    </Pressable>;
};

const BurgerBar = ({ progressForY, progressForRotation, index }: { progressForY: DerivedValue<number>, progressForRotation: DerivedValue<number>, index: number }) => {

    const bg = index === 0 ? barGap : -barGap;
    const r = index === 0 ? 1 : 7;

    const transform = useDerivedValue<Transforms3d>(() => {
        return [
            { rotate: progressForRotation.value * (Math.PI / 4) * r },
            { translateY: -bg + bg * progressForY.value },
        ];
    });

    return <Path
        path={menuBar}
        style="stroke"
        strokeWidth={strokeWidth}
        transform={transform}
        strokeCap="round"
        color="white"
    />;
};

const homeIcon = Skia.Path.MakeFromSVGString('M8.74772 14.3604C8.42358 14.3604 8.15478 14.0869 8.15478 13.7571V11.3441C8.15478 11.0143 8.42358 10.7408 8.74772 10.7408C9.07186 10.7408 9.34065 11.0143 9.34065 11.3441V13.7571C9.34065 14.0869 9.07186 14.3604 8.74772 14.3604Z M13.175 17.425H4.32048C2.88162 17.425 1.56926 16.2989 1.33209 14.8591L0.280615 8.44842C0.106688 7.45102 0.588941 6.1721 1.37162 5.53666L6.85033 1.07251C7.90971 0.203805 9.57783 0.211848 10.6451 1.08055L16.1238 5.53666C16.8986 6.1721 17.3729 7.45102 17.2148 8.44842L16.1634 14.8511C15.9262 16.2748 14.5822 17.425 13.175 17.425ZM8.73982 1.63555C8.32081 1.63555 7.9018 1.76425 7.59348 2.0136L2.11476 6.4858C1.67204 6.84775 1.3558 7.68428 1.45067 8.25537L2.50214 14.658C2.64445 15.5026 3.47456 16.2185 4.32048 16.2185H13.175C14.0209 16.2185 14.851 15.5026 14.9933 14.65L16.0448 8.24733C16.1317 7.68428 15.8155 6.83167 15.3807 6.47775L9.90197 2.02164C9.58574 1.76425 9.15883 1.63555 8.73982 1.63555Z');
const m = Skia.Matrix();
m.translate(0, -2);
homeIcon?.transform(m);

const menuContent = [
    {
        title: 'Home',
        path: homeIcon,
    },
    {
        title: 'Clean',
        path: Skia.Path.MakeFromSVGString('M4.28577 4.25732L5.12128 3.74975L6.0001 3.21422L5.06316 1.67669C4.92691 1.45229 4.70251 1.292 4.44605 1.22789C4.3579 1.21186 4.27776 1.20387 4.19761 1.20387C4.01328 1.20387 3.83697 1.25195 3.6847 1.34812C3.4603 1.48437 3.30001 1.70873 3.2359 1.96519C3.17179 2.22966 3.21186 2.49414 3.3481 2.71854L4.28577 4.25732ZM6.08899 1.05957L7.02235 2.59128L7.19509 2.48602C7.47559 2.31772 7.85226 2.40588 8.02056 2.68638L9.5381 5.18155C10.8787 4.9929 12.2609 5.5339 13.1176 6.69362L15.3375 9.69096C15.7863 10.3 15.9546 11.0293 15.8184 11.7426C15.6822 12.4559 15.2494 13.073 14.6002 13.4657L12.0465 15.0186C12.0378 15.0247 12.0288 15.0307 12.0197 15.0364C12.0108 15.0416 12.0017 15.0466 11.9926 15.0514L10.0153 16.2537C10.0002 16.2653 9.98437 16.2763 9.96795 16.2866C9.95165 16.2961 9.93488 16.3049 9.91777 16.313L9.44704 16.5993C9.01427 16.8638 8.54142 17 8.06858 17C7.82815 17 7.58772 16.9679 7.35531 16.8958C6.65005 16.6874 6.08103 16.2066 5.75245 15.5254L4.10951 12.1754C3.47433 10.8817 3.62727 9.41008 4.40813 8.30581L2.89142 5.81197C2.7151 5.53147 2.81127 5.16279 3.09177 4.98647L3.25708 4.88574L2.32227 3.3517C2.01773 2.85481 1.92155 2.26174 2.06581 1.68471C2.20205 1.1157 2.55468 0.626814 3.05958 0.32227C3.55647 0.0177272 4.14953 -0.0784502 4.72656 0.0658071C5.30359 0.20205 5.78444 0.554671 6.08899 1.05957ZM10.8801 14.3202L9.85366 14.9444L8.84596 13.2893C8.67766 13.0088 8.30099 12.9206 8.02049 13.0889C7.73999 13.2652 7.64381 13.6339 7.82013 13.9144L8.82725 15.5685L8.80589 15.5815C8.46128 15.7899 8.06057 15.8539 7.68389 15.7417C7.30722 15.6295 7.00268 15.3651 6.81835 14.9964L5.17542 11.6465C4.60959 10.4842 4.96295 9.11042 6.00581 8.3742L8.7664 6.69197C9.17832 6.46332 9.61722 6.34902 10.0561 6.34902C10.8575 6.34902 11.6349 6.71769 12.1398 7.41493L14.3598 10.4123C14.6082 10.7409 14.6964 11.1336 14.6243 11.5182C14.5442 11.9028 14.3118 12.2313 13.9593 12.4477L12.9494 10.7889C12.7811 10.5084 12.4044 10.4203 12.1239 10.5886C11.8434 10.7649 11.7472 11.1336 11.9235 11.4141L12.9329 13.0719L11.9065 13.696L10.8977 12.0391C10.7294 11.7586 10.3527 11.6704 10.0722 11.8387C9.79169 12.0151 9.69552 12.3837 9.87184 12.6642L10.8801 14.3202ZM7.13886 3.93673L5.73395 4.79118L4.2298 5.70778L5.27165 7.4228L5.32977 7.38738C5.39916 7.3385 5.47061 7.29153 5.54408 7.24661L8.07659 5.70788C8.13414 5.6727 8.19225 5.6392 8.25085 5.60738L8.34915 5.54749L7.30729 3.83241L7.1676 3.91754C7.15825 3.92416 7.14867 3.93056 7.13886 3.93673Z'),
    },
    {
        title: 'Control',
        path: Skia.Path.MakeFromSVGString('M6.9186 6.72093C5.27062 6.72093 3.89236 5.52282 3.61075 3.95349H0.593023C0.268837 3.95349 0 3.68465 0 3.36047C0 3.03628 0.268837 2.76744 0.593023 2.76744H3.61075C3.89236 1.19811 5.27062 0 6.9186 0C8.76884 0 10.2791 1.51023 10.2791 3.36047C10.2791 5.2107 8.76884 6.72093 6.9186 6.72093ZM6.9186 1.18605C5.71674 1.18605 4.74419 2.1586 4.74419 3.36047C4.74419 4.56233 5.71674 5.53488 6.9186 5.53488C8.12047 5.53488 9.09302 4.56233 9.09302 3.36047C9.09302 2.1586 8.12047 1.18605 6.9186 1.18605ZM11.6628 3.95349H16.407C16.7312 3.95349 17 3.68465 17 3.36047C17 3.03628 16.7312 2.76744 16.407 2.76744H11.6628C11.3386 2.76744 11.0698 3.03628 11.0698 3.36047C11.0698 3.68465 11.3386 3.95349 11.6628 3.95349ZM13.3893 12.6512H16.407C16.7312 12.6512 17 12.3823 17 12.0581C17 11.734 16.7312 11.4651 16.407 11.4651H13.3893C13.1076 9.89579 11.7294 8.69767 10.0814 8.69767C8.23116 8.69767 6.72093 10.2079 6.72093 12.0581C6.72093 13.9084 8.23116 15.4186 10.0814 15.4186C11.7294 15.4186 13.1076 14.2205 13.3893 12.6512ZM5.33721 12.6512H0.593023C0.268837 12.6512 0 12.3823 0 12.0581C0 11.734 0.268837 11.4651 0.593023 11.4651H5.33721C5.6614 11.4651 5.93023 11.734 5.93023 12.0581C5.93023 12.3823 5.6614 12.6512 5.33721 12.6512ZM7.90698 12.0581C7.90698 10.8563 8.87953 9.88372 10.0814 9.88372C11.2833 9.88372 12.2558 10.8563 12.2558 12.0581C12.2558 13.26 11.2833 14.2326 10.0814 14.2326C8.87953 14.2326 7.90698 13.26 7.90698 12.0581Z'),
    },
    {
        title: 'Freeze',
        path: Skia.Path.MakeFromSVGString('M8.97165 1.30768H10.0614C10.4188 1.30768 10.7152 1.01129 10.7152 0.653839C10.7152 0.296417 10.4188 0 10.0614 0H8.31781H6.57422C6.2168 0 5.92038 0.296417 5.92038 0.653839C5.92038 1.01129 6.2168 1.30768 6.57422 1.30768H7.66397V4.86209C6.8176 5.01471 6.04532 5.45917 5.48783 6.11609L2.41971 4.34351L2.96509 3.39999C3.1482 3.09488 3.04355 2.69385 2.72971 2.51077C2.42459 2.3277 2.02356 2.43231 1.84049 2.74615L0.968693 4.25436L0.96619 4.25858L0.958225 4.27246L0.0968972 5.76257C-0.0861777 6.06769 0.0184365 6.46872 0.332279 6.65179C0.428196 6.71283 0.541508 6.73898 0.65485 6.73898C0.872807 6.73898 1.09946 6.62564 1.2215 6.41641L1.76868 5.46979L4.83207 7.23959C4.68579 7.63879 4.61267 8.05978 4.61267 8.5C4.61267 8.93796 4.68503 9.35684 4.82978 9.75671L1.75998 11.5302L1.2128 10.5836C1.03843 10.2785 0.637394 10.1651 0.323551 10.3482C0.0184365 10.5226 -0.0949058 10.9236 0.0881692 11.2374L0.956059 12.7389C0.95734 12.7411 0.958653 12.7434 0.959965 12.7457C0.9632 12.7515 0.966526 12.7572 0.969914 12.7628L1.83176 14.2538C1.95383 14.4718 2.17176 14.5851 2.39844 14.5851C2.50306 14.5851 2.61637 14.559 2.72098 14.4892C3.02613 14.3149 3.13947 13.9138 2.95639 13.6L2.41101 12.6565L5.47998 10.8834C6.03806 11.5454 6.81366 11.9933 7.66397 12.1466V15.6923H6.57422C6.2168 15.6923 5.92038 15.9887 5.92038 16.3462C5.92038 16.7036 6.2168 17 6.57422 17H8.31781H10.0614C10.4188 17 10.7152 16.7036 10.7152 16.3462C10.7152 15.9887 10.4188 15.6923 10.0614 15.6923H8.97165V12.1466C9.81949 11.9937 10.593 11.548 11.1507 10.8892L14.2249 12.6653L13.6795 13.6087C13.4965 13.9138 13.6011 14.3149 13.9149 14.498C14.0108 14.559 14.1241 14.5851 14.2375 14.5851C14.4641 14.5851 14.6908 14.4718 14.8041 14.2626L15.6757 12.7544L16.5477 11.2462C16.7308 10.941 16.6262 10.54 16.3124 10.3569C16.0072 10.1739 15.6062 10.2785 15.4231 10.5923L14.8759 11.539L11.8051 9.76492C11.9503 9.36697 12.023 8.94742 12.023 8.50873C12.023 8.06403 11.9483 7.63898 11.7991 7.23355L14.8672 5.461L15.4144 6.40768C15.5364 6.62564 15.7544 6.73898 15.9811 6.73898C16.0944 6.73898 16.2077 6.71283 16.3036 6.64307C16.6088 6.46872 16.7221 6.06769 16.539 5.75385L15.667 4.24567L14.7954 2.73743C14.6211 2.43231 14.22 2.31897 13.9062 2.50204C13.6011 2.67642 13.4877 3.07742 13.6708 3.3913L14.2162 4.33475L11.1429 6.11029C10.5858 5.45654 9.81553 5.01425 8.97165 4.86209V1.30768ZM8.41159 10.9043C9.22992 10.8719 9.98117 10.4169 10.3927 9.70309C10.6019 9.33694 10.7152 8.92719 10.7152 8.50873C10.7152 8.09027 10.6106 7.68054 10.3927 7.30566C9.96552 6.56464 9.17218 6.10257 8.31781 6.10257C7.4704 6.10257 6.68293 6.55719 6.25345 7.28763C6.2501 7.29367 6.24662 7.29965 6.24305 7.30563L6.24073 7.30957C6.03281 7.67474 5.92038 8.08304 5.92038 8.5C5.92038 8.91849 6.025 9.32822 6.24295 9.70309C6.65445 10.4169 7.4057 10.8719 8.22403 10.9043C8.2547 10.8998 8.28601 10.8974 8.31781 10.8974C8.34961 10.8974 8.38092 10.8998 8.41159 10.9043Z'),
    },
];


const Hand = ({ font, index, r, origin, baseTransform, paths, textOpacity }: { font: SkFont | null, index: number, r: SharedValue<number>, origin: DerivedValue<SkPoint>, baseTransform: DerivedValue<Transforms3d>, paths: SharedPaths['leftPaths'] | SharedPaths['rightPaths'], textOpacity: DerivedValue<number>  }) => {

    const transform: Transforms3d = [
        { scaleX: index % 2 === 0 ? 1 : -1 },
        { scaleY: index < 2 ? 1 : -1 },
    ];

    const content = menuContent[index];
    const mergedTransform = useDerivedValue(() => mergeTransformations(transform, baseTransform));
    const {y = 0} = font?.measureText(content.title) || {};
    const textTranform: Transforms3d = [
        {scaleX: index % 2 === 0 ? 1 : -1},
        {scaleY: index < 2 ? 1 : -1 },
        {translateX: index % 2 === 0 ? 0 : 3},
    ];


    return <Fragment>
        <Path origin={origin} transform={mergedTransform} path={hand} color="black" />
        {paths.map((p, i) => <Path style={'fill'} strokeWidth={2} key={i} origin={origin} transform={mergedTransform} path={p.currPath} color="black">
            <CornerPathEffect r={r}/>
        </Path>)}
        <Group opacity={textOpacity} origin={origin} transform={mergedTransform}>
        <Group origin={vec(50, 35 / 2)} transform={textTranform}>
            <Text
            font={font}
            y={-y + 12}
            x={30}
            text={content.title}
            color="white"
        />
            {content.path && <Path fillType={'evenOdd'} style={'fill'} transform={[{translateX: 4}, {translateY: 10}]} path={content.path} color="white" />}
        </Group>
        </Group>
    </Fragment>;
};
