import MyToDooSvgLogoBox from '@/src/shared/components/MyToDooSvgLogoBox';
import { MYTDOO_BRAND_BLUE } from '@/src/shared/components/MyToDooBrandLogo';
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

    const timer = setTimeout(() => {
      onFinish && onFinish();
    }, duration);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, duration, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar 
        backgroundColor={MYTDOO_BRAND_BLUE} 
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
        <MyToDooSvgLogoBox variant="splash" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MYTDOO_BRAND_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
