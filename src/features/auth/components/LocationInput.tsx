// Location Input Component using Mapbox Autocomplete

import { LocationAutocomplete } from '@/src/shared/components/LocationAutocomplete';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LocationData } from './signup-types';

interface LocationInputProps {
  selectedLocation: LocationData | null;
  countryCode: string;
  onLocationSelect: (location: LocationData) => void;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  selectedLocation,
  countryCode,
  onLocationSelect,
}) => {
  return (
    <>
      <Text style={styles.label}>Location (Suburb/Address)</Text>
      <LocationAutocomplete
        onSelect={onLocationSelect}
        placeholder="Search for suburb, city or address..."
        style={{ marginBottom: 16 }}
        country={countryCode}
      />
      {selectedLocation && (
        <View style={styles.selectedLocationContainer}>
          <Ionicons name="location" size={16} color="#0057FF" />
          <Text style={styles.selectedLocationText}>
            {selectedLocation.address}
          </Text>
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
