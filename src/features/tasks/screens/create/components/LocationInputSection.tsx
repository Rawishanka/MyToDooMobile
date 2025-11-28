import { LocationAutocomplete } from '@/src/shared/components/LocationAutocomplete';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

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
  scrollViewRef?: React.RefObject<ScrollView | null>;
}

export const LocationInputSection: React.FC<LocationInputSectionProps> = ({
  selectedLocation,
  onLocationSelect,
  scrollViewRef,
}) => {
  const locationFieldRef = useRef<View>(null);

  // Handle input focus and auto-scroll
  const handleInputFocus = () => {
    console.log('📍 Location input focused - triggering auto scroll');
    if (scrollViewRef?.current && locationFieldRef.current) {
      setTimeout(() => {
        locationFieldRef.current?.measureLayout(
          scrollViewRef.current as any,
          (_x, y) => {
            console.log('📍 Scrolling to location field at y:', y);
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, y - 100), // Scroll with 100px offset from top for better view
              animated: true,
            });
          },
          () => console.log('Failed to measure location field')
        );
      }, 150);
    }
  };

  // Handle dropdown state change
  const handleDropdownStateChange = (isOpen: boolean) => {
    console.log('📍 Dropdown state changed:', isOpen ? 'OPEN' : 'CLOSED');
    if (isOpen) {
      handleInputFocus();
    }
  };

  return (
    <View ref={locationFieldRef} collapsable={false}>
      <Text style={styles.label}>Location</Text>
      <LocationAutocomplete
        onSelect={onLocationSelect}
        placeholder="Search for suburb, city or address..."
        style={styles.locationAutocomplete}
        onDropdownStateChange={handleDropdownStateChange}
        onFocus={() => handleDropdownStateChange(true)}
      />
      {selectedLocation && (
        <View style={styles.selectedLocationContainer}>
          <Ionicons name="location" size={16} color="#0057FF" />
          <Text style={styles.selectedLocationText}>
            {selectedLocation.address}
          </Text>
        </View>
      )}
    </View>
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
