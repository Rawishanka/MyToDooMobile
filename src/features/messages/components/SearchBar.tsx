// Search Bar Component

import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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
  const clearSearch = () => setSearchQuery('');
  
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: isTablet ? wp('12.5%') : wp('4%'),
    paddingVertical: isTablet ? hp('1.5%') : hp('1.2%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: isTablet ? 12 : 10,
    paddingHorizontal: isTablet ? wp('2%') : wp('2.5%'),
    height: isTablet ? hp('5.5%') : hp('4.5%'),
  },
  searchIcon: {
    marginRight: isTablet ? wp('1.5%') : wp('2%'),
  },
  searchInput: {
    flex: 1,
    fontSize: RFValue(isTablet ? 17 : 15),
    color: '#000',
    paddingVertical: 0,
  },
  clearButton: {
    padding: isTablet ? 6 : 4,
    marginLeft: isTablet ? wp('1%') : wp('1%'),
  },
});
