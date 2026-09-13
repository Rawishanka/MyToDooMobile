import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

export interface AnimatedFireFlameProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * AnimatedFireFlame
 * Ultra-realistic, organic burning flame:
 * - Natural 3-tone gradient flame curvature (crimson base -> bright amber -> glowing gold/white core)
 * - Subtle, calm organic breathing & gentle flicker (NO artificial blurry halos, NO fake floating noise dots)
 * - Matches the authentic clean aesthetic of the iOS/App Store brand flame
 */
export const AnimatedFireFlame: React.FC<AnimatedFireFlameProps> = ({
  size = 24,
  style,
}) => {
  const scaleY = useRef(new Animated.Value(1)).current;
  const scaleX = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const innerFlicker = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Gentle, natural flame breathing (calm, organic flicker like a candle / torch flame)
    const flameCycle = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleY, {
            toValue: 1.06,
            duration: 380,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scaleX, {
            toValue: 0.97,
            duration: 380,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -1,
            duration: 380,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 1,
            duration: 380,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleY, {
            toValue: 0.98,
            duration: 320,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scaleX, {
            toValue: 1.03,
            duration: 320,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0.4,
            duration: 320,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: -0.8,
            duration: 320,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleY, {
            toValue: 1.03,
            duration: 350,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scaleX, {
            toValue: 0.98,
            duration: 350,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -0.6,
            duration: 350,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 0.5,
            duration: 350,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleY, {
            toValue: 1,
            duration: 300,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scaleX, {
            toValue: 1,
            duration: 300,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 0,
            duration: 300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // 2. Subtle internal glow pulse
    const innerPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(innerFlicker, {
          toValue: 0.88,
          duration: 260,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(innerFlicker, {
          toValue: 1,
          duration: 290,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    flameCycle.start();
    innerPulse.start();

    return () => {
      flameCycle.stop();
      innerPulse.stop();
    };
  }, []);

  const spin = rotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-1.5deg', '0deg', '1.5deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size * 1.18 }, style]}>
      <Animated.View
        style={[
          styles.flameWrapper,
          {
            transform: [
              { translateY },
              { scaleY },
              { scaleX },
              { rotate: spin },
            ],
          },
        ]}
      >
        <Svg
          width={size}
          height={size * 1.18}
          viewBox="0 0 100 120"
          fill="none"
        >
          <Defs>
            {/* Outer Flame Gradient: Deep fiery red-orange base to luminous amber tip */}
            <LinearGradient id="realFlameOuter" x1="50%" y1="100%" x2="50%" y2="0%">
              <Stop offset="0%" stopColor="#E52D00" stopOpacity="1" />
              <Stop offset="25%" stopColor="#FF4D00" stopOpacity="1" />
              <Stop offset="65%" stopColor="#FF8500" stopOpacity="1" />
              <Stop offset="95%" stopColor="#FFB300" stopOpacity="1" />
            </LinearGradient>

            {/* Mid Flame Gradient: Vibrant golden orange to bright yellow */}
            <LinearGradient id="realFlameMid" x1="50%" y1="100%" x2="50%" y2="0%">
              <Stop offset="0%" stopColor="#FF6B00" stopOpacity="1" />
              <Stop offset="40%" stopColor="#FFA600" stopOpacity="1" />
              <Stop offset="85%" stopColor="#FFDE00" stopOpacity="1" />
            </LinearGradient>

            {/* Core Hot Heart Gradient: Warm sun gold to luminous white */}
            <LinearGradient id="realFlameCore" x1="50%" y1="100%" x2="50%" y2="0%">
              <Stop offset="0%" stopColor="#FFC700" stopOpacity="0.95" />
              <Stop offset="55%" stopColor="#FFF275" stopOpacity="0.98" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* 1. Main Realistic Flame Contour */}
          <Path
            d="M50 4 C51 14 58 24 67 35 C77 47 84 61 82 77 C80 95 65 112 48 112 C30 112 16 95 16 77 C16 60 27 45 34 33 C37 28 38 21 36 14 C41 20 46 27 46 35 C46 39 44 43 42 46 C40 50 38 54 39 58 C41 64 49 67 52 61 C55 53 52 43 51 34 C50 23 49 13 50 4 Z"
            fill="url(#realFlameOuter)"
          />

          {/* 2. Secondary Inner Flickering Layer */}
          <Path
            d="M50 30 C52 38 58 46 62 55 C67 64 68 74 66 84 C63 94 54 103 47 103 C39 103 30 95 29 84 C28 73 34 63 39 54 C42 49 43 43 42 38 C45 43 48 49 47 55 C47 58 44 61 46 65 C48 68 53 68 55 64 C57 58 53 51 52 44 C51 38 50 33 50 30 Z"
            fill="url(#realFlameMid)"
          />

          {/* 3. Core Hot White-Yellow Center */}
          <Path
            d="M49 56 C51 63 54 69 57 75 C60 80 61 86 59 92 C57 98 52 102 47 102 C42 102 37 98 37 92 C37 85 40 80 43 75 C45 70 46 64 47 59 C49 62 49 66 50 69 C51 71 53 71 54 69 C55 65 52 61 51 58 C50 57 49 56 49 56 Z"
            fill="url(#realFlameCore)"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  flameWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AnimatedFireFlame;
