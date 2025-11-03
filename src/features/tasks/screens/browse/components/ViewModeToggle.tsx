import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface ViewModeToggleProps {
  viewMode: 'list' | 'map';
  onToggle: () => void;
}

export default function ViewModeToggle({ viewMode, onToggle }: ViewModeToggleProps) {
  return (
    <TouchableOpacity style={styles.viewToggle} onPress={onToggle}>
      <Ionicons 
        name={viewMode === 'list' ? 'map-outline' : 'list-outline'} 
        size={24} 
        color="#007bff" 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  viewToggle: {
    padding: 8,
  },
});
