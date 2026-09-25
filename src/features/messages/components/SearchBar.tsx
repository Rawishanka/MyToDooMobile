// Search Bar Component

import { isTablet, wp } from '@/src/shared/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/src/shared/theme';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  placeholder = 'Search messages...' 
}) => {
  const { isDarkMode } = useTheme();
  const clearSearch = () => setSearchQuery('');
  
  return (
    <View style={[styles.searchContainer, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <View style={[styles.searchBox, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
        <Ionicons name="search" size={20} color={isDarkMode ? '#94A3B8' : '#003399'} style={styles.searchIcon} />
        
        <TextInput
          style={[styles.searchInput, isDarkMode && { color: '#F8FAFC' }]}
          placeholder={placeholder}
          placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: isTablet ? wp('12.5%') : 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: '#F4F6FB',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#0F172A',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 6,
  },
});
