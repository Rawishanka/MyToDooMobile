import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { getCurrencySymbol } from '@/src/shared/utils/currency';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
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
  const currencySymbol = getCurrencySymbol(countryInfo.currency);
  
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  const [categorySearchText, setCategorySearchText] = useState('');
  const [sliderWidth, setSliderWidth] = useState(300);
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);

  const MIN_PRICE = 0;
  const MAX_PRICE = 10000;

  // Filter categories based on search text
  const filteredCategories = useMemo(() => {
    if (!categorySearchText.trim()) {
      return categories;
    }
    const searchLower = categorySearchText.toLowerCase().trim();
    return categories.filter(cat => 
      cat.toLowerCase().includes(searchLower)
    );
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
                <Text style={styles.sliderLabel}>{currencySymbol}10,000+</Text>
              </View>
            </View>
          </View>

          {/* Toggle Filters */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Other filters</Text>
            
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleLabel}>Available Mytodoo tasks only</Text>
                <Text style={styles.toggleSubtitle}>Hide tasks that are already assigned</Text>
              </View>
              <Switch
                value={availableTasksOnly}
                onValueChange={onAvailableTasksChange}
                trackColor={{ false: '#e0e0e0', true: '#007bff' }}
                thumbColor="#ffffff"
              />
            </View>
            
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleLabel}>Show tasks with no offers</Text>
                <Text style={styles.toggleSubtitle}>Hide tasks that have offers</Text>
              </View>
              <Switch
                value={showTasksWithNoOffers}
                onValueChange={onShowTasksWithNoOffersChange}
                trackColor={{ false: '#e0e0e0', true: '#007bff' }}
                thumbColor="#ffffff"
              />
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetText: {
    color: '#007bff',
    fontSize: 16,
  },
  filterContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  categorySelector: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categorySelectorText: {
    fontSize: 16,
    color: '#333',
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
    marginBottom: 24,
    gap: 16,
  },
  priceBox: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 120,
    alignItems: 'center',
  },
  priceBoxLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  priceBoxValue: {
    fontSize: 18,
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
    padding: 16,
    paddingBottom: 52,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  resetButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#007bff',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
