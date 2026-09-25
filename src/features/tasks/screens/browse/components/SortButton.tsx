import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/shared/theme';
import { RFValue } from '@/src/shared/utils/responsive';

interface SortButtonProps {
  onPress: () => void;
}

export default function SortButton({ onPress }: SortButtonProps) {
  const { isDarkMode } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.sortBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.iconChip, isDarkMode && { backgroundColor: '#0F172A' }]}>
        <Ionicons name="swap-vertical-outline" size={14} color={isDarkMode ? '#38BDF8' : '#FFFFFF'} />
      </View>
      <Text style={[styles.sortText, isDarkMode && { color: '#F8FAFC' }]}>Sort</Text>
      <Ionicons name="chevron-down" size={14} color={isDarkMode ? '#94A3B8' : '#003399'} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingLeft: 6,
    paddingRight: 12,
    height: 40,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#DCE3F5',
    shadowColor: '#001A66',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#003399',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortText: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#003399',
    letterSpacing: 0.2,
  },
});
