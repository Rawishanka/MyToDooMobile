// Main Signup Form Component with all input fields

import { Ionicons } from '@expo/vector-icons';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { CountryPicker } from './CountryPicker';
import { DatePickerInput } from './DatePickerInput';
import { LocationInput } from './LocationInput';
import type { CountryData, LocationData } from './signup-types';

// Validation error interface
interface ValidationErrors {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  dateOfBirth: string;
  country: string;
  location: string;
}

interface SignupFormProps {
  // Form state
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  dateOfBirth: Date | null;
  showPassword: boolean;
  showConfirmPassword: boolean;
  
  // Location state
  selectedCountry: CountryData;
  selectedLocation: LocationData | null;
  showCountryPicker: boolean;
  showDatePicker: boolean;
  
  // Loading
  loading: boolean;
  
  // Setters
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setPhone: (value: string) => void;
  setShowPassword: (value: boolean) => void;
  setShowConfirmPassword: (value: boolean) => void;
  setSelectedCountry: (country: CountryData) => void;
  setSelectedLocation: (location: LocationData | null) => void;
  setShowCountryPicker: (show: boolean) => void;
  setShowDatePicker: (show: boolean) => void;
  setDateOfBirth: (date: Date | null) => void;
  
  // Handlers
  handleSignUp: () => void;
  handleDateChange: (event: DateTimePickerEvent, selectedDate?: Date) => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  phone,
  dateOfBirth,
  showPassword,
  showConfirmPassword,
  selectedCountry,
  selectedLocation,
  showCountryPicker,
  showDatePicker,
  loading,
  setFirstName,
  setLastName,
  setEmail,
  setPassword,
  setConfirmPassword,
  setPhone,
  setShowPassword,
  setShowConfirmPassword,
  setSelectedCountry,
  setSelectedLocation,
  setShowCountryPicker,
  setShowDatePicker,
  setDateOfBirth,
  handleSignUp,
  handleDateChange,
}) => {
  // State for validation errors
  const [errors, setErrors] = useState<ValidationErrors>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    country: '',
    location: '',
  });

  // State to track which fields have been touched
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  // Validation functions
  const validateFirstName = (value: string): string => {
    if (!value.trim()) return 'First name is required';
    if (value.trim().length < 2) return 'First name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(value)) return 'First name can only contain letters and spaces';
    if (value.trim().length > 50) return 'First name cannot exceed 50 characters';
    return '';
  };

  const validateLastName = (value: string): string => {
    if (!value.trim()) return 'Last name is required';
    if (value.trim().length < 2) return 'Last name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(value)) return 'Last name can only contain letters and spaces';
    if (value.trim().length > 50) return 'Last name cannot exceed 50 characters';
    return '';
  };

  const validateEmail = (value: string): string => {
    if (!value.trim()) return 'Email address is required';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    if (value.length > 100) return 'Email address cannot exceed 100 characters';
    return '';
  };

  const validatePassword = (value: string): string => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters long';
    if (value.length > 128) return 'Password cannot exceed 128 characters';
    if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(value)) return 'Password must contain at least one special character';
    return '';
  };

  const validateConfirmPassword = (value: string, originalPassword: string): string => {
    if (!value) return 'Please confirm your password';
    if (value !== originalPassword) return 'Passwords do not match';
    return '';
  };

  const validatePhone = (value: string): string => {
    if (!value.trim()) return 'Mobile number is required';
    // Remove any spaces, dashes, or parentheses for validation
    const cleanPhone = value.replace(/[\s\-()]/g, '');
    if (!/^\d{8,15}$/.test(cleanPhone)) return 'Please enter a valid mobile number (8-15 digits)';
    return '';
  };

  const validateDateOfBirth = (value: Date | null): string => {
    if (!value) return 'Date of birth is required';
    const today = new Date();
    const age = today.getFullYear() - value.getFullYear();
    const monthDiff = today.getMonth() - value.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < value.getDate())) {
      const adjustedAge = age - 1;
      if (adjustedAge < 13) return 'You must be at least 13 years old';
      if (adjustedAge > 120) return 'Please enter a valid date of birth';
    } else {
      if (age < 13) return 'You must be at least 13 years old';
      if (age > 120) return 'Please enter a valid date of birth';
    }
    
    if (value > today) return 'Date of birth cannot be in the future';
    return '';
  };

  const validateCountry = (): string => {
    if (!selectedCountry || !selectedCountry.name) return 'Please select your country';
    return '';
  };

  const validateLocation = (): string => {
    if (!selectedLocation || !selectedLocation.address) return 'Please select your location';
    return '';
  };

  // Update validation errors when fields change
  useEffect(() => {
    setErrors(prev => ({
      ...prev,
      firstName: touched.firstName ? validateFirstName(firstName) : '',
      lastName: touched.lastName ? validateLastName(lastName) : '',
      email: touched.email ? validateEmail(email) : '',
      password: touched.password ? validatePassword(password) : '',
      confirmPassword: touched.confirmPassword ? validateConfirmPassword(confirmPassword, password) : '',
      phone: touched.phone ? validatePhone(phone) : '',
      dateOfBirth: touched.dateOfBirth ? validateDateOfBirth(dateOfBirth) : '',
      country: touched.country ? validateCountry() : '',
      location: touched.location ? validateLocation() : '',
    }));
  }, [firstName, lastName, email, password, confirmPassword, phone, dateOfBirth, selectedCountry, selectedLocation, touched]);

  // Mark field as touched when user interacts with it
  const handleFieldTouch = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  // Enhanced input handlers with validation
  const handleFirstNameChange = (value: string) => {
    // Only allow letters and spaces
    const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
    setFirstName(filteredValue);
    handleFieldTouch('firstName');
  };

  const handleLastNameChange = (value: string) => {
    // Only allow letters and spaces
    const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
    setLastName(filteredValue);
    handleFieldTouch('lastName');
  };

  const handleEmailChange = (value: string) => {
    // Convert to lowercase and remove any spaces
    const filteredValue = value.toLowerCase().replace(/\s/g, '');
    setEmail(filteredValue);
    handleFieldTouch('email');
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    handleFieldTouch('password');
    // Also validate confirm password if it's been touched
    if (touched.confirmPassword) {
      handleFieldTouch('confirmPassword');
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    handleFieldTouch('confirmPassword');
  };

  const handlePhoneChange = (value: string) => {
    // Only allow numbers, spaces, dashes, and parentheses
    const filteredValue = value.replace(/[^0-9\s\-()]/g, '');
    setPhone(filteredValue);
    handleFieldTouch('phone');
  };
  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountry(country);
    setSelectedLocation(null);
    setShowCountryPicker(false);
    handleFieldTouch('country');
    // Reset location validation since location changed
    if (touched.location) {
      handleFieldTouch('location');
    }
  };

  const handleLocationSelect = (location: LocationData | null) => {
    setSelectedLocation(location);
    handleFieldTouch('location');
  };

  const handleDateSelect = (event: DateTimePickerEvent, selectedDate?: Date) => {
    handleDateChange(event, selectedDate);
    handleFieldTouch('dateOfBirth');
  };

  // Helper function to get input style based on error state
  const getInputStyle = (hasError: boolean) => [
    styles.input,
    hasError && styles.inputError
  ];

  const getPasswordContainerStyle = (hasError: boolean) => [
    styles.passwordContainer,
    hasError && styles.passwordContainerError
  ];

  const getPhoneInputStyle = (hasError: boolean) => [
    styles.phoneInput,
    hasError && styles.inputError
  ];

  // Helper to render error message
  const renderErrorMessage = (error: string) => (
    error ? <Text style={styles.errorText}>{error}</Text> : null
  );

  // Helper to render required label with red asterisk
  const renderLabel = (text: string, isRequired = true) => (
    <Text style={styles.label}>
      {text}
      {isRequired && <Text style={styles.requiredMark}> *</Text>}
    </Text>
  );

  return (
    <View style={styles.form}>
      {/* Name Row */}
      <View style={styles.nameRow}>
        <View style={styles.nameField}>
          {renderLabel('First Name')}
          <TextInput
            style={getInputStyle(!!errors.firstName)}
            value={firstName}
            onChangeText={handleFirstNameChange}
            onBlur={() => handleFieldTouch('firstName')}
            placeholder="Enter first name"
            autoCapitalize="words"
            maxLength={50}
          />
          {renderErrorMessage(errors.firstName)}
        </View>
        
        <View style={styles.nameField}>
          {renderLabel('Last Name')}
          <TextInput
            style={getInputStyle(!!errors.lastName)}
            value={lastName}
            onChangeText={handleLastNameChange}
            onBlur={() => handleFieldTouch('lastName')}
            placeholder="Enter last name"
            autoCapitalize="words"
            maxLength={50}
          />
          {renderErrorMessage(errors.lastName)}
        </View>
      </View>

      {/* Email */}
      {renderLabel('Email Address')}
      <TextInput
        style={getInputStyle(!!errors.email)}
        value={email}
        onChangeText={handleEmailChange}
        onBlur={() => handleFieldTouch('email')}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        maxLength={100}
      />
      {renderErrorMessage(errors.email)}

      {/* Country Picker */}
      {renderLabel('Country')}
      <CountryPicker
        selectedCountry={selectedCountry}
        showPicker={showCountryPicker}
        onTogglePicker={() => setShowCountryPicker(!showCountryPicker)}
        onSelectCountry={handleCountrySelect}
        hasError={!!errors.country}
      />
      {renderErrorMessage(errors.country)}

      {/* Location Input */}
      {renderLabel('Location')}
      <LocationInput
        selectedLocation={selectedLocation}
        countryCode={selectedCountry.code}
        onLocationSelect={handleLocationSelect}
        hasError={!!errors.location}
      />
      {renderErrorMessage(errors.location)}

      {/* Date of Birth */}
      {renderLabel('Date of Birth')}
      <DatePickerInput
        dateOfBirth={dateOfBirth}
        showDatePicker={showDatePicker}
        onTogglePicker={setShowDatePicker}
        onDateChange={handleDateSelect}
        hasError={!!errors.dateOfBirth}
      />
      {renderErrorMessage(errors.dateOfBirth)}

      {/* Mobile Number */}
      {renderLabel('Mobile Number')}
      <View style={styles.phoneContainer}>
        <View style={styles.phonePrefix}>
          <Text style={styles.phonePrefixText}>{selectedCountry.phoneCode}</Text>
        </View>
        <TextInput
          style={getPhoneInputStyle(!!errors.phone)}
          value={phone}
          onChangeText={handlePhoneChange}
          onBlur={() => handleFieldTouch('phone')}
          placeholder="754640658"
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>
      {renderErrorMessage(errors.phone)}

      {/* Password */}
      {renderLabel('Password')}
      <View style={getPasswordContainerStyle(!!errors.password)}>
        <TextInput
          style={styles.passwordInput}
          value={password}
          onChangeText={handlePasswordChange}
          onBlur={() => handleFieldTouch('password')}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          maxLength={128}
        />
        <TouchableOpacity 
          style={styles.passwordToggle}
          onPress={() => setShowPassword(!showPassword)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
            size={22} 
            color="#666" 
          />
        </TouchableOpacity>
      </View>
      {renderErrorMessage(errors.password)}
      <Text style={styles.passwordHint}>
        Password must contain at least 8 characters with uppercase, lowercase, number and special character
      </Text>

      {/* Confirm Password */}
      {renderLabel('Confirm Password')}
      <View style={getPasswordContainerStyle(!!errors.confirmPassword)}>
        <TextInput
          style={styles.passwordInput}
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          onBlur={() => handleFieldTouch('confirmPassword')}
          placeholder="Confirm your password"
          secureTextEntry={!showConfirmPassword}
          maxLength={128}
        />
        <TouchableOpacity 
          style={styles.passwordToggle}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
            size={22} 
            color="#666" 
          />
        </TouchableOpacity>
      </View>
      {renderErrorMessage(errors.confirmPassword)}

      {/* Submit Button */}
      <TouchableOpacity 
        style={styles.signUpButton} 
        onPress={handleSignUp} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.signUpButtonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  requiredMark: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 4,
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  passwordHint: {
    color: '#666',
    fontSize: 11,
    marginBottom: 12,
    marginLeft: 4,
    lineHeight: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 4,
    gap: 10,
  },
  phonePrefix: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
  },
  phonePrefixText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: '#FAFAFA',
  },
  passwordContainerError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  passwordToggle: {
    paddingHorizontal: 12,
  },
  signUpButton: {
    backgroundColor: '#0057FF',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
