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

  // Phone validation - basic format check
  const phoneRegex = /^[0-9+\-\s()]+$/;
  if (!phoneRegex.test(formData.phone)) {
    Alert.alert('Invalid Mobile Number', 'Please enter a valid mobile number');
    return false;
  }

  // Get phone digits only for length validation
  const phoneDigits = formData.phone.replace(/[^0-9]/g, '');
  
  // Country-specific validation for international format
  // Australia (+61), New Zealand (+64), and Sri Lanka (+94) all require
  // removing the leading 0 when using international format
  const countryCode = formData.selectedCountry?.code;
  
  // Check for leading 0
  if (formData.phone.startsWith('0')) {
    let errorMessage = '';
    let exampleNumber = '';
    
    switch (countryCode) {
      case 'AU':
        errorMessage = 'For Australia (+61), please enter your mobile number without the leading 0.';
        exampleNumber = 'Example: Enter 412345678 instead of 0412345678';
        break;
      case 'NZ':
        errorMessage = 'For New Zealand (+64), please enter your mobile number without the leading 0.';
        exampleNumber = 'Example: Enter 211234567 instead of 0211234567';
        break;
      case 'LK':
        errorMessage = 'Please enter a valid mobile number';
        exampleNumber = 'Do not include the leading 0 with country code +94';
        break;
      default:
        // For other countries, if they use international format, the leading 0 should generally be removed
        errorMessage = `For ${formData.selectedCountry?.name} (${formData.selectedCountry?.phoneCode}), please enter your mobile number without the leading 0.`;
        exampleNumber = 'The leading 0 is only used for domestic dialing.';
        break;
    }
    
    Alert.alert('Invalid Mobile Number', `${errorMessage}\n${exampleNumber}`);
    return false;
  }

  // Country-specific length validation
  let minLength = 7;
  let maxLength = 15;
  let lengthErrorMessage = 'Please enter a valid mobile number';
  
  switch (countryCode) {
    case 'AU':
      // Australian mobile numbers are 9 digits (without leading 0)
      minLength = 9;
      maxLength = 9;
      lengthErrorMessage = 'Australian mobile numbers must be 9 digits (e.g., 412345678)';
      break;
    case 'NZ':
      // New Zealand mobile numbers are 8-10 digits (without leading 0)
      minLength = 8;
      maxLength = 10;
      lengthErrorMessage = 'New Zealand mobile numbers must be 8-10 digits (e.g., 211234567)';
      break;
    case 'LK':
      // Sri Lankan mobile numbers are 9 digits (without leading 0)
      minLength = 9;
      maxLength = 9;
      lengthErrorMessage = 'Sri Lankan mobile numbers must be 9 digits (e.g., 771234567)';
      break;
    default:
      // General validation for other countries
      minLength = 7;
      maxLength = 15;
      lengthErrorMessage = 'Please enter a valid mobile number';
      break;
  }

  // Validate phone number length
  if (phoneDigits.length < minLength || phoneDigits.length > maxLength) {
    Alert.alert('Invalid Mobile Number', lengthErrorMessage);
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
    phone: formData.phone,
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
