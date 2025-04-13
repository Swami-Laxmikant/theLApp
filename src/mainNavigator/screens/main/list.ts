import { MainStack } from '../../mainStackTypes';
type ListItem = {
    id: number;
    title: string;
    destination: keyof MainStack;
}

export const list: ListItem[] = [
    {
        id: 2,
        title: 'Scratch Card',
        destination: 'ScratchCard',
    },
    {
        id: 3,
        title: 'Screen Curtain',
        destination: 'ScreenCurtain',
    },
    {
        id: 4,
        title: 'Fluid Menu',
        destination: 'FluidMenu',
    },
    {
        id: 5,
        title: 'Thanos Snap',
        destination: 'ImageSnap',
    },
];
