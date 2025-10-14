import { ResizeMode, Video } from 'expo-av';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

export default function VideoTest() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Video Test Screen</Text>
      
      <Text style={styles.subtitle}>Testing: Carpentry Video</Text>
      <Video
        style={styles.video}
        source={require('@/assets/carpentry.mp4')}
        resizeMode={ResizeMode.COVER}
        shouldPlay={true}
        isLooping={true}
        isMuted={true}
        onLoad={() => console.log('✅ TEST: Carpentry video loaded')}
        onError={(error) => console.log('❌ TEST: Carpentry video error:', error)}
      />
      
      <Text style={styles.subtitle}>Testing: Plumbing Video</Text>
      <Video
        style={styles.video}
        source={require('@/assets/plumbing.mp4')}
        resizeMode={ResizeMode.COVER}
        shouldPlay={true}
        isLooping={true}
        isMuted={true}
        onLoad={() => console.log('✅ TEST: Plumbing video loaded')}
        onError={(error) => console.log('❌ TEST: Plumbing video error:', error)}
      />
      
      <Text style={styles.subtitle}>Testing: Auto Mechanic Video</Text>
      <Video
        style={styles.video}
        source={require('@/assets/auto-mechanic.mp4')}
        resizeMode={ResizeMode.COVER}
        shouldPlay={true}
        isLooping={true}
        isMuted={true}
        onLoad={() => console.log('✅ TEST: Auto Mechanic video loaded')}
        onError={(error) => console.log('❌ TEST: Auto Mechanic video error:', error)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
  },
  video: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    marginBottom: 20,
  },
});