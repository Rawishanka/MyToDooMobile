import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationResult {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  text: string;
  context?: {id: string; text: string}[];
  place_type?: string[];
}

export interface LocationData {
  address: string;
  coordinates: Coordinates;
}

interface LocationAutocompleteProps {
  onSelect: (location: LocationData) => void;
  onFocus?: () => void;
  initialValue?: string;
  placeholder?: string;
  style?: any;
  country?: string; // ISO country code - AUSTRALIA-ONLY APP: Always 'AU'
  onDropdownStateChange?: (isOpen: boolean) => void;
}

// Mapbox Access Token Configuration
const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || 'YOUR_MAPBOX_ACCESS_TOKEN_HERE';

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  onSelect,
  onFocus,
  initialValue = "",
  placeholder = "Search for suburb or city...",
  style,
  country, // AUSTRALIA-ONLY: Always defaults to 'AU'
  onDropdownStateChange,
}) => {
  // AUSTRALIA-ONLY APP: Always use Australia regardless of detection
  const { countryInfo, isDetecting: isDetectingCountry } = useLocationCountry();
  // Always use 'AU' for Australia-only app
  const effectiveCountry = 'AU';

  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Check permission status on component mount
  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status === 'granted' ? 'granted' : 'denied');
    } catch (error) {
      console.log('Error checking permission:', error);
      setPermissionStatus('unknown');
    }
  };

  // Show country detection status in placeholder when detecting
  const dynamicPlaceholder = isDetectingCountry 
    ? "Detecting your location..." 
    : countryInfo ? `${placeholder} (${countryInfo.countryName})` : placeholder;

  console.log('🌍 Using country for location search:', {
    provided: country,
    detected: countryInfo?.countryCode || 'Unknown',
    effective: effectiveCountry,
    countryName: countryInfo?.countryName || 'Unknown'
  });

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      
      if (existingStatus === 'granted') {
        setPermissionStatus('granted');
        return true;
      }

      // Show user-friendly alert explaining why we need location
      Alert.alert(
        'Location Permission Required',
        'To help you find nearby tasks and set your location quickly, this app needs access to your location.\n\nYou can always enter your location manually if you prefer.',
        [
          {
            text: 'Enter Manually',
            style: 'cancel',
            onPress: () => {
              setPermissionStatus('denied');
              // Focus on the search input
              console.log('📍 User chose to enter location manually');
            }
          },
          {
            text: 'Allow Location',
            onPress: async () => {
              const { status } = await Location.requestForegroundPermissionsAsync();
              const granted = status === 'granted';
              setPermissionStatus(granted ? 'granted' : 'denied');
              
              if (!granted) {
                Alert.alert(
                  'Location Access Needed',
                  'To use current location, please enable location permissions in your device settings.\n\nGo to Settings > MyToDoo > Location and select "While Using App"',
                  [
                    { text: 'Enter Manually', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
                  ]
                );
              }
              
              return granted;
            }
          }
        ]
      );
      
      return false;
    } catch (error) {
      if (__DEV__) {
        console.log('⚠️ Error requesting location permission:', error);
      }
      setPermissionStatus('denied');
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      setDetectingLocation(true);
      setError(null);
      console.log('📍 Getting current location...');
      
      // Check/request permissions
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        console.log('❌ Location permission denied');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // 10 seconds timeout
      });

      const coords: Coordinates = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      setCurrentLocation(coords);
      console.log('📍 Coordinates:', coords);
      
      // Reverse geocode to get readable address
      const reverseGeocodeResult = await Location.reverseGeocodeAsync({
        latitude: coords.lat,
        longitude: coords.lng,
      });
      
      if (reverseGeocodeResult.length > 0) {
        const address = reverseGeocodeResult[0];
        
        // 🎯 IMPROVED: Show only suburb/city, not full address
        const suburbOnly = address.city || address.subregion || address.district;
        const regionInfo = address.region;
        
        // Create a clean suburb + region format
        const shortAddress = [suburbOnly, regionInfo].filter(Boolean).join(', ');
        
        console.log('📍 Current location detected:', shortAddress);
        console.log('   Full address available:', {
          street: address.street,
          streetNumber: address.streetNumber,
          city: address.city,
          subregion: address.subregion,
          region: address.region,
          country: address.country
        });
        
        // Auto-fill with suburb only
        setQuery(shortAddress);
        
        // Automatically trigger onSelect with suburb location
        const locationData: LocationData = {
          address: shortAddress,
          coordinates: coords,
        };
        
        console.log('✅ Auto-selecting current suburb/city');
        onSelect(locationData);
        setSuggestions([]);
        setShowSuggestions(false);
        setError(null);
      }
      
    } catch (error: any) {
      if (__DEV__) {
        console.log('⚠️ Error getting current location:', error?.message || error);
      }
      
      // Provide specific error messages
      let errorMessage = 'Failed to get current location. ';
      if (error.code === 'E_LOCATION_TIMEOUT') {
        errorMessage += 'Location request timed out. Please try again or enter manually.';
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        errorMessage += 'Location services unavailable. Please enter manually.';
      } else {
        errorMessage += 'Please try again or enter manually.';
      }
      
      setError(errorMessage);
    } finally {
      setDetectingLocation(false);
    }
  };

  const searchMapboxPlaces = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      onDropdownStateChange?.(false);
      return;
    }

    // Check if Mapbox token is configured
    if (MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE' || !MAPBOX_ACCESS_TOKEN) {
      console.warn("⚠️ Mapbox access token not configured");
      setError("Configure Mapbox token for location search");
      setShowSuggestions(true);
      onDropdownStateChange?.(true);
      
      // Provide manual input option
      setSuggestions([{
        id: 'manual-input',
        place_name: `${searchQuery} (manual entry)`,
        center: [151.2093, -33.8688], // Default to Sydney coordinates
        text: searchQuery,
        place_type: ['manual']
      }]);
      return;
    }

    setLoading(true);
    setError(null);
    setShowSuggestions(true);
    onDropdownStateChange?.(true);

    try {
      // �🇺 AUSTRALIA-ONLY: Always show Australian suburbs only (no street addresses)
      // Use Mapbox Geocoding API - suburbs/places only for Australia
      const params: any = {
        access_token: MAPBOX_ACCESS_TOKEN,
        country: 'AU', // AUSTRALIA-ONLY: Always search in Australia
        // Show only suburbs, postcodes, and regions (NO street addresses)
        types: 'place,locality,postcode,region',
        autocomplete: true,
        limit: 10, // Request more so we can filter out street addresses
        language: 'en',
      };
      
      // Add proximity bias if we have current location
      if (currentLocation) {
        params.proximity = `${currentLocation.lng},${currentLocation.lat}`;
        console.log('📍 Using location proximity bias:', params.proximity);
      }
      
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json`,
        {
          params,
          timeout: 10000, // 10 second timeout
        }
      );

      console.log('🗺️ Mapbox response:', response.data);

      let features = response.data.features || [];
      console.log(`   Found ${features.length} raw suggestions`);
      
      // �🇺 AUSTRALIA-ONLY: Always filter to show only Australian suburbs (no street addresses)
      const beforeFilter = features.length;
      features = features.filter((f: LocationResult) => {
        // Keep only: place, postcode, region, locality (suburbs)
        // Remove: address (street names)
        const placeTypes = f.place_type || [];
        const isStreetAddress = placeTypes.includes('address');
        
        // Also check if the name looks like a street (contains "Road", "Street", "Avenue", etc.)
        const hasStreetKeyword = /\b(road|rd|street|st|avenue|ave|place|pl|drive|dr|lane|ln|court|ct|way|terrace|tce|crescent|cres|close|cl|circuit|cct|boulevard|blvd)\b/i.test(f.text || '');
        
        return !isStreetAddress && !hasStreetKeyword;
      });
      console.log(`🇦🇺 Filtered ${beforeFilter} → ${features.length} Australian suburbs (removed street addresses)`);
      
      // Limit to top 5 results after filtering
      features = features.slice(0, 5);
      setSuggestions(features);
      
      if (features.length === 0) {
        console.log('   No Australian suburbs found after filtering');
        setError("No suburbs found. Try a different search term.");
      } else {
        console.log('   Final Australian suburb suggestions:', features.map((f: LocationResult) => {
          const parts = f.place_name.split(',');
          return `${parts[0]} (${f.place_type?.join(',') || 'unknown'})`;
        }));
      }
      
    } catch (error: any) {
      // Only log non-network errors in development
      if (__DEV__) {
        const isNetworkError = error?.code === 'ERR_NETWORK' || 
                              error?.message?.includes('Network Error') ||
                              error?.message?.includes('timeout');
        if (!isNetworkError) {
          console.log('⚠️ Mapbox API error:', error?.message || error);
        }
      }
      
      // Handle network errors gracefully
      const isNetworkError = error?.code === 'ERR_NETWORK' || 
                            error?.message?.includes('Network Error') ||
                            error?.message?.includes('timeout');
      
      if (isNetworkError) {
        setError("No internet connection. Please check your network.");
      } else {
        setError("Failed to fetch locations");
      }
      
      // Provide fallback manual input
      setSuggestions([{
        id: 'manual-fallback',
        place_name: `${searchQuery} (enter manually)`,
        center: [151.2093, -33.8688],
        text: searchQuery,
        place_type: ['manual']
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    console.log('🔍 Location input changed:', value);
    setQuery(value);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (value.length < 2) {
      console.log('   Input too short, clearing suggestions');
      setSuggestions([]);
      setShowSuggestions(false);
      onDropdownStateChange?.(false);
      return;
    }
    
    // Debounce search requests
    console.log('   Scheduling search in 300ms...');
    searchTimeout.current = setTimeout(() => {
      console.log('   Executing search for:', value);
      searchMapboxPlaces(value);
    }, 300); // Wait 300ms after user stops typing
  };

  const extractSuburbAddress = (suggestion: LocationResult): string => {
    // For Australian and New Zealand addresses, extract just suburb and state
    // Mapbox place_name format: "Street Address, Suburb, State, Country"
    // We want: "Suburb, State"
    
    const placeParts = suggestion.place_name.split(',').map(p => p.trim());
    
    // If it's an address type (has street address), skip the first part
    const isAddress = suggestion.place_type?.includes('address');
    
    if (isAddress && placeParts.length >= 3) {
      // Format: ["Street", "Suburb", "State", "Country"]
      // Return: "Suburb, State"
      return `${placeParts[1]}, ${placeParts[2]}`;
    } else if (placeParts.length >= 2) {
      // Format: ["Suburb", "State", "Country"] or ["City", "Country"]
      // Return: "Suburb, State" or "City, Country"
      return placeParts.slice(0, 2).join(', ');
    }
    
    // Fallback to full place_name if parsing fails
    return suggestion.place_name;
  };

  const handleSelect = (suggestion: LocationResult) => {
    // Extract clean suburb name instead of full address
    const cleanAddress = extractSuburbAddress(suggestion);
    
    const locationData: LocationData = {
      address: cleanAddress,
      coordinates: {
        lat: suggestion.center[1], // Mapbox returns [lng, lat]
        lng: suggestion.center[0],
      },
    };

    console.log('📍 Location selected:', locationData);
    console.log('   Original place_name:', suggestion.place_name);
    console.log('   Extracted address:', cleanAddress);
    
    onSelect(locationData);
    setQuery(cleanAddress);
    setSuggestions([]);
    setShowSuggestions(false);
    onDropdownStateChange?.(false);
    setError(null);
  };

  const renderSuggestion = (item: LocationResult, index: number) => {
    // Extract location components for better display
    const isManual = item.place_type?.includes('manual');
    const locationParts = item.place_name.split(',');
    
    // 🎯 CRITICAL FIX: For Australian/NZ addresses, show suburb not street names
    // Mapbox returns: "Street Name, Suburb, State, Country" for addresses
    // We want to show: "Suburb, State" only
    const isAddress = item.place_type?.includes('address');
    const isAustraliaOrNZ = effectiveCountry === 'AU' || effectiveCountry === 'NZ';
    
    let mainLocation: string;
    let subLocation: string;
    
    if (isAddress && isAustraliaOrNZ && locationParts.length >= 3) {
      // Skip street name (first part), show suburb (second part) as main
      mainLocation = locationParts[1]?.trim() || item.text;
      // Show state and country as subLocation
      subLocation = locationParts.slice(2).join(',').trim();
    } else {
      // Default behavior for other location types (place, postcode, region)
      mainLocation = locationParts[0]?.trim() || item.text;
      subLocation = locationParts.slice(1).join(',').trim();
    }
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.suggestionItem,
          index === suggestions.length - 1 && styles.suggestionItemLast
        ]}
        onPress={() => {
          console.log('🔵 Suggestion tapped:', item.place_name);
          handleSelect(item);
        }}
        activeOpacity={0.7}
        delayPressIn={0}
      >
        <View style={styles.suggestionContent} pointerEvents="none">
          <Ionicons 
            name={isManual ? "create-outline" : "location-outline"} 
            size={20} 
            color="#666" 
            style={styles.suggestionIcon} 
          />
          <View style={styles.suggestionTextContainer}>
            <Text style={styles.suggestionMainText} numberOfLines={1}>{mainLocation}</Text>
            {subLocation && !isManual && (
              <Text style={styles.suggestionSubText} numberOfLines={2}>{subLocation}</Text>
            )}
            {isManual && (
              <Text style={styles.manualEntryText}>Tap to enter manually</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getLocationButtonText = () => {
    if (detectingLocation) return 'Getting your location...';
    if (permissionStatus === 'denied') return 'Enable location to use this';
    return 'Use Current Location';
  };

  const getLocationButtonStyle = () => {
    if (permissionStatus === 'denied') {
      return [styles.currentLocationButton, styles.currentLocationButtonDisabled];
    }
    return styles.currentLocationButton;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Use Current Location Button */}
      <TouchableOpacity
        onPress={getCurrentLocation}
        style={getLocationButtonStyle()}
        disabled={detectingLocation || isDetectingCountry}
      >
        {detectingLocation ? (
          <ActivityIndicator size="small" color="#4285F4" />
        ) : (
          <Ionicons 
            name="locate" 
            size={20} 
            color={permissionStatus === 'denied' ? '#999' : '#4285F4'} 
          />
        )}
        <Text style={[
          styles.currentLocationText,
          permissionStatus === 'denied' && styles.currentLocationTextDisabled
        ]}>
          {getLocationButtonText()}
        </Text>
      </TouchableOpacity>

      {/* Search Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleInputChange}
          placeholder={dynamicPlaceholder}
          placeholderTextColor="#999"
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
          editable={!detectingLocation && !isDetectingCountry}
          onFocus={() => {
            console.log('📍 Location input focused');
            onFocus?.();
            onDropdownStateChange?.(true);
          }}
        />
        {loading && (
          <ActivityIndicator size="small" color="#4285F4" style={styles.loadingIcon} />
        )}
      </View>

      {/* Dropdown Suggestions List */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.dropdownContainer} pointerEvents="box-none">
          <ScrollView
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            scrollEnabled={true}
            bounces={false}
            style={styles.dropdownList}
            contentContainerStyle={styles.dropdownContent}
            removeClippedSubviews={false}
          >
            {suggestions.map((item, index) => renderSuggestion(item, index))}
          </ScrollView>
        </View>
      )}

      {showSuggestions && error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={16} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 9999, // Extremely high to ensure dropdown appears above all content
    elevation: 9999, // For Android support
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F4FF',
    borderWidth: 1,
    borderColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  currentLocationButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#DDD',
  },
  currentLocationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4285F4',
  },
  currentLocationTextDisabled: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 48,
  },
  inputIcon: {
    marginRight: 12,
    color: '#999',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    padding: 0,
  },
  loadingIcon: {
    marginLeft: 8,
  },
  // Dropdown Styles
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 250, // Reduced from 400 to prevent excessive overlap
    elevation: 99999, // Extremely high for Android layering
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 99999, // Must be higher than parent container
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownList: {
    maxHeight: 250, // Reduced from 400 to prevent excessive overlap
  },
  dropdownContent: {
    paddingVertical: 4,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    backgroundColor: '#fff',
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  suggestionIcon: {
    marginRight: 12,
    marginTop: 3,
    color: '#666',
    flexShrink: 0,
  },
  suggestionTextContainer: {
    flex: 1,
    flexShrink: 1,
    paddingRight: 8,
  },
  suggestionMainText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    lineHeight: 22,
  },
  suggestionSubText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  manualEntryText: {
    fontSize: 14,
    color: '#4285F4',
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#FFF3F3',
    borderRadius: 8,
    marginTop: 4,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
});