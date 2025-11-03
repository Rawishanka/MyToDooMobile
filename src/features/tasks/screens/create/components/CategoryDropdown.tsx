import { Ionicons } from '@expo/vector-icons';
import { ChevronDown } from 'lucide-react-native';
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  iconUrl?: string;
  locationType?: 'physical' | 'online' | 'both';
  isActive?: boolean;
}

interface CategoryDropdownProps {
  isLoading: boolean;
  hasError: boolean;
  selectedCategory: string | null;
  categories: string[];
  fullCategories: Category[];
  showDropdown: boolean;
  dropdownPosition: 'below' | 'above';
  searchQuery: string;
  onDropdownToggle: (event: any) => void;
  onCategorySelect: (category: string, categoryObj?: Category) => void;
  onSearchChange: (text: string) => void;
  onRetry: () => void;
  onCloseDropdown: () => void;
}

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  isLoading,
  hasError,
  selectedCategory,
  categories,
  fullCategories,
  showDropdown,
  dropdownPosition,
  searchQuery,
  onDropdownToggle,
  onCategorySelect,
  onSearchChange,
  onRetry,
  onCloseDropdown,
}) => {
  return (
    <>
      <Text style={styles.label}>Category</Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0057FF" />
          <Text style={styles.loadingText}>Loading categories from database...</Text>
        </View>
      ) : hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load categories</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.dropdown} onPress={onDropdownToggle}>
          <Text style={[styles.dropdownText, !selectedCategory && styles.placeholderText]}>
            {selectedCategory || 'Select a category'}
          </Text>
          <ChevronDown 
            size={20} 
            color="#666" 
            style={{
              transform: [{ rotate: showDropdown ? '180deg' : '0deg' }]
            }}
          />
        </TouchableOpacity>
      )}

      {/* Category Dropdown */}
      {showDropdown && (
        <>
          {/* Overlay to close dropdown when tapping outside */}
          <TouchableOpacity 
            style={styles.dropdownOverlay}
            activeOpacity={1}
            onPress={onCloseDropdown}
          />
          <View style={[
            styles.dropdownContainer,
            dropdownPosition === 'above' && styles.dropdownContainerAbove
          ]}>
            {/* Search Input */}
            <View style={styles.categorySearchContainer}>
              <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.categorySearchInput}
                placeholder="Search categories..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={onSearchChange}
                autoFocus={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  onPress={() => onSearchChange('')}
                  style={styles.clearSearchButton}
                >
                  <Ionicons name="close-circle" size={18} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            
            <ScrollView 
              style={styles.dropdownList}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {categories.length === 0 ? (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No categories found</Text>
                </View>
              ) : (
                categories.map((category, index) => {
                  const categoryObj = fullCategories.find((cat: Category) => cat.name === category);
                  return (
                    <TouchableOpacity
                      key={`${category}-${index}`}
                      style={[
                        styles.dropdownItem,
                        index === categories.length - 1 && { borderBottomWidth: 0 },
                        selectedCategory === category && styles.selectedDropdownItem
                      ]}
                      onPress={() => onCategorySelect(category, categoryObj)}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        selectedCategory === category && styles.selectedDropdownItemText
                      ]}>
                        {category}
                      </Text>
                      {selectedCategory === category && (
                        <Ionicons name="checkmark" size={20} color="#0057FF" />
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
              {/* Add a small footer to ensure last item is visible */}
              <View style={{ height: 5 }} />
            </ScrollView>
          </View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    marginTop: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    marginBottom: 10,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFE6E6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    color: '#aaa',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 999,
    marginBottom: 10,
    marginTop: -10,
  },
  dropdownContainerAbove: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    zIndex: 999,
    marginBottom: 0,
    marginTop: 0,
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  categorySearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  categorySearchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 6,
  },
  clearSearchButton: {
    padding: 4,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    minHeight: 54,
    backgroundColor: '#fff',
  },
  selectedDropdownItem: {
    backgroundColor: '#F0F8FF',
    borderLeftWidth: 3,
    borderLeftColor: '#0057FF',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  selectedDropdownItemText: {
    color: '#0057FF',
    fontWeight: '600',
  },
});
