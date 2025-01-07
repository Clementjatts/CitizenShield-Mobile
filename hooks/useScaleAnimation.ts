import { useRef } from 'react';
import { Animated } from 'react-native';

interface ScaleAnimationHandlers {
  handlePressIn: () => void;
  handlePressOut: () => void;
  scale: Animated.Value;
}

export function useScaleAnimation(
  scaleValue: number = 0.95,
  duration: number = 150
): ScaleAnimationHandlers {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: scaleValue,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return {
    handlePressIn,
    handlePressOut,
    scale,
  };
}
