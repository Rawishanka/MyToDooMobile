import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/src/shared/theme';
import { HS } from '@/src/shared/theme/homeStyle';

interface SearchBarProps {
  visible: boolean;
  searchText: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
}

export default function SearchBar({ visible, searchText, onChangeText, onClose }: SearchBarProps) {
  const { isDarkMode } = useTheme();

  if (!visible) return null;

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={[
      styles.searchContainer,
      isDarkMode && { backgroundColor: '#0B1120', borderBottomColor: '#1E293B' }
    ]}>
      <TouchableOpacity onPress={onClose} style={styles.backButton}>
        <Ionicons name="arrow-back" size={isTablet ? 34 : 24} color={isDarkMode ? '#F8FAFC' : HS.blue} />
      </TouchableOpacity>
      
      <View style={[
        styles.searchInputContainer,
        isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }
      ]}>
        <Ionicons name="search" size={isTablet ? 26 : 20} color={isDarkMode ? '#94A3B8' : HS.blue} style={styles.searchIcon} />
        <TextInput
          style={[
            styles.searchBar,
            isDarkMode && { color: '#F8FAFC' }
          ]}
          placeholder="Search by title, location, category..."
          placeholderTextColor={isDarkMode ? '#64748B' : HS.placeholder}
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
            <Ionicons name="close-circle" size={isTablet ? 28 : 20} color={isDarkMode ? '#94A3B8' : HS.muted} />
          </TouchableOpacity>
        )}
      </View>
      
      {searchText.length > 0 && (
        <Text style={[
          styles.searchInfo,
          isDarkMode && { color: '#94A3B8' }
        ]}>
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
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: HS.cardBorder,
    shadowColor: HS.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    marginBottom: isTablet ? hp('1.2%') : hp('1%'),
    padding: 4,
    borderRadius: 12,
    backgroundColor: HS.tint,
    width: isTablet ? 40 : 36,
    height: isTablet ? 40 : 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HS.page,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: isTablet ? 52 : 48,
    borderWidth: 1.5,
    borderColor: HS.inputBorder,
  },
  searchIcon: {
    marginRight: 10,
    opacity: 0.7,
  },
  searchBar: {
    flex: 1,
    fontSize: RFValue(isTablet ? 13 : 16),
    color: HS.navy,
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
    color: HS.muted,
    marginTop: 8,
    marginLeft: 6,
    fontStyle: 'italic',
    opacity: 0.8,
  },
});
