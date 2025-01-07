import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { TAB_CONFIG } from '../constants/TabBar';

interface TabAnimationResult {
    animatedValues: Animated.Value[];
    getAnimatedStyles: (index: number) => {
        scale: Animated.AnimatedInterpolation<number>;
        opacity: Animated.AnimatedInterpolation<number>;
    };
}

export function useTabAnimation(routes: any[], currentIndex: number): TabAnimationResult {
    const animatedValues = useRef(routes.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        const animations = routes.map((_, i) => {
            return Animated.timing(animatedValues[i], {
                toValue: i === currentIndex ? 1 : 0,
                duration: TAB_CONFIG.animation.duration,
                useNativeDriver: true,
                easing: Easing.bezier(0.4, 0, 0.2, 1), // Material Design easing
            });
        });

        Animated.parallel(animations).start();
    }, [currentIndex, routes]);

    const getAnimatedStyles = (index: number) => {
        const scale = animatedValues[index].interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [
                TAB_CONFIG.animation.scale.min,
                TAB_CONFIG.animation.scale.max * 1.1, // Slight overshoot
                TAB_CONFIG.animation.scale.max
            ],
        });

        const opacity = animatedValues[index].interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0.7, 1],
        });

        return { scale, opacity };
    };

    return { animatedValues, getAnimatedStyles };
}
