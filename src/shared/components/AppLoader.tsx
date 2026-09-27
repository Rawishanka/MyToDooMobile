/**
 * App-wide loading indicator — a native re-creation of the "Slide" three-dot loader
 * (matches the animation the client picked: three dots walking around an L-shaped
 * 2x2 grid, staggered). Replaces bare <ActivityIndicator /> everywhere so every
 * loading state in the app looks the same.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle } from 'react-native';

export interface AppLoaderProps {
  /** Overall box size in px — each dot is ~34% of this. Default 32 (same as the reference). */
  size?: number;
  /** Dot color — defaults to brand orange. */
  color?: string;
  style?: ViewStyle;
}

const DOT_RATIO = 0.34;
const GAP_RATIO = 0.2;
// Same 4 keyframe stops as the reference "slide" animation, as [x, y] fractions of `far`.
const STOPS: [number, number][] = [
  [1, 0],
  [1, 1],
  [0, 1],
  [0, 0],
];
const STOP_DURATION = 300; // ms per hop (matches ~1.2s / 4 stops loop, similar cadence to the reference)
const DOT_DELAY_FRACTION = 1 / 3; // 3 dots staggered evenly across one loop

function useDotPosition(far: number, delaySteps: number) {
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;

    const runLoop = () => {
      if (cancelled) return;
      // Build one full 4-stop loop, rotated by this dot's stagger offset.
      const sequence = STOPS.map((_, i) => {
        const stopIndex = (i + delaySteps) % STOPS.length;
        const [sx, sy] = STOPS[stopIndex];
        return Animated.parallel([
          Animated.timing(x, {
            toValue: sx * far,
            duration: STOP_DURATION,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(y, {
            toValue: sy * far,
            duration: STOP_DURATION,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]);
      });
      Animated.sequence(sequence).start(({ finished }) => {
        if (finished && !cancelled) runLoop();
      });
    };

    runLoop();
    return () => {
      cancelled = true;
      x.stopAnimation();
      y.stopAnimation();
    };
  }, [far, delaySteps, x, y]);

  return { x, y };
}

const Dot: React.FC<{ far: number; dotSize: number; margin: number; delaySteps: number; color: string }> = ({
  far,
  dotSize,
  margin,
  delaySteps,
  color,
}) => {
  const { x, y } = useDotPosition(far, delaySteps);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: margin,
        left: margin,
        width: dotSize,
        height: dotSize,
        borderRadius: dotSize / 2,
        backgroundColor: color,
        transform: [{ translateX: x }, { translateY: y }],
      }}
    />
  );
};

/** Brand three-dot loader. Use anywhere a spinner/ActivityIndicator was shown. */
export const AppLoader: React.FC<AppLoaderProps> = ({ size = 32, color = '#ff6b35', style }) => {
  const dotSize = size * DOT_RATIO;
  const gap = size * GAP_RATIO;
  const margin = (size - 2 * dotSize - gap) / 2;
  const far = dotSize + gap;

  return (
    <View style={[styles.root, { width: size, height: size }, style]}>
      <Dot far={far} dotSize={dotSize} margin={margin} delaySteps={0} color={color} />
      <Dot far={far} dotSize={dotSize} margin={margin} delaySteps={1} color={color} />
      <Dot far={far} dotSize={dotSize} margin={margin} delaySteps={2} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'relative',
  },
});

export default AppLoader;
