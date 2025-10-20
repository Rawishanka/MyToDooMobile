import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

interface Coordinates {
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

interface LocationData {
  address: string;
  coordinates: Coordinates;
}

interface LocationAutocompleteProps {
  onSelect: (location: LocationData) => void;
  initialValue?: string;
  placeholder?: string;
  style?: any;
}

// Mapbox Access Token Configuration
// You can get your token from: https://account.mapbox.com/access-tokens/
// In React Native with Expo, use EXPO_PUBLIC_ prefix (equivalent to VITE_ in web)
const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || 'YOUR_MAPBOX_ACCESS_TOKEN_HERE';

// Mapbox Geocoding API configuration
const MAPBOX_BASE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const SEARCH_TYPES = 'country,region,postcode,district,place,locality,neighborhood,address';
const COUNTRIES = 'AU'; // Focus on Australia as shown in your image

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  onSelect,
  initialValue = "",
  placeholder = "Enter suburb, city or address",
  style,
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

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
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json`,
        {
          params: {
            access_token: MAPBOX_ACCESS_TOKEN,
            country: 'AU,NZ,LK', // Support Australia, New Zealand, and Sri Lanka (like web version)
            types: 'address,place,postcode,region', // Match web version types
            autocomplete: true,
            limit: 5, // Match web version limit
            language: 'en',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('🗺️ Mapbox response:', response.data);

      const features = response.data.features || [];
      setSuggestions(features);
      
      if (features.length === 0) {
        setError("No locations found. Try a different search term.");
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
    setQuery(value);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // Debounce search requests
    searchTimeout.current = setTimeout(() => {
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

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <Ionicons name="location-outline" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleInputChange}
          placeholder={placeholder}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          onBlur={() => {
            // Delay hiding suggestions to allow tap
            setTimeout(() => setShowSuggestions(false), 150);
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