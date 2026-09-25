// Search Bar Component

import { HS } from '@/src/shared/theme/homeStyle';
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
        <Ionicons name="search" size={20} color={isDarkMode ? '#94A3B8' : HS.blue} style={styles.searchIcon} />
        
        <TextInput
          style={[styles.searchInput, isDarkMode && { color: '#F8FAFC' }]}
          placeholder={placeholder}
          placeholderTextColor={isDarkMode ? '#64748B' : HS.placeholder}
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
    backgroundColor: HS.page,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: HS.inputBorder,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: HS.blue,
    shadowOpacity: 0.08,
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
    color: HS.navy,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 6,
  },
});
