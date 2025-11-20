import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  context?: Array<{id: string; text: string}>;
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
  country?: string; // ISO country code (e.g., 'AU', 'LK', 'US')
}

// Mapbox Access Token Configuration
const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || 'YOUR_MAPBOX_ACCESS_TOKEN_HERE';

// Mapbox Geocoding API configuration
const MAPBOX_BASE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  onSelect,
  onFocus,
  initialValue = "",
  placeholder = "Enter suburb, city or address",
  style,
  country, // Optional override - if not provided, will auto-detect
}) => {
  // Auto-detect country if not provided
  const { countryInfo, isDetecting: isDetectingCountry } = useLocationCountry();
  const effectiveCountry = country || countryInfo.countryCode;

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
    : `${placeholder} (${countryInfo.countryName})`;

  console.log('🌍 Using country for location search:', {
    provided: country,
    detected: countryInfo.countryCode,
    effective: effectiveCountry,
    countryName: countryInfo.countryName
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
      console.error('❌ Error requesting location permission:', error);
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
      console.error('❌ Error getting current location:', error);
      
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
      return;
    }

    // Check if Mapbox token is configured
    if (MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE' || !MAPBOX_ACCESS_TOKEN) {
      console.warn("⚠️ Mapbox access token not configured");
      setError("Configure Mapbox token for location search");
      setShowSuggestions(true);
      
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

    try {
      // Use Mapbox Geocoding API exactly like your web implementation
      const params: any = {
        access_token: MAPBOX_ACCESS_TOKEN,
        country: effectiveCountry, // Use detected country code
        types: 'address,place,postcode,region', // Match web version types
        autocomplete: true,
        limit: 5, // Match web version limit
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

      const features = response.data.features || [];
      console.log(`   Found ${features.length} suggestions`);
      setSuggestions(features);
      
      if (features.length === 0) {
        console.log('   No locations found');
        setError("No locations found. Try a different search term.");
      } else {
        console.log('   Suggestions:', features.map((f: LocationResult) => f.place_name));
      }
      
    } catch (error: any) {
      console.error('❌ Mapbox API error:', error);
      setError("Failed to fetch locations");
      
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
      return;
    }
    
    // Debounce search requests
    console.log('   Scheduling search in 300ms...');
    searchTimeout.current = setTimeout(() => {
      console.log('   Executing search for:', value);
      searchMapboxPlaces(value);
    }, 300); // Wait 300ms after user stops typing
  };

  const handleSelect = (suggestion: LocationResult) => {
    const locationData: LocationData = {
      address: suggestion.place_name,
      coordinates: {
        lat: suggestion.center[1], // Mapbox returns [lng, lat]
        lng: suggestion.center[0],
      },
    };

    console.log('📍 Location selected:', locationData);
    
    onSelect(locationData);
    setQuery(suggestion.place_name);
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
  };

  const renderSuggestion = ({ item }: { item: LocationResult }) => {
    // Extract location components for better display
    const isManual = item.place_type?.includes('manual');
    const locationParts = item.place_name.split(',');
    const mainLocation = locationParts[0]?.trim() || item.text;
    const subLocation = locationParts.slice(1).join(',').trim();
    
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.suggestionItem}
        onPress={() => handleSelect(item)}
      >
        <View style={styles.suggestionContent}>
          <Ionicons 
            name={isManual ? "create-outline" : "location-outline"} 
            size={18} 
            color="#666" 
            style={styles.suggestionIcon} 
          />
          <View style={styles.suggestionTextContainer}>
            <Text style={styles.suggestionMainText}>{mainLocation}</Text>
            {subLocation && !isManual && (
              <Text style={styles.suggestionSubText}>{subLocation}</Text>
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

      {/* Manual Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleInputChange}
          placeholder={dynamicPlaceholder}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
          editable={!detectingLocation && !isDetectingCountry}
          onFocus={() => {
            console.log('📍 Location input focused');
            if (query.length >= 2) {
              setShowSuggestions(true);
            }
            onFocus?.();
          }}
          onBlur={() => {
            console.log('📍 Location input blurred');
            // Delay hiding suggestions to allow tap
            setTimeout(() => setShowSuggestions(false), 200);
          }}
        />
        {loading && (
          <ActivityIndicator size="small" color="#4285F4" style={styles.loadingIcon} />
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <View style={styles.suggestionsList}>
            {suggestions.map((item) => renderSuggestion({ item }))}
          </View>
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
    zIndex: 1000,
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
    padding: 0, // Remove default padding
  },
  loadingIcon: {
    marginLeft: 8,
  },
  locationButton: {
    padding: 8,
    marginLeft: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 300,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  suggestionsList: {
    paddingVertical: 8,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  suggestionIcon: {
    marginRight: 12,
    marginTop: 2,
    color: '#666',
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionMainText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  suggestionSubText: {
    fontSize: 14,
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
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFF3F3',
    borderRadius: 8,
    marginTop: 4,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});