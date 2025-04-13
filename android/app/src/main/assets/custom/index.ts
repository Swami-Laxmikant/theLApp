
// type Font = {
//     familyName: string;
//     source: number;
// }

export const fonts = {
    BerkshireSwashRegular: {
        familyName: 'BerkshireSwash-Regular',
        source: require('./BerkshireSwash-Regular.ttf'),
    },
    AtkinsonHyperlegibleRegular: {
        familyName: 'AtkinsonHyperlegible-Regular',
        source: require('./AtkinsonHyperlegible-Regular.ttf'),
    },
    AtkinsonHyperlegibleBold: {
        familyName: 'AtkinsonHyperlegible-Bold',
        source: require('./AtkinsonHyperlegible-Bold.ttf'),
    },
} as const;

