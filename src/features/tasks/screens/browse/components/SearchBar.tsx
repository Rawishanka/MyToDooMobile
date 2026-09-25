import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';

interface SearchBarProps {
  visible: boolean;
  searchText: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  onSubmit?: () => void;
}

export default function SearchBar({ visible, searchText, onChangeText, onClose, onSubmit }: SearchBarProps) {
  const { isDarkMode } = useTheme();

  if (!visible) return null;

  const handleClear = () => {
    onChangeText('');
  };

  const handleSearch = () => {
    if (onSubmit) {
      onSubmit();
    }
  };

  const handleTextChange = (text: string) => {
    onChangeText(text);
  };

  return (
    <View style={[
      styles.searchContainer,
      isDarkMode && { backgroundColor: '#0B1120', borderBottomColor: '#1E293B' }
    ]}>
      <TouchableOpacity onPress={onClose} style={[styles.backButton, isDarkMode && { backgroundColor: '#1E293B' }]} activeOpacity={0.75}>
        <Ionicons name="arrow-back" size={20} color={isDarkMode ? '#F8FAFC' : '#FFFFFF'} />
      </TouchableOpacity>
      
      <View style={[
        styles.searchInputContainer,
        isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1 }
      ]}>
        <Ionicons name="search" size={20} color={isDarkMode ? '#94A3B8' : '#003399'} style={styles.searchIcon} />
        <TextInput
          style={[
            styles.searchBar,
            isDarkMode && { color: '#F8FAFC' }
          ]}
          placeholder="Search by title, location, category..."
          placeholderTextColor={isDarkMode ? '#64748B' : '#999'}
          value={searchText}
          onChangeText={handleTextChange}
          onSubmitEditing={handleSearch}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          enablesReturnKeyAutomatically={true}
          blurOnSubmit={false}
        />
        {searchText.length > 0 && (
          <>
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSearch} style={[styles.searchButton, isDarkMode && { backgroundColor: '#0F172A' }]}>
              <Ionicons name="search" size={16} color={isDarkMode ? '#38BDF8' : '#FFFFFF'} />
            </TouchableOpacity>
          </>
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
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.18)',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    fontSize: RFValue(15),
    color: '#0F172A',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  searchButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    borderRadius: 10,
    backgroundColor: '#ff6b35',
  },
  searchInfo: {
    fontSize: RFValue(12),
    color: 'rgba(255,255,255,0.75)',
    marginTop: 10,
    marginLeft: 4,
  },
});
