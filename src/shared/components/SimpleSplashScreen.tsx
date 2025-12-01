import MyToDooLogo from '@/assets/images/MyToDoo_logo.svg';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

interface SimpleSplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export default function SimpleSplashScreen({ 
  onFinish, 
  duration = 2500 
}: SimpleSplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Simple animation sequence for better APK performance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Finish animation
    const timer = setTimeout(() => {
      onFinish && onFinish();
    }, duration);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, duration, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar 
        backgroundColor="#004aad" 
        barStyle="light-content" 
        hidden={Platform.OS === 'ios'}
      />
      
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoBackground}>
          <MyToDooLogo
            width={120}
            height={120}
          />
        </View>
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
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    backgroundColor: '#0a2d5c',
    padding: 25,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
});