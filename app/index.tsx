import { ResizeMode, Video } from 'expo-av';
import { Link, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import { Dimensions, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');

// Import the local assets
const WelcomeVideo = require('@/assets/welcome-screen.mp4'); 
const LottieAnimation = require('@/assets/animations/lottie-animation.json');
// const WelcomeImage = require('@/assets/images/welcome.png'); // Keep as fallback

export default function WelcomeScreen() { 
  const router = useRouter();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [lottieLoaded, setLottieLoaded] = useState(false);
  const [lottieError, setLottieError] = useState(false);
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Lottie Animation Logo replacing title */}
      <View style={styles.logoContainer}>
        {/* Show Lottie animation if it loads successfully */}
        {!lottieError && (
          <LottieView
            source={LottieAnimation}
            style={styles.lottieAnimation}
            autoPlay={true}
            loop={false}
            speed={1}
            onAnimationFinish={() => {
              console.log('Lottie animation finished');
              setLottieLoaded(true);
            }}
            onAnimationFailure={(error) => {
              console.log('Lottie animation error:', error);
              setLottieError(true);
            }}
          />
        )}
        
        {/* Fallback text - show if animation fails or hasn't loaded */}
        {(lottieError || !lottieLoaded) && (
          <Text style={[
            styles.fallbackText,
            { opacity: lottieError ? 1 : 0.7 }
          ]}>
          </Text>
        )}
      </View>
      
      {/* Video/Image Section - Full Width */}
      <View style={styles.mediaContainer}>
        {/* Show fallback image while video is loading or if video fails */}
        {(!videoLoaded || videoError) && (
          <Image 
            style={styles.media}
            resizeMode={ResizeMode.COVER}
          />
        )}
        
        {/* Video Component with local asset - Full Width */}
        <Video
          source={WelcomeVideo}
          style={[
            styles.media, 
            { opacity: videoLoaded && !videoError ? 1 : 0 }
          ]}
          shouldPlay={true}
          isLooping={true}
          isMuted={true}
          useNativeControls={false}
          resizeMode={ResizeMode.COVER}
          onLoad={() => {
            console.log('Video loaded successfully');
            setVideoLoaded(true);
            setVideoError(false);
          }}
          onError={(error: any) => {
            console.log('Video error:', error);
            setVideoError(true);
            setVideoLoaded(false);
          }}
        />
      </View>

      {/* Bottom Container */}
      <View style={styles.bottomContainer}>
        <Link href={"/(welcome-screen)/first-screen"} asChild>
          <TouchableOpacity style={styles.buttonPrimary} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Get Start</Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity
          style={styles.buttonSecondary}
          activeOpacity={0.8}
          onPress={() => router.replace('/login-screen')}
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
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  lottieAnimation: { 
    width: 250,
    height: 250, 
    backgroundColor: 'rgba(255,255,255,0.1)', // Temporary background to see the container
  },
  fallbackText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    position: 'absolute',
    fontFamily: 'sans-serif-condensed',
  },
  mediaContainer: {
    flex: 3,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0, // Remove horizontal padding
  },
  media: {
    width: screenWidth, // Full screen width
    height: 300,
    maxWidth: '100%',
    borderRadius:20
  },
  bottomContainer: {
    flex: 2,
    width: '100%',
    backgroundColor: '#F0F0F0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 0,
  },
  buttonPrimary: {
    backgroundColor: '#0052CC',
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '90%',
    alignItems: 'center',
    borderRadius: 30,
    marginBottom: 32,
  },
  buttonSecondary: {
    backgroundColor: '#103464',
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '90%',
    alignItems: 'center',
    borderRadius: 30,
    marginTop: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});