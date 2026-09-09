import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Video from 'react-native-video';
import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';

interface VideoCategoryCardProps {
  videoUrl: string;
  name: string;
  onPress: () => void;
}

export const VideoCategoryCard: React.FC<VideoCategoryCardProps> = ({
  videoUrl,
  name,
  onPress,
}) => {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setIsReady(false);
    setHasError(false);
  }, [videoUrl]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.videoContainer}>
        {!isReady && !hasError && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#003399" />
          </View>
        )}

        {hasError ? (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackInitial}>{name.charAt(0).toUpperCase()}</Text>
          </View>
        ) : (
          <Video
            source={{ uri: videoUrl }}
            style={[styles.video, { opacity: isReady ? 1 : 0 }]}
            resizeMode="cover"
            paused
            muted
            repeat={false}
            playInBackground={false}
            playWhenInactive={false}
            ignoreSilentSwitch="ignore"
            onLoad={() => setIsReady(true)}
            onError={() => setHasError(true)}
          />
        )}

        <View style={styles.playOverlay} pointerEvents="none">
          <Animated.View style={[styles.playCircle, { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons name="play" size={isTablet ? 24 : 20} color="#fff" style={styles.playIcon} />
          </Animated.View>
        </View>
      </View>
      <Text style={styles.label} numberOfLines={2}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: isTablet ? wp('18%') : wp('35%'),
    marginHorizontal: wp('1.5%'),
    alignItems: 'center',
  },
  videoContainer: {
    width: isTablet ? wp('18%') : wp('35%'),
    height: isTablet ? wp('18%') : wp('35%'),
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f3f6fb',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  fallbackContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8EFF9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackInitial: {
    fontSize: RFValue(isTablet ? 36 : 32),
    fontWeight: '800',
    color: '#003399',
    opacity: 0.2,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  playCircle: {
    width: isTablet ? 46 : 40,
    height: isTablet ? 46 : 40,
    borderRadius: isTablet ? 23 : 20,
    backgroundColor: 'rgba(0, 51, 153, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#003399',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  playIcon: {
    marginLeft: 3,
  },
  label: {
    fontSize: RFValue(isTablet ? 9 : 10),
    fontWeight: '700',
    color: '#1A237E',
    textAlign: 'center',
    marginTop: hp('0.8%'),
    lineHeight: RFValue(isTablet ? 11 : 13),
    paddingHorizontal: wp('0.5%'),
  },
});
