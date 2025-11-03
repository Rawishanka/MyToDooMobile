import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VideoCategoryProps {
  title: string;
  videoSource: any;
  onPress?: () => void;
}

export const VideoCategory: React.FC<VideoCategoryProps> = ({ 
  title, 
  videoSource, 
  onPress 
}) => {
  React.useEffect(() => {
    console.log(`📹 Rendering VideoCategory: ${title}`, videoSource);
  }, [title, videoSource]);

  return (
    <TouchableOpacity style={styles.gridItem} onPress={onPress}>
      <View style={styles.categoryVideo}>
        <Text style={styles.videoPlaceholder}>🎬</Text>
        <Text style={styles.videoLabel}>NEW</Text>
      </View>
      <Text style={styles.gridLabel}>{title}</Text>
      <Text style={styles.debugText}>✅ VIDEO COMPONENT</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gridItem: {
    backgroundColor: '#e8f0fe',
    borderRadius: 12,
    width: '42%',
    paddingVertical: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  categoryVideo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    fontSize: 20,
    color: '#fff',
  },
  videoLabel: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  gridLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  debugText: {
    fontSize: 10,
    color: 'red',
    fontWeight: 'bold',
    marginTop: 4,
  },
});