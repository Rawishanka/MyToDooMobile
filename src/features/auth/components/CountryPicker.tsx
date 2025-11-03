// Country Picker Component

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { CountryData } from './signup-types';
import { COUNTRIES } from './signup-types';

interface CountryPickerProps {
  selectedCountry: CountryData;
  showPicker: boolean;
  onTogglePicker: () => void;
  onSelectCountry: (country: CountryData) => void;
}

export const CountryPicker: React.FC<CountryPickerProps> = ({
  selectedCountry,
  showPicker,
  onTogglePicker,
  onSelectCountry,
}) => {
  return (
    <View>
      <TouchableOpacity 
        style={styles.dropdownContainer}
        onPress={onTogglePicker}
        activeOpacity={0.7}
      >
        <Text style={styles.dropdownText}>
          {selectedCountry.flag} {selectedCountry.name}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
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
              <Text style={styles.dropdownItemText}>
                {country.flag} {country.name}
              </Text>
              {selectedCountry.code === country.code && (
                <Ionicons name="checkmark" size={20} color="#0057FF" />
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
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FAFAFA',
    marginBottom: 16,
  },
  dropdownText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  dropdownList: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#FFF',
    marginBottom: 16,
    maxHeight: 200,
    overflow: 'scroll',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemSelected: {
    backgroundColor: '#F0F7FF',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#000',
  },
});
