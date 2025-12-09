import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
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
        <Ionicons name="arrow-back" size={isTablet ? 34 : 24} color="#000" />
      </TouchableOpacity>
      
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={isTablet ? 26 : 20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
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
    paddingHorizontal: isTablet ? wp('12.5%') : wp('4%'),
    paddingTop: isTablet ? hp('1.5%') : hp('1.2%'),
    paddingBottom: isTablet ? hp('1.5%') : hp('1.2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    marginBottom: isTablet ? hp('1.2%') : hp('1%'),
    padding: 4,
    borderRadius: 20,
    width: isTablet ? 40 : 32,
    height: isTablet ? 40 : 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: isTablet ? wp('2%') : wp('3%'),
    height: isTablet ? hp('4%') : hp('5.5%'),
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  searchIcon: {
    marginRight: 10,
    opacity: 0.7,
  },
  searchBar: {
    flex: 1,
    fontSize: RFValue(isTablet ? 13 : 16),
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
    fontSize: RFValue(isTablet ? 12 : 12),
    color: '#666',
    marginTop: 8,
    marginLeft: 6,
    fontStyle: 'italic',
    opacity: 0.8,
  },
});
