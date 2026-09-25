import { LocationAutocomplete } from '@/src/shared/components/LocationAutocomplete';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';
import { FLOW } from '../flowTheme';

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
  const { isDarkMode } = useTheme();

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
    <View ref={locationFieldRef} collapsable={false} style={styles.wrapper}>
      <Text style={[styles.label, isDarkMode && { color: '#FFFFFF' }]}>Location</Text>
      <LocationAutocomplete
        onSelect={onLocationSelect}
        placeholder="Search for suburb, city or address..."
        style={styles.locationAutocomplete}
        onDropdownStateChange={handleDropdownStateChange}
        onFocus={() => handleDropdownStateChange(true)}
      />
      {selectedLocation && (
        <View style={[styles.selectedLocationContainer, isDarkMode && { backgroundColor: 'rgba(255,255,255,0.16)' }]}>
          <Ionicons name="location" size={16} color={isDarkMode ? '#FFFFFF' : FLOW.blue} />
          <Text style={[styles.selectedLocationText, isDarkMode && { color: '#FFFFFF' }]}>
            {selectedLocation.address}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 99999, // Extremely high to establish dominant stacking context
    elevation: 99999, // For Android support
    overflow: 'visible', // Allow dropdown to escape container bounds
  },
  label: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: FLOW.navy,
    marginBottom: 6,
    marginTop: 10,
  },
  locationAutocomplete: {
    marginBottom: 10,
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FLOW.tint,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  selectedLocationText: {
    marginLeft: 8,
    fontSize: RFValue(14),
    color: FLOW.navy,
    flex: 1,
  },
});
