// Country Picker Component

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { CountryData } from './signup-types';
import { COUNTRIES } from './signup-types';
import { RFValue } from '@/src/shared/utils/responsive';

interface CountryPickerProps {
  selectedCountry: CountryData;
  showPicker: boolean;
  onTogglePicker: () => void;
  onSelectCountry: (country: CountryData) => void;
  hasError?: boolean;
}

export const CountryPicker: React.FC<CountryPickerProps> = ({
  selectedCountry,
  showPicker,
  onTogglePicker,
  onSelectCountry,
  hasError = false,
}) => {
  return (
    <View>
      <TouchableOpacity 
        style={[styles.dropdownContainer, hasError && styles.dropdownError]}
        onPress={onTogglePicker}
        activeOpacity={0.7}
      >
        <View style={styles.dropdownLeft}>
          <View style={styles.flagIconWrap}>
            <Ionicons name="flag" size={16} color="#1A2980" />
          </View>
          <Text style={styles.dropdownText}>{selectedCountry.name}</Text>
        </View>
        <Ionicons name={showPicker ? "chevron-up" : "chevron-down"} size={18} color="#1A2980" />
      </TouchableOpacity>

      {showPicker && (
        <View style={styles.dropdownList}>
          {COUNTRIES.map((country) => (
            <TouchableOpacity
              key={country.code}
              style={[
                styles.dropdownItem,
                selectedCountry.code === country.code && styles.dropdownItemSelected
              ]}
              onPress={() => onSelectCountry(country)}
            >
              <View style={styles.dropdownLeft}>
                <View style={styles.flagIconWrap}>
                  <Ionicons name="flag" size={15} color={selectedCountry.code === country.code ? '#1A2980' : '#666'} />
                </View>
                <Text style={[styles.dropdownItemText, selectedCountry.code === country.code && styles.dropdownItemTextSelected]}>
                  {country.name}
                </Text>
              </View>
              {selectedCountry.code === country.code && (
                <Ionicons name="checkmark-circle" size={20} color="#1A2980" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8ECF4',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#F4F6FB',
    marginBottom: 4,
  },
  dropdownError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flagIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: RFValue(15),
    color: '#1A1D2E',
    fontWeight: '600',
  },
  dropdownList: {
    borderWidth: 1.5,
    borderColor: '#E8ECF4',
    borderRadius: 12,
    backgroundColor: '#FFF',
    marginBottom: 16,
    maxHeight: 200,
    overflow: 'scroll',
    shadowColor: '#1A2980',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemSelected: {
    backgroundColor: '#EEF2FF',
  },
  dropdownItemText: {
    fontSize: RFValue(15),
    color: '#333',
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: '#1A2980',
    fontWeight: '700',
  },
});
