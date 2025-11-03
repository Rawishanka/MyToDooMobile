import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
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
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(300);

  const handleSliderTouch = (event: any) => {
    const { locationX } = event.nativeEvent;
    const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
    const value = Math.round(0 + (percentage * 10000));
    
    if (percentage > 0.5) {
      onPriceRangeChange([priceRange[0], value]);
    } else {
      onPriceRangeChange([value, priceRange[1]]);
    }
  };

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
              onPress={() => setCategoryDropdownVisible(!categoryDropdownVisible)}
              disabled={categoriesLoading}
            >
              <Text style={styles.categorySelectorText}>
                {categoriesLoading ? 'Loading categories...' : selectedCategory}
              </Text>
              <MaterialCommunityIcons 
                name="chevron-down"
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
            
            {categoryDropdownVisible && !categoriesLoading && (
              <View style={styles.categoryDropdown}>
                {categories.map((cat, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.categoryOption,
                      selectedCategory === cat && styles.categoryOptionSelected,
                      index === categories.length - 1 && { borderBottomWidth: 0 }
                    ]}
                    onPress={() => {
                      onCategoryChange(cat);
                      setCategoryDropdownVisible(false);
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
                ))}
              </View>
            )}
            
            {categoriesError && (
              <Text style={styles.categoryErrorText}>
                Failed to load categories. Using defaults.
              </Text>
            )}
          </View>

          {/* Task Type Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>To be done</Text>
            <View style={styles.taskTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.taskTypeBtn,
                  taskType === 'in-person' && styles.taskTypeBtnActive
                ]}
                onPress={() => onTaskTypeChange(taskType === 'in-person' ? 'all' : 'in-person')}
              >
                <Text style={[
                  styles.taskTypeBtnText,
                  taskType === 'in-person' && styles.taskTypeBtnTextActive
                ]}>
                  In person
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.taskTypeBtn,
                  taskType === 'remote' && styles.taskTypeBtnActive
                ]}
                onPress={() => onTaskTypeChange(taskType === 'remote' ? 'all' : 'remote')}
              >
                <Text style={[
                  styles.taskTypeBtnText,
                  taskType === 'remote' && styles.taskTypeBtnTextActive
                ]}>
                  Remotely
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.taskTypeBtn,
                  taskType === 'all' && styles.taskTypeBtnActive
                ]}
                onPress={() => onTaskTypeChange('all')}
              >
                <Text style={[
                  styles.taskTypeBtnText,
                  taskType === 'all' && styles.taskTypeBtnTextActive
                ]}>
                  All
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Price Range Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Price</Text>
            <Text style={styles.priceRangeText}>
              A${priceRange[0]} - A${priceRange[1]}
            </Text>
            <View style={styles.sliderContainer}>
              <TouchableOpacity
                style={styles.sliderTrack}
                onPress={handleSliderTouch}
                onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
                activeOpacity={1}
              >
                <View 
                  style={[
                    styles.sliderFill,
                    {
                      left: `${(priceRange[0] / 10000) * 100}%`,
                      width: `${((priceRange[1] - priceRange[0]) / 10000) * 100}%`
                    }
                  ]}
                />
                <View 
                  style={[
                    styles.sliderThumb,
                    {
                      left: `${(priceRange[0] / 10000) * 100}%`,
                    }
                  ]}
                />
                <View 
                  style={[
                    styles.sliderThumb,
                    {
                      left: `${(priceRange[1] / 10000) * 100}%`,
                    }
                  ]}
                />
              </TouchableOpacity>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>A$0</Text>
                <Text style={styles.sliderLabel}>A$10,000+</Text>
              </View>
            </View>
          </View>

          {/* Toggle Filters */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Other filters</Text>
            
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleLabel}>Available tasks only</Text>
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
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
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
  priceRangeText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  sliderContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    position: 'relative',
    marginVertical: 12,
  },
  sliderFill: {
    height: 6,
    backgroundColor: '#007bff',
    borderRadius: 3,
    position: 'absolute',
  },
  sliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: '#007bff',
    borderRadius: 10,
    position: 'absolute',
    top: -7,
    marginLeft: -10,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
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
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
