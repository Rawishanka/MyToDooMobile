import { LocationAutocomplete, type LocationData } from '@/src/shared/components/LocationAutocomplete';
import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { getCurrencySymbol, getMaxPriceForCurrency } from '@/src/shared/utils/currency';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
    Modal,
    PanResponder,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';

const RADIUS_OPTIONS_KM = [25, 50, 100, 200] as const;

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
  onSuburbClear?: () => void;
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
  onSuburbClear,
}: FilterModalProps) {
  // Get geolocation-based currency
  const { isDarkMode } = useTheme();
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
      <View style={[styles.filterModal, isDarkMode && { backgroundColor: '#0B1120' }]}>
        {visible && <StatusBar barStyle="light-content" />}
        {!isDarkMode && (
          <LinearGradient
            pointerEvents="none"
            colors={['#003399', '#00287A']}
            style={StyleSheet.absoluteFill}
          />
        )}
        {/* Header */}
        <View style={styles.filterHeader}>
          <TouchableOpacity onPress={onClose} style={styles.headerBackChip} activeOpacity={0.75}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.filterTitle}>Filter</Text>
          <TouchableOpacity onPress={onResetFilters} style={styles.resetChip} activeOpacity={0.75}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.filterContent} contentContainerStyle={styles.filterContentInner} showsVerticalScrollIndicator={false}>
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
                color={isDarkMode ? '#94A3B8' : '#003399'} 
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
                          <Ionicons name="checkmark-circle" size={20} color={isDarkMode ? '#38BDF8' : '#003399'} />
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
              <Text style={[styles.categoryErrorText, !isDarkMode && { color: '#FCA5A5' }]}>
                Failed to load categories. Using defaults.
              </Text>
            )}
          </View>

          <View style={[styles.filterSection, { zIndex: 900 }, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>Search area</Text>
            {/* Suburb autocomplete (includes the single, optional "Use Current Location" button) */}
            <LocationAutocomplete
              onSelect={(location: LocationData) => onSuburbSelect?.(location)}
              onClear={() => onSuburbClear?.()}
              initialValue={suburb}
              placeholder="Search suburb or city..."
              country="AU"
              allowManualFallback={false}
              buttonStyle={!isDarkMode ? { backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.7)', shadowOpacity: 0, elevation: 0 } : undefined}
            />
            <Text style={[styles.radiusLabel, isDarkMode && { color: '#94A3B8' }]}>
              Radius{suburb ? ` around ${suburb}` : ''}
            </Text>
            <View style={styles.radiusChips}>
              {RADIUS_OPTIONS_KM.map((km) => {
                const selected = radiusKm === km;
                return (
                  <TouchableOpacity
                    key={km}
                    style={[
                      styles.radiusChip,
                      isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' },
                      selected && styles.radiusChipSelected,
                      selected && isDarkMode && { backgroundColor: '#003399', borderColor: '#38BDF8' },
                    ]}
                    onPress={() => onRadiusChange?.(km)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${km} kilometres`}
                  >
                    <Text
                      style={[
                        styles.radiusChipText,
                        isDarkMode && { color: '#CBD5E1' },
                        selected && styles.radiusChipTextSelected,
                        selected && isDarkMode && { color: '#FFFFFF' },
                      ]}
                    >
                      {km} km
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {!suburb && (
              <Text style={[styles.radiusHint, isDarkMode && { color: '#64748B' }]}>
                Select a suburb (or use your current location) to filter by distance.
              </Text>
            )}
          </View>

          {/* Price Range Filter */}
          <View style={[styles.filterSection, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>Price Range</Text>
            <View style={styles.priceRangeDisplay}>
              <View style={[styles.priceBox, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                <Text style={[styles.priceBoxLabel, isDarkMode && { color: '#94A3B8' }]}>Min</Text>
                <Text style={[styles.priceBoxValue, isDarkMode && { color: '#38BDF8' }]}>{currencySymbol}{priceRange[0].toLocaleString()}</Text>
              </View>
              <Text style={[styles.priceSeparator, isDarkMode && { color: '#64748B' }]}>-</Text>
              <View style={[styles.priceBox, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                <Text style={[styles.priceBoxLabel, isDarkMode && { color: '#94A3B8' }]}>Max</Text>
                <Text style={[styles.priceBoxValue, isDarkMode && { color: '#38BDF8' }]}>{currencySymbol}{priceRange[1].toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.sliderContainer}>
              <View
                style={[styles.sliderTrack, isDarkMode && { backgroundColor: '#E8ECF4' }]}
                onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
              >
                <View 
                  style={[
                    styles.sliderFill,
                    isDarkMode && { backgroundColor: '#003399' },
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
                <Text style={[styles.sliderLabel, isDarkMode && { color: '#94A3B8' }]}>{currencySymbol}0</Text>
                <Text style={[styles.sliderLabel, isDarkMode && { color: '#94A3B8' }]}>{currencySymbol}{MAX_PRICE.toLocaleString()}+</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#003399',
  },
  headerBackChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTitle: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resetText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '700',
  },
  filterContent: {
    flex: 1,
  },
  filterContentInner: {
    padding: 16,
    paddingBottom: 32,
  },
  filterSection: {
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  sectionTitle: {
    fontSize: RFValue(12),
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  radiusLabel: {
    fontSize: RFValue(12),
    color: 'rgba(255,255,255,0.8)',
    marginTop: 16,
    marginBottom: 10,
    fontWeight: '600',
  },
  radiusChips: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusChip: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  radiusChipSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  radiusChipText: {
    fontSize: RFValue(14),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  radiusChipTextSelected: {
    color: '#003399',
    fontWeight: '800',
  },
  radiusHint: {
    marginTop: 12,
    fontSize: RFValue(12),
    lineHeight: 18,
    color: 'rgba(255,255,255,0.75)',
  },
  categorySelector: {
    backgroundColor: '#F4F6FB',
    paddingHorizontal: 14,
    minHeight: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#DCE3F5',
  },
  categorySelectorText: {
    fontSize: RFValue(15),
    color: '#1A1D2E',
    fontWeight: '600',
    flex: 1,
  },
  categoryDropdown: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginTop: 8,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    shadowColor: '#003399',
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
    color: '#003399',
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
    backgroundColor: '#003399',
    borderColor: '#003399',
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
    borderRadius: 14,
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
    color: '#003399',
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
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: 3,
    position: 'relative',
    marginVertical: 20,
  },
  sliderFill: {
    height: 6,
    backgroundColor: '#ff6b35',
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
    borderColor: '#003399',
    elevation: 4,
    shadowColor: '#003399',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderThumbActive: {
    transform: [{ scale: 1.2 }],
    elevation: 8,
    borderColor: '#ff6b35',
  },
  thumbInner: {
    width: 8,
    height: 8,
    backgroundColor: '#003399',
    borderRadius: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: RFValue(12),
    color: 'rgba(255,255,255,0.8)',
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
    borderTopColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'transparent',
  },
  resetButton: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  resetButtonText: {
    fontSize: RFValue(15),
    color: '#FFFFFF',
    fontWeight: '700',
  },
  applyButton: {
    flex: 2,
    height: 52,
    justifyContent: 'center',
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#ff6b35',
    shadowColor: '#ff6b35',
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
