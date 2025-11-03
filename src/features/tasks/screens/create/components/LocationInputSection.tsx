import { LocationAutocomplete } from '@/src/shared/components/LocationAutocomplete';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LocationData {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface LocationInputSectionProps {
  selectedLocation: LocationData | null;
  onLocationSelect: (location: LocationData) => void;
}

export const LocationInputSection: React.FC<LocationInputSectionProps> = ({
  selectedLocation,
  onLocationSelect,
}) => {
  return (
    <>
      <Text style={styles.label}>Location</Text>
      <LocationAutocomplete
        onSelect={onLocationSelect}
        placeholder="Search for suburb, city or address..."
        style={styles.locationAutocomplete}
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
    color: '#555',
    marginBottom: 6,
    marginTop: 10,
  },
  locationAutocomplete: {
    marginBottom: 10,
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  selectedLocationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#0057FF',
    flex: 1,
  },
});
