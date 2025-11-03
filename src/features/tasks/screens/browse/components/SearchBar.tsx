import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  visible: boolean;
  searchText: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
}

export default function SearchBar({ visible, searchText, onChangeText, onClose }: SearchBarProps) {
  if (!visible) return null;

  return (
    <View style={styles.searchContainer}>
      <TouchableOpacity onPress={onClose}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <TextInput
        style={styles.searchBar}
        placeholder="Search tasks..."
        value={searchText}
        onChangeText={onChangeText}
        autoFocus
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
});
