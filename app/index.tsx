import FallingStars from '@/src/shared/components/FallingStars';
import { ResizeMode, Video } from 'expo-av';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const MyToDooLogo = require('@/assets/MyToDoo_logo.gif');
// TODO: Replace with actual cartoon/graphic asset for overlay
const CartoonShears = null; // e.g. require('@/assets/gardening_shears.png')

import { categoryVideos, getCategoryVideo } from '@/src/shared/utils/videoLoader';

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  useEffect(() => {
    console.log('🚀 WelcomeScreen: Component mounted, starting video timer...');
    
    // Start video rotation after a small delay to allow initial render
    const startTimer = setTimeout(() => {
      console.log('🎬 Starting video rotation...');
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const nextIndex = (prev + 1) % categoryVideos.length;
          setNextIndex((nextIndex + 1) % categoryVideos.length);
          return nextIndex;
        });
      }, 4000); // Increased interval for smoother experience
      return () => clearInterval(interval);
    }, 1000); // 1 second delay
    
    return () => {
      console.log('🛑 WelcomeScreen: Cleaning up timers...');
      clearTimeout(startTimer);
    };
  }, []);

  const currentCategory = categoryVideos[currentIndex];
  const nextCategory = categoryVideos[nextIndex];
  const currentVideo = getCategoryVideo(currentCategory.id);
  const nextVideo = getCategoryVideo(nextCategory.id);

  return (
    <SafeAreaView style={styles.container}>
      {/* Falling Stars Animation */}
      <FallingStars />
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={MyToDooLogo} style={styles.logoImage} resizeMode="contain" />
      </View>

      {/* Hero Category Video Card */}
      <View style={styles.heroContainer}>
        <View style={styles.heroVideoWrapper}>
          {currentVideo ? (
            <Video
              source={currentVideo}
              style={styles.heroVideo}
              shouldPlay
              isLooping
              isMuted
              useNativeControls={false}
              resizeMode={ResizeMode.CONTAIN}
              onError={(error) => {
                console.warn('Video error for', currentCategory.title, ':', error);
              }}
              onLoad={() => {
                setVideoLoaded(true);
              }}
            />
          ) : (
            <View style={styles.videoPlaceholder}>
              <Text style={styles.placeholderText}>{currentCategory.title}</Text>
            </View>
          )}
          
          {/* Preload next video for smooth transitions */}
          {nextVideo && nextVideo !== currentVideo && (
            <Video
              source={nextVideo}
              style={[styles.heroVideo, { opacity: 0, zIndex: -1 }]}
              shouldPlay={false}
              isLooping
              isMuted
              useNativeControls={false}
              resizeMode={ResizeMode.CONTAIN}
            />
          )}
        </View>
        {/* Show full category title below video */}
        <Text style={styles.fullCategoryTitle}>{currentCategory.title}</Text>
      </View>

      {/* Bottom Container */}
      <View style={styles.bottomContainer}>
        <Text style={styles.welcomeText}>Welcome to MyToDoo</Text>
        <Link href={"/(welcome-screen)/first-screen" as any} asChild>
          <TouchableOpacity style={styles.buttonPrimary} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity
          style={styles.buttonSecondary}
          activeOpacity={0.8}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004aad',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1.2,
    marginBottom: -10,
  },
  logoImage: {
    width: 480,
    height: 420,
  },
  welcomeText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  heroContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  heroVideoWrapper: {
    width: '80%', // Reduced width for better balance
    aspectRatio: 16 / 9, // Landscape aspect ratio to show full video content
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'transparent', // Changed from #0052CC to prevent blue flash
    marginBottom: 10,
    position: 'relative',
  },
  heroVideo: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'transparent', // Changed from #0052CC to prevent blue flash
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5', // Changed from #0052CC to a subtle gray
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#333', // Changed from #fff to dark text for gray background
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  fullCategoryTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 0,
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  bottomContainer: {
    flex: 1.3,
    width: '100%',
    backgroundColor: '#F0F0F0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 15,
  },
  buttonPrimary: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '90%',
    alignItems: 'center',
    borderRadius: 30,
    marginBottom: 16,
  },
  buttonSecondary: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '90%',
    alignItems: 'center',
    borderRadius: 30,
    marginTop: 0,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});