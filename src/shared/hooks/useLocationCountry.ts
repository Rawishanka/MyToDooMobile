/**
 * Hook to detect current location and determine country code
 * This will auto-detect the user's country for location filtering and currency
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

interface CountryInfo {
  countryCode: string; // ISO 2-letter code (AU, LK, US, etc.)
  countryName: string; // Full country name
  currency: string;    // Currency code (AUD, LKR, USD, etc.)
}

// Map country names to ISO codes and currency
const COUNTRY_MAP: Record<string, CountryInfo> = {
  // Primary supported countries
  'Australia': { countryCode: 'AU', countryName: 'Australia', currency: 'AUD' },
  'Sri Lanka': { countryCode: 'LK', countryName: 'Sri Lanka', currency: 'LKR' },
  'New Zealand': { countryCode: 'NZ', countryName: 'New Zealand', currency: 'NZD' },
  
  // Additional countries
  'United States': { countryCode: 'US', countryName: 'United States', currency: 'USD' },
  'Canada': { countryCode: 'CA', countryName: 'Canada', currency: 'CAD' },
  'United Kingdom': { countryCode: 'GB', countryName: 'United Kingdom', currency: 'GBP' },
  'Singapore': { countryCode: 'SG', countryName: 'Singapore', currency: 'SGD' },
  'Malaysia': { countryCode: 'MY', countryName: 'Malaysia', currency: 'MYR' },
  'India': { countryCode: 'IN', countryName: 'India', currency: 'INR' },
  'Philippines': { countryCode: 'PH', countryName: 'Philippines', currency: 'PHP' },
  'Thailand': { countryCode: 'TH', countryName: 'Thailand', currency: 'THB' },
  'Indonesia': { countryCode: 'ID', countryName: 'Indonesia', currency: 'IDR' },
};

// Default fallback - Australia (primary target country for this app)
const DEFAULT_COUNTRY: CountryInfo = {
  countryCode: 'AU',
  countryName: 'Australia', 
  currency: 'AUD'
};

// AsyncStorage key for caching detected country
const COUNTRY_CACHE_KEY = '@user_country_info';

// Global cache to store country info across hook instances
let globalCachedCountry: CountryInfo | null = null;
let isCacheLoaded = false;

// Load cache once on module import (runs before any component renders)
(async () => {
  try {
    const cached = await AsyncStorage.getItem(COUNTRY_CACHE_KEY);
    if (cached) {
      globalCachedCountry = JSON.parse(cached) as CountryInfo;
      isCacheLoaded = true;
      console.log('⚡ Pre-loaded country from cache on module load:', globalCachedCountry.countryName);
    } else {
      isCacheLoaded = true;
      console.log('ℹ️ No cached country found on module load');
    }
  } catch (error) {
    isCacheLoaded = true;
    console.log('⚠️ Failed to load cached country on module load:', error);
  }
})();

export const useLocationCountry = () => {
  // CRITICAL FIX: Don't initialize with DEFAULT_COUNTRY until cache is fully loaded
  // This prevents currency symbol flickering from $ (AUD) to Rs (LKR)
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(() => {
    // Only use cached country if module-level load completed
    if (isCacheLoaded && globalCachedCountry) {
      console.log('🏗️ useLocationCountry initializing with cached:', globalCachedCountry.countryName);
      return globalCachedCountry;
    }
    console.log('🏗️ useLocationCountry waiting for cache load...');
    return null; // Don't show anything until cache loads
  });
  const [isDetecting, setIsDetecting] = useState(!isCacheLoaded); // Only detecting if cache not loaded yet
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // Not initialized until we have real data

  // Load and detect country on mount
  useEffect(() => {
    const initializeCountry = async () => {
      try {
        // If cache wasn't loaded at module level, load it now
        if (!isCacheLoaded) {
          const cachedCountry = await AsyncStorage.getItem(COUNTRY_CACHE_KEY);
          if (cachedCountry) {
            const parsedCountry = JSON.parse(cachedCountry) as CountryInfo;
            console.log('⚡ Loaded cached country in useEffect:', parsedCountry.countryName);
            setCountryInfo(parsedCountry);
            globalCachedCountry = parsedCountry;
            setIsInitialized(true);
            isCacheLoaded = true;
          } else {
            // No cache - start GPS detection immediately
            console.log('ℹ️ No cache, starting GPS detection...');
            isCacheLoaded = true;
            detectCurrentCountry(true);
            return;
          }
        } else if (globalCachedCountry && !countryInfo) {
          // Cache was loaded at module level but state not set yet
          console.log('⚡ Applying pre-loaded cache:', globalCachedCountry.countryName);
          setCountryInfo(globalCachedCountry);
          setIsInitialized(true);
        } else if (!countryInfo) {
          // Cache loaded but empty - start GPS detection
          console.log('ℹ️ Cache empty, starting GPS detection...');
          detectCurrentCountry(true);
          return;
        }
        
        // Always detect in background to update if user moved
        setIsDetecting(false);
        detectCurrentCountry(false);
      } catch (error) {
        console.log('⚠️ Error in initializeCountry:', error);
        // Fallback to detection on error
        detectCurrentCountry(true);
        await detectCurrentCountry(true);
      }
    };

    initializeCountry();
  }, []);

  const detectCurrentCountry = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setIsDetecting(true);
      }
      setError(null);

      console.log('🌍 Starting country detection...');

      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('❌ Location permission denied, using default country:', DEFAULT_COUNTRY.countryName);
        setCountryInfo(DEFAULT_COUNTRY);
        globalCachedCountry = DEFAULT_COUNTRY;
        setIsInitialized(true); // CRITICAL: Mark as initialized with default
        // Cache the default country
        await AsyncStorage.setItem(COUNTRY_CACHE_KEY, JSON.stringify(DEFAULT_COUNTRY));
        return;
      }

      console.log('✅ Location permission granted, getting current position...');

      // Get current location with timeout
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 15000, // 15 seconds timeout
      });

      console.log('📍 Current location coordinates:', {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: new Date(location.timestamp).toISOString()
      });

      // Reverse geocode to get country
      const reverseGeocodeResult = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      console.log('🔍 Reverse geocode result:', reverseGeocodeResult);

      if (reverseGeocodeResult.length > 0) {
        const address = reverseGeocodeResult[0];
        const detectedCountry = address.country;
        
        console.log('📍 Detected country from GPS:', detectedCountry);
        console.log('🗺️ Full address details:', {
          country: address.country,
          region: address.region,
          city: address.city,
          postalCode: address.postalCode
        });

        if (detectedCountry && COUNTRY_MAP[detectedCountry]) {
          const newCountryInfo = COUNTRY_MAP[detectedCountry];
          console.log('✅ Using detected country info:', {
            countryName: newCountryInfo.countryName,
            countryCode: newCountryInfo.countryCode,
            currency: newCountryInfo.currency
          });
          setCountryInfo(newCountryInfo);
          globalCachedCountry = newCountryInfo;
          setIsInitialized(true); // CRITICAL: Mark as initialized after detection
          // Cache the detected country for future use
          await AsyncStorage.setItem(COUNTRY_CACHE_KEY, JSON.stringify(newCountryInfo));
          console.log('💾 Cached country info to AsyncStorage');
        } else {
          console.log('⚠️ Country not in supported list, using default:', detectedCountry);
          console.log('📋 Supported countries:', Object.keys(COUNTRY_MAP));
          setCountryInfo(DEFAULT_COUNTRY);
          globalCachedCountry = DEFAULT_COUNTRY;
          setIsInitialized(true); // CRITICAL: Mark as initialized with default
          await AsyncStorage.setItem(COUNTRY_CACHE_KEY, JSON.stringify(DEFAULT_COUNTRY));
        }
      } else {
        console.log('⚠️ No reverse geocode results, using default country');
        setCountryInfo(DEFAULT_COUNTRY);
        globalCachedCountry = DEFAULT_COUNTRY;
        setIsInitialized(true); // CRITICAL: Mark as initialized with default
        await AsyncStorage.setItem(COUNTRY_CACHE_KEY, JSON.stringify(DEFAULT_COUNTRY));
      }
      
    } catch (error: any) {
      if (__DEV__) {
        const isLocationError = error?.code?.includes('E_LOCATION') || 
                               error?.message?.includes('Location');
        if (!isLocationError) {
          console.log('⚠️ Error detecting country:', error?.message || error);
        }
      }
      setError('Unable to detect location');
      setCountryInfo(DEFAULT_COUNTRY);
      globalCachedCountry = DEFAULT_COUNTRY;
      setIsInitialized(true); // CRITICAL: Mark as initialized even on error
      // Cache default on error
      try {
        await AsyncStorage.setItem(COUNTRY_CACHE_KEY, JSON.stringify(DEFAULT_COUNTRY));
      } catch (e) {
        console.log('⚠️ Failed to cache default country:', e);
      }
    } finally {
      setIsDetecting(false);
      console.log('🏁 Country detection completed');
    }
  };

  return {
    countryInfo,
    isDetecting,
    isInitialized, // NEW: Flag to indicate if initial cache load is complete
    error,
    refetch: detectCurrentCountry,
  };
};