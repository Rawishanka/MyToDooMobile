import MyToDooLogo from '@/assets/images/MyToDoo_logo.svg';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface ProfessionalSplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export default function ProfessionalSplashScreen({ 
  onFinish, 
  duration = 3000 
}: ProfessionalSplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    // Hide StatusBar for fullscreen splash experience
    if (Platform.OS === 'ios') {
      StatusBar.setHidden(true, 'fade');
    }

    // Main animation sequence
    const animationSequence = Animated.sequence([
      // Initial fade in and scale up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Gentle rotation for dynamic effect
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    // Pulse animation for loading effect
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    // Start animations with a slight delay for smoother transition
    const startTimer = setTimeout(() => {
      animationSequence.start(() => {
        setShowPulse(true);
        pulseAnimation.start();
      });
    }, 300);

    // Finish animation after duration
    const finishTimer = setTimeout(() => {
      if (Platform.OS === 'ios') {
        StatusBar.setHidden(false, 'fade');
      }
      onFinish && onFinish();
    }, duration);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(finishTimer);
      pulseAnimation.stop();
    };
  }, [fadeAnim, scaleAnim, rotateAnim, pulseAnim, duration, onFinish]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar 
        backgroundColor="#004aad" 
        barStyle="light-content" 
        hidden={Platform.OS === 'ios'}
      />
      
      {/* Background with subtle gradient effect */}
      <View style={styles.backgroundOverlay} />
      
      {/* Animated floating elements - optimized for performance */}
      <Animated.View style={[styles.floatingElement1, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.floatingElement2, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.floatingElement3, { opacity: fadeAnim }]} />

      {/* Main logo container with animated background */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { rotate: spin },
            ],
          },
        ]}
      >
        {/* Dark blue background box for logo visibility */}
        <View style={styles.logoBackground}>
          <MyToDooLogo
            width={120}
            height={120}
          />
        </View>
      </Animated.View>

      {/* Loading animation dots */}
      {showPulse && (
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Animated.View style={[styles.loadingDot, styles.dot1, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.loadingDot, styles.dot2, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.loadingDot, styles.dot3, { opacity: pulseAnim }]} />
        </Animated.View>
      )}

      {/* Animated progress indicator */}
      <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.progressBar, { transform: [{ scaleX: scaleAnim }] }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004aad',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 74, 173, 0.95)',
  },
  floatingElement1: {
    position: 'absolute',
    top: height * 0.15,
    left: width * 0.1,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  floatingElement2: {
    position: 'absolute',
    top: height * 0.25,
    right: width * 0.15,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  floatingElement3: {
    position: 'absolute',
    bottom: height * 0.2,
    left: width * 0.2,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 80,
  },
  logoBackground: {
    backgroundColor: '#0a2d5c',
    padding: 25,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 25,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    marginHorizontal: 8,
  },
  dot1: {
    backgroundColor: '#ffffff',
  },
  dot2: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  dot3: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 80,
    left: 40,
    right: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
    width: '100%',
  },
});