import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  visible: boolean;
  searchText: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
}

export default function SearchBar({ visible, searchText, onChangeText, onClose }: SearchBarProps) {
  if (!visible) return null;

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={styles.searchContainer}>
      <TouchableOpacity onPress={onClose} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search by title, location, category..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={onChangeText}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      
      {searchText.length > 0 && (
        <Text style={styles.searchInfo}>
          Searching across all fields...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    marginBottom: 10,
    padding: 4,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  searchIcon: {
    marginRight: 10,
    opacity: 0.7,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 0,
    height: '100%',
  },
  clearButton: {
    padding: 6,
    marginLeft: 6,
    borderRadius: 12,
  },
  searchInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginLeft: 6,
    fontStyle: 'italic',
    opacity: 0.8,
  },
});
