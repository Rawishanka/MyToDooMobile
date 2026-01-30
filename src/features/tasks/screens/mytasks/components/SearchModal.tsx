import { getIsTablet, hp, RFValue, wp } from '@/src/shared/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

interface SearchBarProps {
  visible: boolean;
  searchText: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
}

export default function SearchBar({ visible, searchText, onChangeText, onClose }: SearchBarProps) {
  const { width, height } = useWindowDimensions();
  const isTablet = useMemo(() => getIsTablet(width, height), [width, height]);

  if (!visible) return null;

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={[
      styles.searchContainer,
      isTablet && { 
        paddingHorizontal: wp('12.5%'),
        paddingTop: hp('1.5%'),
        paddingBottom: hp('1.5%')
      }
    ]}>
      <TouchableOpacity 
        onPress={onClose} 
        style={[
          styles.backButton,
          isTablet && { marginBottom: hp('1.2%'), width: 40, height: 40 }
        ]}
      >
        <Ionicons name="arrow-back" size={isTablet ? 34 : 24} color="#000" />
      </TouchableOpacity>
      
      <View style={[
        styles.searchInputContainer,
        isTablet && { paddingHorizontal: wp('2%'), height: hp('4%') }
      ]}>
        <Ionicons name="search" size={isTablet ? 26 : 20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={[
            styles.searchBar,
            isTablet && { fontSize: RFValue(13) }
          ]}
          placeholder="Search by title, location, category..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={onChangeText}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          enablesReturnKeyAutomatically={true}
          blurOnSubmit={false}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={isTablet ? 28 : 20} color="#666" />
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
    paddingHorizontal: wp('4%'),
    paddingTop: hp('1.2%'),
    paddingBottom: hp('1.2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    marginBottom: hp('1%'),
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
    paddingHorizontal: wp('3%'),
    height: hp('5.5%'),
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  searchIcon: {
    marginRight: 10,
    opacity: 0.7,
  },
  searchBar: {
    flex: 1,
    fontSize: RFValue(16),
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
    fontSize: RFValue(12),
    color: '#666',
    marginTop: 8,
    marginLeft: 6,
    fontStyle: 'italic',
    opacity: 0.8,
  },
});
