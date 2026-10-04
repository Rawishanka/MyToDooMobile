// Helper functions for signup form validation and data processing

import { Alert } from 'react-native';
import type { SignupFormData } from './signup-types';

/**
 * Calculate age from birth date
 */
export const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Validate if user meets minimum age requirement
 */
export const isAgeValid = (birthDate: Date, minAge: number = 18): boolean => {
  const age = calculateAge(birthDate);
  return age >= minAge;
};

/**
 * Format date for display (DD/MM/YYYY)
 */
export const formatDateForDisplay = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format date for API (YYYY-MM-DD)
 */
export const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Extract city from Mapbox address
 * Format: "Suburb, City, State/Province, Country"
 */
export const extractCityFromAddress = (address: string): string => {
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    return parts[0]; // Return suburb/locality as city
  }
  return address;
};

/**
 * Extract region from Mapbox address
 * Format: "Suburb, City, State/Province, Country"
 */
export const extractRegionFromAddress = (address: string): string => {
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 3) {
    return parts[parts.length - 2]; // Return state/province
  }
  if (parts.length >= 2) {
    return parts[1]; // Fallback to second part
  }
  return '';
};

/**
 * Reduce whatever the customer typed or pasted into the 9-digit Australian
 * mobile that follows the +61 prefix.
 *
 * Customers naturally type the domestic trunk "0" (0412 345 678), and some
 * paste the international form (+61 412 345 678 / 0061...). The +61 prefix is
 * already shown next to the field, so the leading 0 (and any pasted country
 * code) is dropped automatically rather than treated as an error.
 */
export const normalizeAuMobile = (raw: string): string => {
  let digits = (raw || '').replace(/\D/g, '');
  if (digits.startsWith('0061')) digits = digits.slice(4);
  else if (digits.startsWith('61') && digits.length > 9) digits = digits.slice(2);
  digits = digits.replace(/^0+/, '');
  return digits.slice(0, 9);
};

/**
 * Validate signup form data
 */
export const validateForm = (formData: SignupFormData): boolean => {
  if (!formData.firstName || !formData.lastName || !formData.email || 
      !formData.password || !formData.phone) {
    Alert.alert('Error', 'Please fill in all fields');
    return false;
  }

  // Location validation
  if (!formData.selectedCountry) {
    Alert.alert('Error', 'Please select your country');
    return false;
  }

  if (!formData.selectedLocation) {
    Alert.alert('Error', 'Please select your location (suburb/address)');
    return false;
  }

  // Date of birth validation
  if (!formData.dateOfBirth) {
    Alert.alert('Error', 'Please enter your date of birth');
    return false;
  }

  if (!isAgeValid(formData.dateOfBirth)) {
    const age = calculateAge(formData.dateOfBirth);
    Alert.alert(
      'Age Restriction',
      `You must be at least 18 years old to sign up. You are currently ${age} years old.`
    );
    return false;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    Alert.alert('Error', 'Please enter a valid email address');
    return false;
  }

  // Password validation
  if (formData.password.length < 8) {
    Alert.alert('Error', 'Password must be at least 8 characters long');
    return false;
  }

  if (formData.password !== formData.confirmPassword) {
    Alert.alert('Error', 'Passwords do not match');
    return false;
  }

  // Phone validation. The leading 0 is dropped automatically (see
  // normalizeAuMobile) so a customer typing 0412 345 678 is accepted.
  const phoneRegex = /^[0-9+\-\s()]+$/;
  if (!phoneRegex.test(formData.phone)) {
    Alert.alert('Invalid Mobile Number', 'Please enter a valid Australian mobile number');
    return false;
  }

  const phoneDigits = normalizeAuMobile(formData.phone);

  // AUSTRALIA-ONLY: mobile numbers are 9 digits after +61, starting with 4
  if (phoneDigits.length !== 9) {
    Alert.alert('Invalid Mobile Number', 'Australian mobile numbers must be 9 digits after +61 (e.g., 412345678)');
    return false;
  }

  if (!phoneDigits.startsWith('4')) {
    Alert.alert(
      'Invalid Mobile Number',
      'Australian mobile numbers must start with 4 (or 04).\n\nExample: 0412 345 678'
    );
    return false;
  }

  return true;
};

/**
 * Prepare signup data for API
 */
export const prepareSignupData = (formData: SignupFormData) => {
  return {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    password: formData.password,
    phone: normalizeAuMobile(formData.phone),
    dateOfBirth: formData.dateOfBirth ? formatDateForAPI(formData.dateOfBirth) : '',
    country: formData.selectedCountry.name,
    countryCode: formData.selectedCountry.code,
    region: formData.selectedLocation 
      ? extractRegionFromAddress(formData.selectedLocation.address) 
      : '',
    city: formData.selectedLocation 
      ? extractCityFromAddress(formData.selectedLocation.address) 
      : '',
    location: {
      address: formData.selectedLocation?.address || '',
      coordinates: formData.selectedLocation?.coordinates || { lat: 0, lng: 0 },
    },
  };
};
