import {useSharedValue, withSpring} from 'react-native-reanimated';
// import {SpringConfig} from 'react-native-reanimated/lib/typescript/animation/springUtils';

type SpringConfig = Parameters<typeof withSpring>[1]

export const useProgress = (initalValue = 0) => {
  const progressValue = useSharedValue(initalValue);

  const animateTo = (
    to: number,
    config?: SpringConfig,
    onDone?: () => void,
  ) => {
    'worklet';
    progressValue.value = withSpring(
      to,
      {
        overshootClamping: true,
        ...config,
      },
      onDone,
    );
  };

  return [
    progressValue,
    {
      animateToEnd: (config?: SpringConfig, onDone?: () => void) => {
        'worklet';
        animateTo(1, config, onDone);
      },
      animateToStart: (config?: SpringConfig, onDone?: () => void) => {
        'worklet';
        animateTo(0, config, onDone);
      },
      set: (
        to: number,
        animation?: false | SpringConfig,
        onDone?: () => void,
      ) => {
        'worklet';
        if (animation === false) {
          progressValue.value = to;
          onDone?.();
        } else {
          animateTo(to, animation, onDone);
        }
      },
      toggle: (animation?: false | SpringConfig, range: [number, number] = [0, 1], onDone?: () => void) => {
        'worklet';
        const [start, end] = range;
        const canAnimate = progressValue.value === start || progressValue.value === end;
        if(!canAnimate){
          return;
        }

        const toValue = progressValue.value === start ? end : start;

        if(animation === false){
          progressValue.value = toValue;
          onDone?.();
        } else {
          animateTo(toValue, animation, onDone);
        }
      },
    },
  ] as const;
};

