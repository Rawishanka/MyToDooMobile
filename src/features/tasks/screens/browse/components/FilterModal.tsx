import { LocationAutocomplete, type LocationData } from '@/src/shared/components/LocationAutocomplete';
import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { getCurrencySymbol, getMaxPriceForCurrency } from '@/src/shared/utils/currency';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
    Modal,
    PanResponder,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';

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
  radiusKm?: number;
  suburb?: string;
  onRadiusChange?: (radiusKm: number) => void;
  onSuburbSelect?: (location: { address: string; coordinates: { lat: number; lng: number } }) => void;
  onUseCurrentLocation?: () => void;
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
  radiusKm = 100,
  suburb = '',
  onRadiusChange,
  onSuburbSelect,
  onUseCurrentLocation,
}: FilterModalProps) {
  // Get geolocation-based currency
  const { isDarkMode } = useTheme();
  const { countryInfo } = useLocationCountry();
  const currencySymbol = getCurrencySymbol(countryInfo?.currency || 'AUD');
  
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  const [categorySearchText, setCategorySearchText] = useState('');
  const [sliderWidth, setSliderWidth] = useState(300);
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);
  const [localRadius, setLocalRadius] = useState(String(radiusKm));

  useEffect(() => {
    setLocalRadius(String(radiusKm));
  }, [radiusKm]);

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
      <View style={[styles.filterModal, isDarkMode && { backgroundColor: '#0B1120' }]}>
        {/* Header */}
        <View style={styles.filterHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.filterTitle}>Filter</Text>
          <TouchableOpacity onPress={onResetFilters}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.filterContent}>
          {/* Category Filter */}
          <View style={[styles.filterSection, { zIndex: categoryDropdownVisible ? 1000 : 1 }, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>Categories</Text>
            <TouchableOpacity
              style={[styles.categorySelector, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}
              onPress={() => {
                setCategoryDropdownVisible(!categoryDropdownVisible);
                if (!categoryDropdownVisible) {
                  setCategorySearchText(''); // Clear search when opening
                }
              }}
              disabled={categoriesLoading}
            >
              <Text style={[styles.categorySelectorText, isDarkMode && { color: '#F8FAFC' }]}>
                {categoriesLoading ? 'Loading categories...' : selectedCategory}
              </Text>
              <MaterialCommunityIcons 
                name={categoryDropdownVisible ? "chevron-up" : "chevron-down"}
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
            
            {categoryDropdownVisible && !categoriesLoading && (
              <View style={[styles.categoryDropdown, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                {/* Search Input */}
                <View style={[styles.categorySearchContainer, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                  <Ionicons name="search-outline" size={18} color="#999" style={styles.searchIcon} />
                  <TextInput
                    style={[styles.categorySearchInput, isDarkMode && { color: '#F8FAFC' }]}
                    placeholder="Search categories..."
                    placeholderTextColor={isDarkMode ? '#64748B' : '#999'}
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
                      <Text style={{ fontSize: RFValue(10), color: '#666' }}>
                        DEBUG: Searching "{categorySearchText}" - Found {filteredCategories.length} results
                      </Text>
                      <Text style={{ fontSize: RFValue(9), color: '#999' }}>
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
                          isDarkMode && { backgroundColor: '#1E293B', borderBottomColor: '#334155' },
                          selectedCategory === cat && (isDarkMode ? { backgroundColor: '#0F172A' } : styles.categoryOptionSelected),
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
                          isDarkMode && { color: '#F8FAFC' },
                          selectedCategory === cat && (isDarkMode ? { color: '#38BDF8', fontWeight: '700' } : styles.categoryOptionTextSelected)
                        ]}>
                          {cat}
                        </Text>
                        {selectedCategory === cat && (
                          <Ionicons name="checkmark-circle" size={20} color={isDarkMode ? '#38BDF8' : '#1A2980'} />
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

          <View style={[styles.filterSection, { zIndex: 900 }, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>Search area</Text>
            <LocationAutocomplete
              onSelect={(location: LocationData) => onSuburbSelect?.(location)}
              initialValue={suburb}
              placeholder="Search suburb or city..."
              country="AU"
            />
            <TouchableOpacity
              style={[styles.currentLocationButton, isDarkMode && { backgroundColor: '#0F172A' }]}
              onPress={() => onUseCurrentLocation?.()}
            >
              <Ionicons name="navigate-outline" size={16} color={isDarkMode ? '#38BDF8' : '#1A2980'} />
              <Text style={[styles.currentLocationText, isDarkMode && { color: '#38BDF8' }]}>Use current location</Text>
            </TouchableOpacity>
            <Text style={[styles.radiusLabel, isDarkMode && { color: '#94A3B8' }]}>Radius (km)</Text>
            <TextInput
              style={[styles.radiusInput, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }]}
              value={localRadius}
              onChangeText={(text) => setLocalRadius(text.replace(/[^0-9]/g, ''))}
              onEndEditing={() => {
                const parsed = parseInt(localRadius, 10);
                onRadiusChange?.(Number.isNaN(parsed) ? 100 : parsed);
              }}
              keyboardType="number-pad"
              placeholder="100"
              placeholderTextColor={isDarkMode ? '#64748B' : '#999'}
            />
          </View>

          {/* Price Range Filter */}
          <View style={[styles.filterSection, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>Price Range</Text>
            <View style={styles.priceRangeDisplay}>
              <View style={[styles.priceBox, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                <Text style={[styles.priceBoxLabel, isDarkMode && { color: '#94A3B8' }]}>Min</Text>
                <Text style={[styles.priceBoxValue, isDarkMode && { color: '#38BDF8' }]}>{currencySymbol}{priceRange[0].toLocaleString()}</Text>
              </View>
              <Text style={styles.priceSeparator}>-</Text>
              <View style={[styles.priceBox, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                <Text style={[styles.priceBoxLabel, isDarkMode && { color: '#94A3B8' }]}>Max</Text>
                <Text style={[styles.priceBoxValue, isDarkMode && { color: '#38BDF8' }]}>{currencySymbol}{priceRange[1].toLocaleString()}</Text>
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
        <View style={[styles.filterFooter, isDarkMode && { backgroundColor: '#1E293B', borderTopColor: '#334155' }]}>
          <TouchableOpacity 
            style={[styles.resetButton, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#38BDF8' }]} 
            onPress={onResetFilters}
          >
            <Text style={[styles.resetButtonText, isDarkMode && { color: '#38BDF8' }]}>Reset</Text>
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
    backgroundColor: '#F4F6FB',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#1A2980',
  },
  filterTitle: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resetText: {
    color: '#FF7A00',
    fontSize: RFValue(14),
    fontWeight: '700',
  },
  filterContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    shadowColor: '#1A2980',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: RFValue(12),
    fontWeight: '800',
    color: '#1A2980',
    marginBottom: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
  },
  currentLocationText: {
    color: '#1A2980',
    fontSize: RFValue(14),
    fontWeight: '600',
  },
  radiusLabel: {
    fontSize: RFValue(12),
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 6,
    fontWeight: '600',
  },
  radiusInput: {
    backgroundColor: '#F4F6FB',
    borderWidth: 1.5,
    borderColor: '#E8ECF4',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: RFValue(16),
    color: '#1A1D2E',
    fontWeight: '600',
  },
  categorySelector: {
    backgroundColor: '#F4F6FB',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8ECF4',
  },
  categorySelectorText: {
    fontSize: RFValue(15),
    color: '#1A1D2E',
    fontWeight: '600',
    flex: 1,
  },
  categoryDropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 6,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    shadowColor: '#1A2980',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1000,
    overflow: 'hidden',
  },
  categorySearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F8',
    backgroundColor: '#F4F6FB',
  },
  searchIcon: {
    marginRight: 8,
  },
  categorySearchInput: {
    flex: 1,
    fontSize: RFValue(14),
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
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F6FB',
    backgroundColor: '#fff',
  },
  categoryOptionSelected: {
    backgroundColor: '#EEF2FF',
  },
  categoryOptionText: {
    fontSize: RFValue(14),
    color: '#333',
    flex: 1,
  },
  categoryOptionTextSelected: {
    color: '#1A2980',
    fontWeight: '700',
  },
  noResultsContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: RFValue(15),
    color: '#666',
    fontWeight: '600',
    marginTop: 12,
  },
  noResultsSubtext: {
    fontSize: RFValue(13),
    color: '#999',
    marginTop: 4,
  },
  categoryErrorText: {
    fontSize: RFValue(12),
    color: '#EF4444',
    marginTop: 8,
    fontStyle: 'italic',
  },
  taskTypeButtons: {
    gap: 10,
  },
  taskTypeBtn: {
    backgroundColor: '#F4F6FB',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8ECF4',
  },
  taskTypeBtnActive: {
    backgroundColor: '#1A2980',
    borderColor: '#1A2980',
  },
  taskTypeBtnText: {
    fontSize: RFValue(14),
    color: '#6B7280',
    fontWeight: '500',
  },
  taskTypeBtnTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  priceRangeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    gap: 16,
  },
  priceBox: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    minWidth: 100,
    alignItems: 'center',
  },
  priceBoxLabel: {
    fontSize: RFValue(10),
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  priceBoxValue: {
    fontSize: RFValue(18),
    color: '#1A2980',
    fontWeight: '800',
  },
  priceSeparator: {
    fontSize: RFValue(20),
    color: '#9CA3AF',
    fontWeight: '300',
  },
  sliderContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#E8ECF4',
    borderRadius: 3,
    position: 'relative',
    marginVertical: 20,
  },
  sliderFill: {
    height: 6,
    backgroundColor: '#1A2980',
    borderRadius: 3,
    position: 'absolute',
  },
  sliderThumb: {
    width: 26,
    height: 26,
    backgroundColor: '#fff',
    borderRadius: 13,
    position: 'absolute',
    top: -10,
    marginLeft: -13,
    borderWidth: 3,
    borderColor: '#1A2980',
    elevation: 4,
    shadowColor: '#1A2980',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderThumbActive: {
    transform: [{ scale: 1.2 }],
    elevation: 8,
    borderColor: '#FF7A00',
  },
  thumbInner: {
    width: 8,
    height: 8,
    backgroundColor: '#1A2980',
    borderRadius: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: RFValue(12),
    color: '#6B7280',
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: RFValue(15),
    color: '#1A1D2E',
    fontWeight: '600',
    marginBottom: 3,
  },
  toggleSubtitle: {
    fontSize: RFValue(13),
    color: '#6B7280',
  },
  filterFooter: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 28,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8ECF4',
    backgroundColor: '#FFFFFF',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#F4F6FB',
    borderWidth: 2,
    borderColor: '#1A2980',
  },
  resetButtonText: {
    fontSize: RFValue(15),
    color: '#1A2980',
    fontWeight: '700',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#FF7A00',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  applyButtonText: {
    fontSize: RFValue(15),
    color: '#fff',
    fontWeight: '800',
  },
});
