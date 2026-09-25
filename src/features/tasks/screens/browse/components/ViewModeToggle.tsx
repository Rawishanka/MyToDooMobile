import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface ViewModeToggleProps {
  viewMode: 'list' | 'map';
  onToggle: () => void;
}

export default function ViewModeToggle({ viewMode, onToggle }: ViewModeToggleProps) {
  return (
    <TouchableOpacity style={styles.viewToggle} onPress={onToggle} activeOpacity={0.75}>
      <Ionicons
        name={viewMode === 'list' ? 'map-outline' : 'list-outline'}
        size={20}
        color="#FFFFFF"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Translucent pill on the blue header band (same treatment as sub-screen back controls)
  viewToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
