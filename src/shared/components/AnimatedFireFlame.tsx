import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

export interface AnimatedFireFlameProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * AnimatedFireFlame
 * High-performance, realistic burning flame with:
 * - Multi-layered SVG gradient flames (outer fiery red/orange, mid vivid amber, core white-hot ember)
 * - Organic flickering & breathing micro-animations (scale, sway, vertical flicker)
 * - Pulsing fiery glow halo
 * - Floating spark / ember particles that rise and fade
 */
export const AnimatedFireFlame: React.FC<AnimatedFireFlameProps> = ({
  size = 26,
  style,
}) => {
  // Main flame flicker & breath
  const scaleY = useRef(new Animated.Value(1)).current;
  const scaleX = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.65)).current;

  // Floating embers / sparks
  const ember1Y = useRef(new Animated.Value(0)).current;
  const ember1X = useRef(new Animated.Value(0)).current;
  const ember1Opacity = useRef(new Animated.Value(0)).current;

  const ember2Y = useRef(new Animated.Value(0)).current;
  const ember2X = useRef(new Animated.Value(0)).current;
  const ember2Opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Organic Flame Breathing & Vertical Flicker
    const flameFlicker = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleY, {
            toValue: 1.12,
            duration: 180,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(scaleX, {
            toValue: 0.94,
            duration: 180,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -1.5,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 1,
            duration: 180,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.95,
            duration: 180,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleY, {
            toValue: 0.96,
            duration: 140,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(scaleX, {
            toValue: 1.05,
            duration: 140,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0.5,
            duration: 140,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: -1,
            duration: 140,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.55,
            duration: 140,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleY, {
            toValue: 1.08,
            duration: 220,
            easing: Easing.bezier(0.3, 0.1, 0.3, 1),
            useNativeDriver: true,
          }),
          Animated.timing(scaleX, {
            toValue: 0.96,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 0.5,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.85,
            duration: 220,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleY, {
            toValue: 1,
            duration: 160,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(scaleX, {
            toValue: 1,
            duration: 160,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 160,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 0,
            duration: 160,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.65,
            duration: 160,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // 2. Ember 1 loop (rising spark left side)
    const ember1Animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ember1Y, {
            toValue: -size * 0.7,
            duration: 650,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(ember1X, {
            toValue: -size * 0.22,
            duration: 650,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(ember1Opacity, {
              toValue: 0.9,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(ember1Opacity, {
              toValue: 0,
              duration: 450,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(ember1Y, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(ember1X, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(ember1Opacity, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );

    // 3. Ember 2 loop (rising spark right side with offset)
    const ember2Animation = Animated.loop(
      Animated.sequence([
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(ember2Y, {
            toValue: -size * 0.85,
            duration: 720,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(ember2X, {
            toValue: size * 0.24,
            duration: 720,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(ember2Opacity, {
              toValue: 0.95,
              duration: 220,
              useNativeDriver: true,
            }),
            Animated.timing(ember2Opacity, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(ember2Y, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(ember2X, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(ember2Opacity, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );

    flameFlicker.start();
    ember1Animation.start();
    ember2Animation.start();

    return () => {
      flameFlicker.stop();
      ember1Animation.stop();
      ember2Animation.stop();
    };
  }, [size]);

  const spin = rotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-3.5deg', '0deg', '3.5deg'],
  });

  const emberSize = Math.max(3, Math.round(size * 0.12));

  return (
    <View style={[styles.wrapper, { width: size, height: size * 1.2 }, style]}>
      {/* Dynamic Fiery Back Glow */}
      <Animated.View
        style={[
          styles.glowLayer,
          {
            width: size * 0.9,
            height: size * 0.9,
            borderRadius: size * 0.45,
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Floating ember 1 */}
      <Animated.View
        style={[
          styles.ember,
          {
            width: emberSize,
            height: emberSize,
            borderRadius: emberSize / 2,
            bottom: size * 0.35,
            left: size * 0.4,
            opacity: ember1Opacity,
            transform: [{ translateX: ember1X }, { translateY: ember1Y }],
          },
        ]}
      />

      {/* Floating ember 2 */}
      <Animated.View
        style={[
          styles.ember,
          styles.emberAlt,
          {
            width: emberSize * 0.85,
            height: emberSize * 0.85,
            borderRadius: (emberSize * 0.85) / 2,
            bottom: size * 0.35,
            right: size * 0.38,
            opacity: ember2Opacity,
            transform: [{ translateX: ember2X }, { translateY: ember2Y }],
          },
        ]}
      />

      {/* Main Flame SVG with animated scale/sway */}
      <Animated.View
        style={[
          styles.flameContainer,
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
            {/* Outer Flame Gradient: Burning Deep Crimson/Orange to Vivid Amber */}
            <LinearGradient id="outerFlameGrad" x1="50%" y1="100%" x2="50%" y2="0%">
              <Stop offset="0%" stopColor="#D82600" stopOpacity="1" />
              <Stop offset="30%" stopColor="#FF4500" stopOpacity="1" />
              <Stop offset="70%" stopColor="#FF7A00" stopOpacity="1" />
              <Stop offset="100%" stopColor="#FFAE00" stopOpacity="1" />
            </LinearGradient>

            {/* Middle Flame Gradient: Bright Orange to Radiant Yellow */}
            <LinearGradient id="midFlameGrad" x1="50%" y1="100%" x2="50%" y2="0%">
              <Stop offset="0%" stopColor="#FF5E00" stopOpacity="1" />
              <Stop offset="50%" stopColor="#FF9900" stopOpacity="1" />
              <Stop offset="100%" stopColor="#FFDE00" stopOpacity="1" />
            </LinearGradient>

            {/* Inner Core Hot Flame: Golden Sun to Ultra-Bright White Hot */}
            <LinearGradient id="innerCoreGrad" x1="50%" y1="100%" x2="50%" y2="0%">
              <Stop offset="0%" stopColor="#FFB300" stopOpacity="1" />
              <Stop offset="50%" stopColor="#FFF066" stopOpacity="1" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* 1. Outer Flame Silhouette */}
          <Path
            d="M50 2 C52 14 62 26 70 36 C80 48 88 62 86 78 C84 96 68 114 49 114 C30 114 14 96 14 77 C14 59 26 44 34 32 C37 28 39 20 37 12 C42 18 47 26 47 34 C47 38 45 42 43 45 C41 48 39 52 40 56 C42 63 51 66 54 60 C58 52 54 42 53 34 C51 22 50 11 50 2 Z"
            fill="url(#outerFlameGrad)"
          />

          {/* 2. Middle Vibrant Fiery Layer */}
          <Path
            d="M51 25 C53 34 60 43 65 52 C71 62 72 73 70 84 C67 96 56 106 48 106 C38 106 28 97 27 84 C26 72 32 62 38 52 C41 47 43 41 42 35 C46 41 49 48 48 55 C48 59 45 62 47 66 C49 70 55 70 57 65 C59 58 55 50 54 42 C52 35 51 29 51 25 Z"
            fill="url(#midFlameGrad)"
          />

          {/* 3. Inner White-Hot Core Flame */}
          <Path
            d="M50 50 C52 58 56 64 59 70 C63 76 64 83 62 90 C60 97 54 102 48 102 C42 102 36 97 36 90 C36 82 40 76 43 70 C46 64 47 58 48 52 C50 56 50 60 51 64 C52 67 55 67 56 64 C57 59 54 55 52 52 C51 51 50 50 50 50 Z"
            fill="url(#innerCoreGrad)"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'visible',
    position: 'relative',
  },
  glowLayer: {
    position: 'absolute',
    bottom: 2,
    backgroundColor: '#FF5E00',
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  ember: {
    position: 'absolute',
    backgroundColor: '#FFE57F',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 4,
  },
  emberAlt: {
    backgroundColor: '#FFAB40',
    shadowColor: '#FF6D00',
  },
  flameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AnimatedFireFlame;
