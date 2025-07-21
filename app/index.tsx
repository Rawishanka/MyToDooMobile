import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const WelcomeImage = require('@/assets/images/welcome.png')
export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      {/* Image Section */}
      {/* App Title */}
      <Text style={styles.title}>MyToDo</Text>
      <View style={styles.imageContainer}>
        {/* Replace with your actual image path or URL */}
        <Image 
          source={WelcomeImage}
          style={styles.image}
          resizeMode="contain"
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
    backgroundColor: '#0052CC', // Blue background
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageContainer: {
    flex: 4,
    justifyContent: 'center',
    paddingTop: 60,
  },
  image: {
    width: 250,
    height: 300,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: -40,
    fontFamily: 'sans-serif-condensed',
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
    backgroundColor: '#0052CC',
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
