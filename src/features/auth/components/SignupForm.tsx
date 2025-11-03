// Main Signup Form Component with all input fields

import { Ionicons } from '@expo/vector-icons';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React from 'react';
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
  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountry(country);
    setSelectedLocation(null);
    setShowCountryPicker(false);
  };

  return (
    <View style={styles.form}>
      {/* Name Row */}
      <View style={styles.nameRow}>
        <View style={styles.nameField}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
            autoCapitalize="words"
          />
        </View>
        
        <View style={styles.nameField}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
            autoCapitalize="words"
          />
        </View>
      </View>

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Country Picker */}
      <Text style={styles.label}>Country</Text>
      <CountryPicker
        selectedCountry={selectedCountry}
        showPicker={showCountryPicker}
        onTogglePicker={() => setShowCountryPicker(!showCountryPicker)}
        onSelectCountry={handleCountrySelect}
      />

      {/* Location Input */}
      <LocationInput
        selectedLocation={selectedLocation}
        countryCode={selectedCountry.code}
        onLocationSelect={setSelectedLocation}
      />

      {/* Date of Birth */}
      <DatePickerInput
        dateOfBirth={dateOfBirth}
        showDatePicker={showDatePicker}
        onTogglePicker={setShowDatePicker}
        onDateChange={handleDateChange}
      />

      {/* Mobile Number */}
      <Text style={styles.label}>Mobile Number</Text>
      <View style={styles.phoneContainer}>
        <View style={styles.phonePrefix}>
          <Text style={styles.phonePrefixText}>{selectedCountry.phoneCode}</Text>
        </View>
        <TextInput
          style={styles.phoneInput}
          value={phone}
          onChangeText={setPhone}
          placeholder="754640658"
          keyboardType="phone-pad"
        />
      </View>

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          value={password}
          onChangeText={setPassword}
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

      {/* Confirm Password */}
      <Text style={styles.label}>Confirm Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
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
  input: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
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
