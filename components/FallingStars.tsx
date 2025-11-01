import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StarProps {
  delay: number;
  duration: number;
  startX: number;
}

const Star: React.FC<StarProps> = ({ delay, duration, startX }) => {
  const translateY = useRef(new Animated.Value(-50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT + 50,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.6,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: duration - 500,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(translateY, {
          toValue: -50,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [delay, duration, translateY, opacity]);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: startX,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.starInner} />
    </Animated.View>
  );
};

export default function FallingStars() {
  // Generate random stars with different properties
  const stars = Array.from({ length: 15 }, (_, index) => ({
    id: index,
    delay: Math.random() * 4000, // Random delay up to 4 seconds
    duration: 6000 + Math.random() * 4000, // Duration between 6-10 seconds
    startX: Math.random() * SCREEN_WIDTH, // Random horizontal position
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {stars.map((star) => (
        <Star
          key={star.id}
          delay={star.delay}
          duration={star.duration}
          startX={star.startX}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  star: {
    position: 'absolute',
    width: 4,
    height: 4,
  },
  starInner: {
    width: 4,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
});
