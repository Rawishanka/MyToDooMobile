import { ResizeMode, Video } from 'expo-av';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');

// Import the local assets
const WelcomeVideo = require('@/assets/welcome-screen.mp4'); 
const MyToDooLogo = require('@/assets/MyToDoo_logo.gif');
// const WelcomeImage = require('@/assets/images/welcome.png'); // Keep as fallback

export default function WelcomeScreen() { 
  const router = useRouter();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  
  return (
    <SafeAreaView style={styles.container}>
      {/* MyToDoo Logo GIF */}
      <View style={styles.logoContainer}>
        <Image
          source={MyToDooLogo}
          style={styles.logoImage}
          resizeMode="contain"
          onLoad={() => {
            console.log('Logo loaded successfully');
            setLogoLoaded(true);
            setLogoError(false);
          }}
          onError={(error) => {
            console.log('Logo error:', error);
            setLogoError(true);
            setLogoLoaded(false);
          }}
        />
        
        {/* Fallback text - show if logo fails to load */}
        {logoError && (
          <Text style={styles.fallbackText}>
            MyToDoo
          </Text>
        )}
      </View>
      
      {/* Video/Image Section - Full Width */}
      <View style={styles.mediaContainer}>
        {/* Show fallback image while video is loading or if video fails */}
        {(!videoLoaded || videoError) && (
          <Image 
            style={styles.media}
            resizeMode="contain"
          />
        )}
        
        {/* Video Component with local asset - Properly sized with rounded corners */}
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
          resizeMode={ResizeMode.CONTAIN}
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
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoImage: { 
    width: 200,
    height: 150, 
  },
  fallbackText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0052CC',
    fontFamily: 'sans-serif-condensed',
  },
  mediaContainer: {
    flex: 3,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10, // Add horizontal padding
  },
  media: {
    width: '95%', // Reduced width
    height: 250, // Reduced height
    borderRadius: 20,
    overflow: 'hidden', // Ensures rounded corners work properly
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