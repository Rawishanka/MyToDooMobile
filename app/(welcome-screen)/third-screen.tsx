import { router } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const illustration = require('@/assets/images/third_screen.png');

export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      {/* Back arrow */}
      <TouchableOpacity style={styles.backIcon} onPress={() => router.push('/second-screen')}>
        <ChevronLeft size={24} color="white" />
      </TouchableOpacity>

      {/* Progress dots */}
      <View style={styles.dots}>
        <View style={styles.dotEmpty} />
        <View style={styles.dotEmpty} />
        <View style={styles.dotFilled} />
      </View>

      {/* Illustration */}
      <Image
        source={illustration} 
        style={styles.image}
        resizeMode="contain"
      />

      {/* Text */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Release payment once the MyToDoo task is complete</Text>
        <Text style={styles.subtitle}>Your funds are held till the MyToDoo task is complete and you release payment.</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.signupButton}>
          <Text style={styles.signupText}>Sign up now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.arrowButton} onPress={() => router.push('/title-screen')}>
          <ChevronRight size={24} color="#fff" />
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
    color: '#0047AB',
    fontWeight: '600',
    textAlign: 'center',
  },
  arrowButton: {
    backgroundColor: '#FF7A00',
    padding: 14,
    borderRadius: 50,
  },
});
