import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface SortButtonProps {
  onPress: () => void;
}

export default function SortButton({ onPress }: SortButtonProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.sortText}>Sort</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sortText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007bff',
  },
});
