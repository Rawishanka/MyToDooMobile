// Main Signup Form Component with all input fields

import { Ionicons } from '@expo/vector-icons';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
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

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  dateOfBirth?: string;
  location?: string;
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
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'firstName':
        if (!value || value.trim() === '') {
          newErrors.firstName = 'First name is required';
        } else if (value.trim().length < 2) {
          newErrors.firstName = 'First name must be at least 2 characters';
        } else {
          delete newErrors.firstName;
        }
        break;

      case 'lastName':
        if (!value || value.trim() === '') {
          newErrors.lastName = 'Last name is required';
        } else if (value.trim().length < 2) {
          newErrors.lastName = 'Last name must be at least 2 characters';
        } else {
          delete newErrors.lastName;
        }
        break;

      case 'email':
        if (!value || value.trim() === '') {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;

      case 'phone':
        if (!value || value.trim() === '') {
          newErrors.phone = 'Mobile number is required';
        } else if (!/^[0-9]{7,15}$/.test(value.replace(/[\s-]/g, ''))) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])/.test(value)) {
          newErrors.password = 'Password must contain at least one lowercase letter';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/(?=.*\d)/.test(value)) {
          newErrors.password = 'Password must contain at least one number';
        } else {
          delete newErrors.password;
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      case 'dateOfBirth':
        if (!value) {
          newErrors.dateOfBirth = 'Date of birth is required';
        } else {
          const age = new Date().getFullYear() - value.getFullYear();
          if (age < 18) {
            newErrors.dateOfBirth = 'You must be at least 18 years old';
          } else {
            delete newErrors.dateOfBirth;
          }
        }
        break;

      case 'location':
        if (!selectedLocation) {
          newErrors.location = 'Location is required';
        } else {
          delete newErrors.location;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    
    switch (field) {
      case 'firstName':
        validateField('firstName', firstName);
        break;
      case 'lastName':
        validateField('lastName', lastName);
        break;
      case 'email':
        validateField('email', email);
        break;
      case 'phone':
        validateField('phone', phone);
        break;
      case 'password':
        validateField('password', password);
        break;
      case 'confirmPassword':
        validateField('confirmPassword', confirmPassword);
        break;
      case 'dateOfBirth':
        validateField('dateOfBirth', dateOfBirth);
        break;
      case 'location':
        validateField('location', selectedLocation);
        break;
    }
  };

  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountry(country);
    setSelectedLocation(null);
    setShowCountryPicker(false);
  };

  const wrappedHandleSignUp = () => {
    // Mark all fields as touched
    const allFields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword', 'dateOfBirth', 'location'];
    const newTouched: Record<string, boolean> = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    // Validate all fields
    validateField('firstName', firstName);
    validateField('lastName', lastName);
    validateField('email', email);
    validateField('phone', phone);
    validateField('password', password);
    validateField('confirmPassword', confirmPassword);
    validateField('dateOfBirth', dateOfBirth);
    validateField('location', selectedLocation);

    // If no errors, proceed with signup
    if (Object.keys(errors).length === 0) {
      handleSignUp();
    }
  };

  return (
    <View style={styles.form}>
      {/* Name Row */}
      <View style={styles.nameRow}>
        <View style={styles.nameField}>
          <Text style={styles.label}>
            First Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, touched.firstName && errors.firstName && styles.inputError]}
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              if (touched.firstName) validateField('firstName', text);
            }}
            onBlur={() => handleBlur('firstName')}
            placeholder="Enter first name"
            autoCapitalize="words"
          />
          {touched.firstName && errors.firstName && (
            <Text style={styles.errorText}>{errors.firstName}</Text>
          )}
        </View>
        
        <View style={styles.nameField}>
          <Text style={styles.label}>
            Last Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, touched.lastName && errors.lastName && styles.inputError]}
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              if (touched.lastName) validateField('lastName', text);
            }}
            onBlur={() => handleBlur('lastName')}
            placeholder="Enter last name"
            autoCapitalize="words"
          />
          {touched.lastName && errors.lastName && (
            <Text style={styles.errorText}>{errors.lastName}</Text>
          )}
        </View>
      </View>

      {/* Email */}
      <Text style={styles.label}>
        Email <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        style={[styles.input, touched.email && errors.email && styles.inputError]}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (touched.email) validateField('email', text);
        }}
        onBlur={() => handleBlur('email')}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {touched.email && errors.email && (
        <Text style={styles.errorText}>{errors.email}</Text>
      )}

      {/* Country Picker */}
      <Text style={styles.label}>Country</Text>
      <CountryPicker
        selectedCountry={selectedCountry}
        showPicker={showCountryPicker}
        onTogglePicker={() => setShowCountryPicker(!showCountryPicker)}
        onSelectCountry={handleCountrySelect}
      />

      {/* Location Input */}
      <Text style={styles.label}>
        Location <Text style={styles.required}>*</Text>
      </Text>
      <LocationInput
        selectedLocation={selectedLocation}
        countryCode={selectedCountry.code}
        onLocationSelect={(location) => {
          setSelectedLocation(location);
          if (touched.location) validateField('location', location);
        }}
      />
      {touched.location && errors.location && (
        <Text style={styles.errorText}>{errors.location}</Text>
      )}

      {/* Date of Birth */}
      <DatePickerInput
        dateOfBirth={dateOfBirth}
        showDatePicker={showDatePicker}
        onTogglePicker={setShowDatePicker}
        onDateChange={handleDateChange}
      />

      {/* Mobile Number */}
      <Text style={styles.label}>
        Mobile Number <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.phoneContainer}>
        <View style={styles.phonePrefix}>
          <Text style={styles.phonePrefixText}>{selectedCountry.phoneCode}</Text>
        </View>
        <TextInput
          style={[styles.phoneInput, touched.phone && errors.phone && styles.inputError]}
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            if (touched.phone) validateField('phone', text);
          }}
          onBlur={() => handleBlur('phone')}
          placeholder="754640658"
          keyboardType="phone-pad"
        />
      </View>
      {touched.phone && errors.phone && (
        <Text style={styles.errorText}>{errors.phone}</Text>
      )}

      {/* Password */}
      <Text style={styles.label}>
        Password <Text style={styles.required}>*</Text>
      </Text>
      <View style={[styles.passwordContainer, touched.password && errors.password && styles.inputError]}>
        <TextInput
          style={styles.passwordInput}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (touched.password) validateField('password', text);
            if (touched.confirmPassword && confirmPassword) validateField('confirmPassword', confirmPassword);
          }}
          onBlur={() => handleBlur('password')}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
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
      {touched.password && errors.password && (
        <Text style={styles.errorText}>{errors.password}</Text>
      )}

      {/* Confirm Password */}
      <Text style={styles.label}>
        Confirm Password <Text style={styles.required}>*</Text>
      </Text>
      <View style={[styles.passwordContainer, touched.confirmPassword && errors.confirmPassword && styles.inputError]}>
        <TextInput
          style={styles.passwordInput}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (touched.confirmPassword) validateField('confirmPassword', text);
          }}
          onBlur={() => handleBlur('confirmPassword')}
          placeholder="Confirm your password"
          secureTextEntry={!showConfirmPassword}
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
      {touched.confirmPassword && errors.confirmPassword && (
        <Text style={styles.errorText}>{errors.confirmPassword}</Text>
      )}

      {/* Submit Button */}
      <TouchableOpacity 
        style={styles.signUpButton} 
        onPress={wrappedHandleSignUp} 
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
  required: {
    color: '#FF3B30',
    fontSize: 14,
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
    borderWidth: 1.5,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
    marginLeft: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 16,
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
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
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
    marginTop: 8,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});