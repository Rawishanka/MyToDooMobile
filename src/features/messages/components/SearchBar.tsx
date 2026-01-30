// Search Bar Component

import { getIsTablet, hp, RFValue, wp } from '@/src/shared/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Platform, StyleSheet, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

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
  const { width, height } = useWindowDimensions();
  const isTablet = useMemo(() => getIsTablet(width, height), [width, height]);
  
  const clearSearch = () => setSearchQuery('');
  
  return (
    <View style={[
      styles.searchContainer,
      isTablet && { paddingHorizontal: wp('12.5%'), paddingVertical: hp('1.5%') }
    ]}>
      <View style={[
        styles.searchBox,
        isTablet && { borderRadius: 12, paddingHorizontal: wp('2%'), height: hp('5.5%') }
      ]}>
        <Ionicons 
          name="search" 
          size={20} 
          color="#8E8E93" 
          style={[styles.searchIcon, isTablet && { marginRight: wp('1.5%') }]} 
        />
        
        <TextInput
          style={[
            styles.searchInput,
            isTablet && { fontSize: RFValue(17) }
          ]}
          placeholder={placeholder}
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={clearSearch} 
            style={[styles.clearButton, isTablet && { padding: 6, marginLeft: wp('1%') }]}
          >
            <Ionicons name="close-circle" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.2%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: wp('2.5%'),
    height: hp('4.5%'),
  },
  searchIcon: {
    marginRight: wp('2%'),
  },
  searchInput: {
    flex: 1,
    fontSize: RFValue(15),
    color: '#000',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: wp('1%'),
  },
});
