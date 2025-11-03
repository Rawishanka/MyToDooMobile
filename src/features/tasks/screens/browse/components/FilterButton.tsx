import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface FilterButtonProps {
  activeFiltersCount: number;
  onPress: () => void;
}

export default function FilterButton({ activeFiltersCount, onPress }: FilterButtonProps) {
  return (
    <TouchableOpacity style={styles.filterBtn} onPress={onPress}>
      <MaterialCommunityIcons name="filter-variant" size={20} />
      <Text style={styles.filterText}>
        Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
