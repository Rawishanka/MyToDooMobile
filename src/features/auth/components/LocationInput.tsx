// Location Input Component using Mapbox Autocomplete

import { LocationAutocomplete } from '@/src/shared/components/LocationAutocomplete';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { LocationData } from './signup-types';

interface LocationInputProps {
  selectedLocation: LocationData | null;
  countryCode: string;
  onLocationSelect: (location: LocationData) => void;
  hasError?: boolean;
  onDropdownStateChange?: (isOpen: boolean) => void;
  onFocus?: () => void;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  selectedLocation,
  countryCode,
  onLocationSelect,
  hasError = false,
  onDropdownStateChange,
  onFocus,
}) => {
  return (
    <>
      <LocationAutocomplete
        onSelect={onLocationSelect}
        placeholder="Search for suburb, city or address..."
        style={{ marginBottom: 4 }}
        country={countryCode}
        onDropdownStateChange={onDropdownStateChange}
        onFocus={onFocus}
        initialValue={selectedLocation?.address || ''}
      />
      {selectedLocation && (
        <View style={styles.selectedLocationContainer}>
          <Ionicons name="location" size={16} color="#0057FF" />
          <Text style={styles.selectedLocationText}>
            {selectedLocation.address}
          </Text>
          <TouchableOpacity 
            onPress={() => onLocationSelect(null as any)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color="#0057FF" />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  selectedLocationText: {
    fontSize: 13,
    color: '#0057FF',
    flex: 1,
  },
});
