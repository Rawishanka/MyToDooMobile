import { router } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const illustration = require('@/assets/images/illustration.png');

export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      {/* Back arrow */}
      <TouchableOpacity style={styles.backIcon} onPress={() => router.push('/')}>
        <ChevronLeft size={24} color="white" />
      </TouchableOpacity>

      {/* Progress dots */} 
      <View style={styles.dots}>
        <View style={styles.dotFilled} />
        <View style={styles.dotEmpty} />
        <View style={styles.dotEmpty} />
      </View>

      {/* Illustration */}
      <Image
        source={illustration} 
        style={styles.image}
        resizeMode="contain"
      />

      {/* Text */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>A job awaits every hand</Text>
        <Text style={styles.subtitle}>Whether you love building, designing, or problem-solving, there’s a job out there for you. Your next opportunity is waiting - don’t miss it!</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.signupButton} onPress={() => router.push('../signup-screen')}>
          <Text style={styles.signupText}>Sign up now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.arrowButton} onPress={() => router.push('/second-screen')}>
          <ChevronRight size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* API Test Button */}
      <View style={styles.testButtonContainer}>
        <TouchableOpacity style={styles.testButton} onPress={() => router.push('../auth-debug')}>
          <Text style={styles.testButtonText}>🐛 Debug Auth</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004aad', // Blue background
    padding: 20,
    justifyContent: 'space-between',
  },
  backIcon: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 2,
  },
  dots: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 60,
  },
  dotFilled: {
    width: 25,
    height: 6,
    backgroundColor: 'white',
    borderRadius: 5,
    marginHorizontal: 3,
  },
  dotEmpty: {
    width: 6,
    height: 6,
    backgroundColor: '#ccc',
    borderRadius: 3,
    marginHorizontal: 3,
  },
  image: {
    height: height * 0.4,
    width: '100%',
    alignSelf: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  signupButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupText: {
    color: '#004aad',
    fontWeight: '600',
    textAlign: 'center',
  },
  arrowButton: {
    backgroundColor: '#FF7A00',
    padding: 14,
    borderRadius: 50,
  },
  testButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});
