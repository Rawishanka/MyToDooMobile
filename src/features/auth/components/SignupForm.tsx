// Main Signup Form Component with all input fields

import { Ionicons } from '@expo/vector-icons';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
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
  
  // Refs for input fields to enable scrolling to error
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'firstName':
        // Check if empty or whitespace only
        if (!value || value.trim() === '') {
          newErrors.firstName = 'First name is required';
        }
        // Check for numbers only
        else if (/^\d+$/.test(value.trim())) {
          newErrors.firstName = 'Only letters allowed';
        }
        // Check for special characters or numbers
        else if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
          newErrors.firstName = 'Only letters allowed';
        }
        // Check maximum length (50 characters)
        else if (value.trim().length > 50) {
          newErrors.firstName = 'First name must not exceed 50 characters';
        }
        // Valid input
        else {
          delete newErrors.firstName;
        }
        break;

      case 'lastName':
        // Check if empty or whitespace only
        if (!value || value.trim() === '') {
          newErrors.lastName = 'Last name is required';
        }
        // Check for numbers only
        else if (/^\d+$/.test(value.trim())) {
          newErrors.lastName = 'Only letters allowed';
        }
        // Check for special characters or numbers
        else if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
          newErrors.lastName = 'Only letters allowed';
        }
        // Check maximum length (50 characters)
        else if (value.trim().length > 50) {
          newErrors.lastName = 'Last name must not exceed 50 characters';
        }
        // Valid input
        else {
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

    // Collect all validation errors
    const validationErrors: ValidationErrors = {};
    
    // Validate each field and collect errors
    if (!firstName || firstName.trim() === '') {
      validationErrors.firstName = 'First name is required';
    } else if (/^\d+$/.test(firstName.trim())) {
      validationErrors.firstName = 'Only letters allowed';
    } else if (!/^[a-zA-Z\s'-]+$/.test(firstName.trim())) {
      validationErrors.firstName = 'Only letters allowed';
    } else if (firstName.trim().length > 50) {
      validationErrors.firstName = 'First name must not exceed 50 characters';
    }
    
    if (!lastName || lastName.trim() === '') {
      validationErrors.lastName = 'Last name is required';
    } else if (/^\d+$/.test(lastName.trim())) {
      validationErrors.lastName = 'Only letters allowed';
    } else if (!/^[a-zA-Z\s'-]+$/.test(lastName.trim())) {
      validationErrors.lastName = 'Only letters allowed';
    } else if (lastName.trim().length > 50) {
      validationErrors.lastName = 'Last name must not exceed 50 characters';
    }
    
    if (!email || email.trim() === '') {
      validationErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.email = 'Please enter a valid email address';
    }
    
    if (!phone || phone.trim() === '') {
      validationErrors.phone = 'Mobile number is required';
    } else if (!/^[0-9]{7,15}$/.test(phone.replace(/[\s-]/g, ''))) {
      validationErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!password) {
      validationErrors.password = 'Password is required';
    } else if (password.length < 8) {
      validationErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(password)) {
      validationErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(password)) {
      validationErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(password)) {
      validationErrors.password = 'Password must contain at least one number';
    }
    
    if (!confirmPassword) {
      validationErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!dateOfBirth) {
      validationErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = new Date().getFullYear() - dateOfBirth.getFullYear();
      if (age < 18) {
        validationErrors.dateOfBirth = 'You must be at least 18 years old';
      }
    }
    
    if (!selectedLocation) {
      validationErrors.location = 'Location is required';
    }
    
    // Set all errors at once
    setErrors(validationErrors);
    
    // If there are errors, show alert and focus on first error field
    if (Object.keys(validationErrors).length > 0) {
      // Find first error field
      const firstErrorField = allFields.find(field => validationErrors[field as keyof ValidationErrors]);
      
      // Create error message with specific field names
      const errorCount = Object.keys(validationErrors).length;
      const missingFields = Object.keys(validationErrors).map(field => {
        switch(field) {
          case 'firstName': return 'First Name';
          case 'lastName': return 'Last Name';
          case 'email': return 'Email';
          case 'phone': return 'Mobile Number';
          case 'password': return 'Password';
          case 'confirmPassword': return 'Confirm Password';
          case 'dateOfBirth': return 'Date of Birth';
          case 'location': return 'Location';
          default: return field;
        }
      });
      
      const errorMessage = errorCount === 1 
        ? `Please fill in: ${missingFields[0]}`
        : `Please fill in the following fields:\n• ${missingFields.join('\n• ')}`;
      
      Alert.alert(
        'Please Complete Form',
        errorMessage,
        [
          {
            text: 'OK',
            onPress: () => {
              // Focus on first error field
              switch(firstErrorField) {
                case 'firstName':
                  firstNameRef.current?.focus();
                  break;
                case 'lastName':
                  lastNameRef.current?.focus();
                  break;
                case 'email':
                  emailRef.current?.focus();
                  break;
                case 'phone':
                  phoneRef.current?.focus();
                  break;
                case 'password':
                  passwordRef.current?.focus();
                  break;
                case 'confirmPassword':
                  confirmPasswordRef.current?.focus();
                  break;
              }
            }
          }
        ]
      );
      return;
    }
    
    // If no errors, proceed with signup
    handleSignUp();
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
            ref={firstNameRef}
            style={[styles.input, touched.firstName && errors.firstName && styles.inputError]}
            value={firstName}
            onChangeText={(text) => {
              // Limit to 50 characters
              if (text.length <= 50) {
                setFirstName(text);
                if (touched.firstName) validateField('firstName', text);
              }
            }}
            onBlur={() => handleBlur('firstName')}
            placeholder="Enter first name"
            autoCapitalize="words"
            maxLength={50}
            returnKeyType="next"
            onSubmitEditing={() => lastNameRef.current?.focus()}
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
            ref={lastNameRef}
            style={[styles.input, touched.lastName && errors.lastName && styles.inputError]}
            value={lastName}
            onChangeText={(text) => {
              // Limit to 50 characters
              if (text.length <= 50) {
                setLastName(text);
                if (touched.lastName) validateField('lastName', text);
              }
            }}
            onBlur={() => handleBlur('lastName')}
            placeholder="Enter last name"
            autoCapitalize="words"
            maxLength={50}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
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
        ref={emailRef}
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
        returnKeyType="next"
        onSubmitEditing={() => phoneRef.current?.focus()}
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
        onLocationSelect={(loc) => setSelectedLocation(loc)}
        hasError={!!(touched.location && errors.location)}
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
      {touched.dateOfBirth && errors.dateOfBirth && (
        <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
      )}

      {/* Mobile Number */}
      <Text style={styles.label}>
        Mobile Number <Text style={styles.required}>*</Text>
      </Text>
      <View style={[styles.phoneContainer, touched.phone && errors.phone && styles.inputError]}>
        <View style={styles.phonePrefix}>
          <Text style={styles.phonePrefixText}>{selectedCountry.phoneCode}</Text>
        </View>
        <TextInput
          ref={phoneRef}
          style={styles.phoneInput}
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            if (touched.phone) validateField('phone', text);
          }}
          onBlur={() => handleBlur('phone')}
          placeholder="Mobile number"
          keyboardType="phone-pad"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
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
          ref={passwordRef}
          style={styles.passwordInput}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (touched.password) validateField('password', text);
          }}
          onBlur={() => handleBlur('password')}
          placeholder="Create a password"
          secureTextEntry={!showPassword}
          returnKeyType="next"
          onSubmitEditing={() => confirmPasswordRef.current?.focus()}
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
          ref={confirmPasswordRef}
          style={styles.passwordInput}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (touched.confirmPassword) validateField('confirmPassword', text);
          }}
          onBlur={() => handleBlur('confirmPassword')}
          placeholder="Confirm your password"
          secureTextEntry={!showConfirmPassword}
          returnKeyType="done"
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
    paddingHorizontal: 16,
    marginBottom: 4,
    backgroundColor: '#FAFAFA',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  passwordToggle: {
    padding: 8,
  },
  signUpButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
