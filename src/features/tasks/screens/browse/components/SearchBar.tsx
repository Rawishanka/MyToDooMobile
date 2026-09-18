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
      <TouchableOpacity onPress={onClose} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#F8FAFC' : '#000'} />
      </TouchableOpacity>
      
      <View style={[
        styles.searchInputContainer,
        isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1 }
      ]}>
        <Ionicons name="search" size={20} color={isDarkMode ? '#94A3B8' : '#666'} style={styles.searchIcon} />
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
              <Ionicons name="close-circle" size={20} color={isDarkMode ? '#94A3B8' : '#666'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSearch} style={[styles.searchButton, isDarkMode && { backgroundColor: '#0F172A' }]}>
              <Ionicons name="search" size={20} color={isDarkMode ? '#38BDF8' : '#007AFF'} />
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
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    fontSize: RFValue(16),
    color: '#000',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  searchButton: {
    padding: 6,
    marginLeft: 4,
    borderRadius: 12,
    backgroundColor: '#E8F4FF',
  },
  searchInfo: {
    fontSize: RFValue(12),
    color: '#666',
    marginTop: 6,
    marginLeft: 4,
  },
});
