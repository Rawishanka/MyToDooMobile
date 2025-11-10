/**
 * Hook to detect current location and determine country code
 * This will auto-detect the user's country for location filtering and currency
 */

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

// Default fallback (Australia)
const DEFAULT_COUNTRY: CountryInfo = {
  countryCode: 'AU',
  countryName: 'Australia', 
  currency: 'AUD'
};

export const useLocationCountry = () => {
  const [countryInfo, setCountryInfo] = useState<CountryInfo>(DEFAULT_COUNTRY);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectCurrentCountry();
  }, []);

  const detectCurrentCountry = async () => {
    try {
      setIsDetecting(true);
      setError(null);

      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('❌ Location permission denied, using default country:', DEFAULT_COUNTRY.countryName);
        setCountryInfo(DEFAULT_COUNTRY);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000, // 5 seconds timeout
      });

      // Reverse geocode to get country
      const reverseGeocodeResult = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocodeResult.length > 0) {
        const address = reverseGeocodeResult[0];
        const detectedCountry = address.country;
        
        console.log('📍 Detected country:', detectedCountry);

        if (detectedCountry && COUNTRY_MAP[detectedCountry]) {
          const countryInfo = COUNTRY_MAP[detectedCountry];
          console.log('✅ Using detected country info:', countryInfo);
          setCountryInfo(countryInfo);
        } else {
          console.log('⚠️ Country not in supported list, using default:', detectedCountry);
          setCountryInfo(DEFAULT_COUNTRY);
        }
      } else {
        console.log('⚠️ No reverse geocode results, using default country');
        setCountryInfo(DEFAULT_COUNTRY);
      }
      
    } catch (error) {
      console.error('❌ Error detecting country:', error);
      setError('Unable to detect location');
      setCountryInfo(DEFAULT_COUNTRY);
    } finally {
      setIsDetecting(false);
    }
  };

  return {
    countryInfo,
    isDetecting,
    error,
    refetch: detectCurrentCountry,
  };
};