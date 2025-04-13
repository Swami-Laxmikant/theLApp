

export function array<T>(length: number, fn: (index: number) => T): T[];
export function array(length: number): number[];
export function array(length: number, fn?: (index: number) => any) {
    'worklet';
    return Array.from({length}, (_, i) => fn ? fn(i) : i)
}


export const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
export const randomNumber = (min: number, max: number) => Math.random() * (max - min) + min;
