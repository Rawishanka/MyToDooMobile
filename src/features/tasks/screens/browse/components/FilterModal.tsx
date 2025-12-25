import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { getCurrencySymbol, getMaxPriceForCurrency } from '@/src/shared/utils/currency';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
    Modal,
    PanResponder,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  categories: string[];
  categoriesLoading?: boolean;
  categoriesError?: any;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  taskType: 'all' | 'in-person' | 'remote';
  onTaskTypeChange: (type: 'all' | 'in-person' | 'remote') => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  availableTasksOnly: boolean;
  onAvailableTasksChange: (value: boolean) => void;
  showTasksWithNoOffers: boolean;
  onShowTasksWithNoOffersChange: (value: boolean) => void;
  onResetFilters: () => void;
}

export default function FilterModal({
  visible,
  onClose,
  categories,
  categoriesLoading,
  categoriesError,
  selectedCategory,
  onCategoryChange,
  taskType,
  onTaskTypeChange,
  priceRange,
  onPriceRangeChange,
  availableTasksOnly,
  onAvailableTasksChange,
  showTasksWithNoOffers,
  onShowTasksWithNoOffersChange,
  onResetFilters,
}: FilterModalProps) {
  // Get geolocation-based currency
  const { countryInfo } = useLocationCountry();
  const currencySymbol = getCurrencySymbol(countryInfo?.currency || 'AUD');
  
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  const [categorySearchText, setCategorySearchText] = useState('');
  const [sliderWidth, setSliderWidth] = useState(300);
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);

  const MIN_PRICE = 0;
  // Dynamic MAX_PRICE based on user's currency (e.g., 10000 for AUD, 3000000 for LKR)
  const MAX_PRICE = getMaxPriceForCurrency(countryInfo?.currency || 'AUD');

  // Filter categories based on search text with prioritized sorting
  const filteredCategories = useMemo(() => {
    console.log('🔍 FilterModal: Category filtering debug:', {
      searchText: categorySearchText,
      totalCategories: categories.length,
      trimmedSearch: categorySearchText.trim()
    });

    if (!categorySearchText.trim()) {
      console.log('✅ No search text, returning all categories:', categories.length);
      return categories;
    }

    const searchLower = categorySearchText.toLowerCase().trim();
    console.log('🔍 Searching for:', searchLower);

    // Filter and categorize matches
    const startingMatches: string[] = [];
    const containingMatches: string[] = [];

    categories.forEach(cat => {
      if (!cat || typeof cat !== 'string') {
        console.warn('⚠️ Invalid category found:', cat);
        return;
      }
      
      const catLower = cat.toLowerCase().trim();
      
      if (catLower.startsWith(searchLower)) {
        // Category starts with the search term
        startingMatches.push(cat);
      } else if (catLower.includes(searchLower)) {
        // Category contains the search term but doesn't start with it
        containingMatches.push(cat);
      }
    });

    // Combine results: starting matches first, then containing matches
    const filtered = [...startingMatches, ...containingMatches];

    console.log('🎯 Filtered results:', {
      searchTerm: searchLower,
      startingMatches: startingMatches.length,
      containingMatches: containingMatches.length,
      totalMatched: filtered.length,
      orderedCategories: filtered
    });

    return filtered;
  }, [categories, categorySearchText]);

  const createPanResponder = (thumbType: 'min' | 'max') => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setActiveThumb(thumbType);
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx } = gestureState;
        const percentage = dx / sliderWidth;
        const priceChange = percentage * MAX_PRICE;
        
        if (thumbType === 'min') {
          const newMin = Math.max(MIN_PRICE, Math.min(priceRange[1] - 100, priceRange[0] + priceChange));
          onPriceRangeChange([Math.round(newMin), priceRange[1]]);
        } else {
          const newMax = Math.min(MAX_PRICE, Math.max(priceRange[0] + 100, priceRange[1] + priceChange));
          onPriceRangeChange([priceRange[0], Math.round(newMax)]);
        }
      },
      onPanResponderRelease: () => {
        setActiveThumb(null);
      },
    });
  };

  const minThumbPanResponder = createPanResponder('min');
  const maxThumbPanResponder = createPanResponder('max');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.filterModal}>
        {/* Header */}
        <View style={styles.filterHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#007bff" />
          </TouchableOpacity>
          <Text style={styles.filterTitle}>Filter</Text>
          <TouchableOpacity onPress={onResetFilters}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.filterContent}>
          {/* Category Filter */}
          <View style={[styles.filterSection, { zIndex: categoryDropdownVisible ? 1000 : 1 }]}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity
              style={styles.categorySelector}
              onPress={() => {
                setCategoryDropdownVisible(!categoryDropdownVisible);
                if (!categoryDropdownVisible) {
                  setCategorySearchText(''); // Clear search when opening
                }
              }}
              disabled={categoriesLoading}
            >
              <Text style={styles.categorySelectorText}>
                {categoriesLoading ? 'Loading categories...' : selectedCategory}
              </Text>
              <MaterialCommunityIcons 
                name={categoryDropdownVisible ? "chevron-up" : "chevron-down"}
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
            
            {categoryDropdownVisible && !categoriesLoading && (
              <View style={styles.categoryDropdown}>
                {/* Search Input */}
                <View style={styles.categorySearchContainer}>
                  <Ionicons name="search-outline" size={18} color="#999" style={styles.searchIcon} />
                  <TextInput
                    style={styles.categorySearchInput}
                    placeholder="Search categories..."
                    placeholderTextColor="#999"
                    value={categorySearchText}
                    onChangeText={setCategorySearchText}
                    autoFocus={false}
                  />
                  {categorySearchText.length > 0 && (
                    <TouchableOpacity 
                      onPress={() => setCategorySearchText('')}
                      style={styles.clearSearchIcon}
                    >
                      <Ionicons name="close-circle" size={18} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Category List */}
                <ScrollView style={styles.categoryList} nestedScrollEnabled>
                  {/* Debug info - visible in UI */}
                  {__DEV__ && categorySearchText.trim() && (
                    <View style={{ padding: 8, backgroundColor: '#f0f0f0', marginBottom: 4 }}>
                      <Text style={{ fontSize: 10, color: '#666' }}>
                        DEBUG: Searching "{categorySearchText}" - Found {filteredCategories.length} results
                      </Text>
                      <Text style={{ fontSize: 9, color: '#999' }}>
                        (Categories starting with "{categorySearchText}" appear first)
                      </Text>
                    </View>
                  )}
                  
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.categoryOption,
                          selectedCategory === cat && styles.categoryOptionSelected,
                          index === filteredCategories.length - 1 && { borderBottomWidth: 0 }
                        ]}
                        onPress={() => {
                          onCategoryChange(cat);
                          setCategoryDropdownVisible(false);
                          setCategorySearchText('');
                        }}
                      >
                        <Text style={[
                          styles.categoryOptionText,
                          selectedCategory === cat && styles.categoryOptionTextSelected
                        ]}>
                          {cat}
                        </Text>
                        {selectedCategory === cat && (
                          <Ionicons name="checkmark" size={20} color="#007bff" />
                        )}
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.noResultsContainer}>
                      <Ionicons name="search-outline" size={32} color="#ccc" />
                      <Text style={styles.noResultsText}>No categories found</Text>
                      <Text style={styles.noResultsSubtext}>Try a different search term</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
            
            {categoriesError && (
              <Text style={styles.categoryErrorText}>
                Failed to load categories. Using defaults.
              </Text>
            )}
          </View>

          {/* Price Range Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.priceRangeDisplay}>
              <View style={styles.priceBox}>
                <Text style={styles.priceBoxLabel}>Min</Text>
                <Text style={styles.priceBoxValue}>{currencySymbol}{priceRange[0].toLocaleString()}</Text>
              </View>
              <Text style={styles.priceSeparator}>-</Text>
              <View style={styles.priceBox}>
                <Text style={styles.priceBoxLabel}>Max</Text>
                <Text style={styles.priceBoxValue}>{currencySymbol}{priceRange[1].toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.sliderContainer}>
              <View
                style={styles.sliderTrack}
                onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
              >
                <View 
                  style={[
                    styles.sliderFill,
                    {
                      left: `${(priceRange[0] / MAX_PRICE) * 100}%`,
                      width: `${((priceRange[1] - priceRange[0]) / MAX_PRICE) * 100}%`
                    }
                  ]}
                />
                <View 
                  {...minThumbPanResponder.panHandlers}
                  style={[
                    styles.sliderThumb,
                    activeThumb === 'min' && styles.sliderThumbActive,
                    {
                      left: `${(priceRange[0] / MAX_PRICE) * 100}%`,
                    }
                  ]}
                >
                  <View style={styles.thumbInner} />
                </View>
                <View 
                  {...maxThumbPanResponder.panHandlers}
                  style={[
                    styles.sliderThumb,
                    activeThumb === 'max' && styles.sliderThumbActive,
                    {
                      left: `${(priceRange[1] / MAX_PRICE) * 100}%`,
                    }
                  ]}
                >
                  <View style={styles.thumbInner} />
                </View>
              </View>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>{currencySymbol}0</Text>
                <Text style={styles.sliderLabel}>{currencySymbol}{MAX_PRICE.toLocaleString()}+</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom buttons */}
        <View style={styles.filterFooter}>
          <TouchableOpacity style={styles.resetButton} onPress={onResetFilters}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.applyButton} 
            onPress={onClose}
          >
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  filterModal: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    backgroundColor: '#fff',
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  resetText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
  filterContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 18,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  categorySelector: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  categorySelectorText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  categoryDropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 300,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
    overflow: 'hidden',
  },
  categorySearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fafafa',
  },
  searchIcon: {
    marginRight: 8,
  },
  categorySearchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 4,
  },
  clearSearchIcon: {
    padding: 4,
  },
  categoryList: {
    maxHeight: 250,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  categoryOptionSelected: {
    backgroundColor: '#f0f8ff',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#333',
  },
  categoryOptionTextSelected: {
    color: '#007bff',
    fontWeight: '600',
  },
  noResultsContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginTop: 12,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  categoryErrorText: {
    fontSize: 12,
    color: '#ff6b35',
    marginTop: 8,
    fontStyle: 'italic',
  },
  taskTypeButtons: {
    gap: 12,
  },
  taskTypeBtn: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  taskTypeBtnActive: {
    backgroundColor: '#1a237e',
  },
  taskTypeBtnText: {
    fontSize: 16,
    color: '#333',
  },
  taskTypeBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  priceRangeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    gap: 20,
  },
  priceBox: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    minWidth: 100,
    alignItems: 'center',
  },
  priceBoxLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  priceBoxValue: {
    fontSize: 20,
    color: '#007bff',
    fontWeight: '700',
  },
  priceSeparator: {
    fontSize: 20,
    color: '#999',
    fontWeight: '300',
  },
  sliderContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    position: 'relative',
    marginVertical: 20,
  },
  sliderFill: {
    height: 6,
    backgroundColor: '#007bff',
    borderRadius: 3,
    position: 'absolute',
  },
  sliderThumb: {
    width: 28,
    height: 28,
    backgroundColor: '#fff',
    borderRadius: 14,
    position: 'absolute',
    top: -11,
    marginLeft: -14,
    borderWidth: 3,
    borderColor: '#007bff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderThumbActive: {
    transform: [{ scale: 1.2 }],
    elevation: 6,
    shadowOpacity: 0.35,
  },
  thumbInner: {
    width: 8,
    height: 8,
    backgroundColor: '#007bff',
    borderRadius: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  filterFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    backgroundColor: '#fff',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#007bff',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#007bff',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
