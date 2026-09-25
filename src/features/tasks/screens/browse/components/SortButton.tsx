import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from '@/src/shared/utils/responsive';

interface SortButtonProps {
  onPress: () => void;
}

export default function SortButton({ onPress }: SortButtonProps) {
  return (
    <TouchableOpacity style={styles.sortBtn} onPress={onPress} activeOpacity={0.75}>
      <Ionicons name="swap-vertical-outline" size={16} color="#003399" />
      <Text style={styles.sortText}>Sort</Text>
      <Ionicons name="chevron-down" size={13} color="#6B7280" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    gap: 5,
    borderWidth: 1.5,
    borderColor: '#E0E7FF',
    shadowColor: '#003399',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sortText: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#003399',
    letterSpacing: 0.2,
  },
});
