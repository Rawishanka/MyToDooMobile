// Main Signup Form Component with all input fields

import { Ionicons } from '@expo/vector-icons';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import TermsConditionsScreen from '@/src/features/legal/screens/TermsConditionsScreen';
import PrivacyPolicyScreen from '@/src/features/legal/screens/PrivacyPolicyScreen';
import { DatePickerInput } from './DatePickerInput';
import { LocationInput } from './LocationInput';
import type { CountryData, LocationData } from './signup-types';
import { formatAbnInput } from '@/src/shared/utils/abnValidation';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';

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
  showDatePicker: boolean;
  
  // Loading
  loading: boolean;
  googleLoading?: boolean;
  appleLoading?: boolean;
  appleAuthAvailable?: boolean;
  
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
  setShowDatePicker: (show: boolean) => void;
  setDateOfBirth: (date: Date | null) => void;
  
  // Handlers
  handleSignUp: () => void;
  handleDateChange: (event: DateTimePickerEvent, selectedDate?: Date) => void;
  handleGoogleSignIn?: () => void;
  handleAppleSignIn?: () => void;
  
  // Tasker preferences
  notifyNewTask: boolean;
  notifySkillMatch: boolean;
  setNotifyNewTask: (v: boolean) => void;
  setNotifySkillMatch: (v: boolean) => void;

  // Optional ABN for taskers
  abnInput: string;
  setAbnInput: (value: string) => void;
  
  // Scroll control
  scrollViewRef?: React.RefObject<ScrollView | null>;
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
  showDatePicker,
  loading,
  googleLoading,
  appleLoading,
  appleAuthAvailable,
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
  setShowDatePicker,
  setDateOfBirth,
  handleSignUp,
  handleDateChange,
  handleGoogleSignIn,
  handleAppleSignIn,
  notifyNewTask,
  notifySkillMatch,
  setNotifyNewTask,
  setNotifySkillMatch,
  abnInput,
  setAbnInput,
  scrollViewRef,
}) => {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [showTermsWebView, setShowTermsWebView] = useState(false);
  const [showPrivacyWebView, setShowPrivacyWebView] = useState(false);
  
  // Effect to disable parent scroll when dropdown is open
  React.useEffect(() => {
    if (scrollViewRef?.current && scrollViewRef.current !== null) {
      scrollViewRef.current.setNativeProps({ scrollEnabled: !isLocationDropdownOpen });
    }
  }, [isLocationDropdownOpen, scrollViewRef]);
  
  // Refs for input fields to enable scrolling to error
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const validateField = (field: string, value: any, skipRequiredCheck: boolean = false) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'firstName':
        // Skip empty check if skipRequiredCheck is true (for onBlur validation)
        if (!skipRequiredCheck && (!value || value.trim() === '')) {
          newErrors.firstName = 'Required';
        }
        // Only validate format if field has value
        else if (value && value.trim() !== '') {
          if (/^\d+$/.test(value.trim())) {
            newErrors.firstName = 'Only letters allowed';
          } else if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
            newErrors.firstName = 'Only letters allowed';
          } else if (value.trim().length > 50) {
            newErrors.firstName = 'First name must not exceed 50 characters';
          } else {
            delete newErrors.firstName;
          }
        } else if (skipRequiredCheck) {
          // If skipping required check and field is empty, don't show error
          delete newErrors.firstName;
        }
        break;

      case 'lastName':
        // Skip empty check if skipRequiredCheck is true (for onBlur validation)
        if (!skipRequiredCheck && (!value || value.trim() === '')) {
          newErrors.lastName = 'Required';
        }
        // Only validate format if field has value
        else if (value && value.trim() !== '') {
          if (/^\d+$/.test(value.trim())) {
            newErrors.lastName = 'Only letters allowed';
          } else if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
            newErrors.lastName = 'Only letters allowed';
          } else if (value.trim().length > 50) {
            newErrors.lastName = 'Last name must not exceed 50 characters';
          } else {
            delete newErrors.lastName;
          }
        } else if (skipRequiredCheck) {
          delete newErrors.lastName;
        }
        break;

      case 'email':
        if (!skipRequiredCheck && (!value || value.trim() === '')) {
          newErrors.email = 'Required';
        } else if (value && value.trim() !== '') {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newErrors.email = 'Please enter a valid email address';
          } else {
            delete newErrors.email;
          }
        } else if (skipRequiredCheck) {
          delete newErrors.email;
        }
        break;

      case 'phone':
        if (!skipRequiredCheck && (!value || value.trim() === '')) {
          newErrors.phone = 'Required';
        } else if (value && value.trim() !== '') {
          if (!/^[0-9]{7,15}$/.test(value.replace(/[\s-]/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number';
          } else {
            delete newErrors.phone;
          }
        } else if (skipRequiredCheck) {
          delete newErrors.phone;
        }
        break;

      case 'password':
        if (!skipRequiredCheck && !value) {
          newErrors.password = 'Required';
        } else if (value) {
          if (value.length < 8) {
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
        } else if (skipRequiredCheck) {
          delete newErrors.password;
        }
        break;

      case 'confirmPassword':
        if (!skipRequiredCheck && !value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value) {
          if (value !== password) {
            newErrors.confirmPassword = 'Passwords do not match';
          } else {
            delete newErrors.confirmPassword;
          }
        } else if (skipRequiredCheck) {
          delete newErrors.confirmPassword;
        }
        break;

      case 'dateOfBirth':
        if (!skipRequiredCheck && !value) {
          newErrors.dateOfBirth = 'Required';
        } else if (value) {
          const age = new Date().getFullYear() - value.getFullYear();
          if (age < 18) {
            newErrors.dateOfBirth = 'You must be at least 18 years old';
          } else {
            delete newErrors.dateOfBirth;
          }
        } else if (skipRequiredCheck) {
          delete newErrors.dateOfBirth;
        }
        break;

      case 'location':
        if (!skipRequiredCheck && !selectedLocation) {
          newErrors.location = 'Required';
        } else if (selectedLocation) {
          delete newErrors.location;
        } else if (skipRequiredCheck) {
          delete newErrors.location;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    
    // Pass true to skip required validation on blur - only validate format
    switch (field) {
      case 'firstName':
        validateField('firstName', firstName, true);
        break;
      case 'lastName':
        validateField('lastName', lastName, true);
        break;
      case 'email':
        validateField('email', email, true);
        break;
      case 'phone':
        validateField('phone', phone, true);
        break;
      case 'password':
        validateField('password', password, true);
        break;
      case 'confirmPassword':
        validateField('confirmPassword', confirmPassword, true);
        break;
      case 'dateOfBirth':
        validateField('dateOfBirth', dateOfBirth, true);
        break;
      case 'location':
        validateField('location', selectedLocation, true);
        break;
    }
  };

  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountry(country);
    setSelectedLocation(null);
  };

  // Wrapper for handleDateChange to clear Required error
  const wrappedHandleDateChange = (event: any, selectedDate?: Date) => {
    handleDateChange(event, selectedDate);
    // Clear 'Required' error when date is selected
    if (selectedDate && errors.dateOfBirth === 'Required') {
      const newErrors = { ...errors };
      delete newErrors.dateOfBirth;
      setErrors(newErrors);
    }
  };

  const wrappedHandleSignUp = () => {
    // Mark all fields as touched
    const allFields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword', 'dateOfBirth', 'location'];
    const newTouched: Record<string, boolean> = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    // First, check if any required fields are empty (for generic "fill all fields" message)
    const emptyFields: string[] = [];
    if (!firstName || firstName.trim() === '') emptyFields.push('firstName');
    if (!lastName || lastName.trim() === '') emptyFields.push('lastName');
    if (!email || email.trim() === '') emptyFields.push('email');
    if (!phone || phone.trim() === '') emptyFields.push('phone');
    if (!password) emptyFields.push('password');
    if (!confirmPassword) emptyFields.push('confirmPassword');
    if (!dateOfBirth) emptyFields.push('dateOfBirth');
    if (!selectedLocation) emptyFields.push('location');

    // If there are empty required fields, show generic message
    if (emptyFields.length > 0) {
      // Set errors for empty fields (to show red borders)
      const validationErrors: ValidationErrors = {};
      if (emptyFields.includes('firstName')) validationErrors.firstName = 'Required';
      if (emptyFields.includes('lastName')) validationErrors.lastName = 'Required';
      if (emptyFields.includes('email')) validationErrors.email = 'Required';
      if (emptyFields.includes('phone')) validationErrors.phone = 'Required';
      if (emptyFields.includes('password')) validationErrors.password = 'Required';
      if (emptyFields.includes('confirmPassword')) validationErrors.confirmPassword = 'Required';
      if (emptyFields.includes('dateOfBirth')) validationErrors.dateOfBirth = 'Required';
      if (emptyFields.includes('location')) validationErrors.location = 'Required';
      
      setErrors(validationErrors);
      
      Alert.alert(
        'Required Fields',
        'Please fill out all the required fields.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Focus on first empty field
              const firstEmptyField = emptyFields[0];
              switch(firstEmptyField) {
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

    // All fields are filled - now check for format/validation errors
    const validationErrors: ValidationErrors = {};
    
    // Validate firstName format (not empty check since we already did that)
    if (/^\d+$/.test(firstName.trim())) {
      validationErrors.firstName = 'Only letters allowed';
    } else if (!/^[a-zA-Z\s'-]+$/.test(firstName.trim())) {
      validationErrors.firstName = 'Only letters allowed';
    } else if (firstName.trim().length > 50) {
      validationErrors.firstName = 'First name must not exceed 50 characters';
    }
    
    // Validate lastName format
    if (/^\d+$/.test(lastName.trim())) {
      validationErrors.lastName = 'Only letters allowed';
    } else if (!/^[a-zA-Z\s'-]+$/.test(lastName.trim())) {
      validationErrors.lastName = 'Only letters allowed';
    } else if (lastName.trim().length > 50) {
      validationErrors.lastName = 'Last name must not exceed 50 characters';
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.email = 'Please enter a valid email address';
    }
    
    // Validate phone format
    if (!/^[0-9]{7,15}$/.test(phone.replace(/[\s-]/g, ''))) {
      validationErrors.phone = 'Please enter a valid phone number';
    }
    
    // Validate password requirements
    if (password.length < 8) {
      validationErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(password)) {
      validationErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(password)) {
      validationErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(password)) {
      validationErrors.password = 'Password must contain at least one number';
    }
    
    // Validate confirm password match
    if (confirmPassword !== password) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Validate age
    const age = new Date().getFullYear() - dateOfBirth!.getFullYear();
    if (age < 18) {
      validationErrors.dateOfBirth = 'You must be at least 18 years old';
    }
    
    // Set all errors at once
    setErrors(validationErrors);
    
    // If there are validation errors, show specific error messages
    if (Object.keys(validationErrors).length > 0) {
      // Find first error field
      const firstErrorField = allFields.find(field => validationErrors[field as keyof ValidationErrors]);
      
      // Get specific error messages for display
      const errorMessages = Object.entries(validationErrors).map(([field, message]) => {
        const fieldName = {
          firstName: 'First Name',
          lastName: 'Last Name',
          email: 'Email',
          phone: 'Mobile Number',
          password: 'Password',
          confirmPassword: 'Confirm Password',
          dateOfBirth: 'Date of Birth',
          location: 'Location',
        }[field] || field;
        return `${fieldName}: ${message}`;
      });
      
      Alert.alert(
        'Validation Error',
        errorMessages.join('\n'),
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
          <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>
            First Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            ref={firstNameRef}
            style={[styles.input, touched.firstName && errors.firstName && styles.inputError, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }]}
            value={firstName}
            onChangeText={(text) => {
              // Limit to 50 characters
              if (text.length <= 50) {
                setFirstName(text);
                // Clear 'Required' error if user starts typing
                if (errors.firstName === 'Required') {
                  const newErrors = { ...errors };
                  delete newErrors.firstName;
                  setErrors(newErrors);
                }
                // Validate format if field was touched
                if (touched.firstName && text.trim() !== '') {
                  validateField('firstName', text, true);
                }
              }
            }}
            onBlur={() => handleBlur('firstName')}
            placeholder="Enter first name"
            placeholderTextColor={isDarkMode ? "#64748B" : "#999"}
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
          <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>
            Last Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            ref={lastNameRef}
            style={[styles.input, touched.lastName && errors.lastName && styles.inputError, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }]}
            value={lastName}
            onChangeText={(text) => {
              // Limit to 50 characters
              if (text.length <= 50) {
                setLastName(text);
                // Clear 'Required' error if user starts typing
                if (errors.lastName === 'Required') {
                  const newErrors = { ...errors };
                  delete newErrors.lastName;
                  setErrors(newErrors);
                }
                // Validate format if field was touched
                if (touched.lastName && text.trim() !== '') {
                  validateField('lastName', text, true);
                }
              }
            }}
            onBlur={() => handleBlur('lastName')}
            placeholder="Enter last name"
            placeholderTextColor={isDarkMode ? "#64748B" : "#999"}
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
      <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>
        Email <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        ref={emailRef}
        style={[styles.input, touched.email && errors.email && styles.inputError, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }]}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          // Clear 'Required' error if user starts typing
          if (errors.email === 'Required') {
            const newErrors = { ...errors };
            delete newErrors.email;
            setErrors(newErrors);
          }
          // Validate format if field was touched
          if (touched.email && text.trim() !== '') {
            validateField('email', text, true);
          }
        }}
        onBlur={() => handleBlur('email')}
        placeholder="Enter your email"
        placeholderTextColor={isDarkMode ? "#64748B" : "#999"}
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => phoneRef.current?.focus()}
      />
      {touched.email && errors.email && (
        <Text style={styles.errorText}>{errors.email}</Text>
      )}

      {/* Country Display - Australia Only (No dropdown) */}
      <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>Country</Text>
      <View style={[styles.countryDisplayContainer, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
        <View style={[styles.countryFlagWrap, isDarkMode && { backgroundColor: '#0F172A' }]}>
          <Text style={{ fontSize: RFValue(18) }}>{selectedCountry.flag || '🇦🇺'}</Text>
        </View>
        <Text style={[styles.countryDisplayText, isDarkMode && { color: '#F8FAFC' }]}>
          {selectedCountry.name}
        </Text>
        <Ionicons name="lock-closed-outline" size={14} color={isDarkMode ? '#64748B' : '#9CA3AF'} style={{ marginLeft: 'auto' }} />
      </View>

      {/* Location Input - Australian Suburbs */}
      <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>
        Suburb/Location <Text style={styles.required}>*</Text>
      </Text>
      <LocationInput
        selectedLocation={selectedLocation}
        countryCode="AU"
        onLocationSelect={(loc) => {
          setSelectedLocation(loc);
          // Clear 'Required' error when location is selected
          if (errors.location === 'Required' && loc) {
            const newErrors = { ...errors };
            delete newErrors.location;
            setErrors(newErrors);
          }
        }}
        hasError={!!(touched.location && errors.location)}
        onDropdownStateChange={setIsLocationDropdownOpen}
      />
      {touched.location && errors.location && (
        <Text style={styles.errorText}>{errors.location}</Text>
      )}

      {/* Date of Birth */}
      <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>
        Date of Birth <Text style={styles.required}>*</Text>
      </Text>
      <DatePickerInput
        dateOfBirth={dateOfBirth}
        showDatePicker={showDatePicker}
        onTogglePicker={setShowDatePicker}
        onDateChange={wrappedHandleDateChange}
        hasError={!!(touched.dateOfBirth && errors.dateOfBirth)}
      />
      {touched.dateOfBirth && errors.dateOfBirth && (
        <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
      )}

      {/* Mobile Number */}
      <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>
        Mobile Number <Text style={styles.required}>*</Text>
      </Text>
      <View style={[styles.phoneContainer, touched.phone && errors.phone && styles.inputError]}>
        <View style={[styles.phonePrefix, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
          <Text style={[styles.phonePrefixText, isDarkMode && { color: '#38BDF8' }]}>{selectedCountry.phoneCode}</Text>
        </View>
        <TextInput
          ref={phoneRef}
          style={[styles.phoneInput, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }]}
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            // Clear 'Required' error if user starts typing
            if (errors.phone === 'Required') {
              const newErrors = { ...errors };
              delete newErrors.phone;
              setErrors(newErrors);
            }
            // Validate format if field was touched
            if (touched.phone && text.trim() !== '') {
              validateField('phone', text, true);
            }
          }}
          onBlur={() => handleBlur('phone')}
          placeholder="Mobile number"
          placeholderTextColor={isDarkMode ? "#64748B" : "#999"}
          keyboardType="phone-pad"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
      </View>
      {touched.phone && errors.phone && (
        <Text style={styles.errorText}>{errors.phone}</Text>
      )}

      {/* Password */}
      <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>
        Password <Text style={styles.required}>*</Text>
      </Text>
      <View style={[styles.passwordContainer, touched.password && errors.password && styles.inputError, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
        <TextInput
          ref={passwordRef}
          style={[styles.passwordInput, isDarkMode && { color: '#F8FAFC' }]}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            // Clear 'Required' error if user starts typing
            if (errors.password === 'Required') {
              const newErrors = { ...errors };
              delete newErrors.password;
              setErrors(newErrors);
            }
            // Validate format if field was touched
            if (touched.password && text.trim() !== '') {
              validateField('password', text, true);
            }
          }}
          onBlur={() => handleBlur('password')}
          placeholder="Create a password"
          placeholderTextColor={isDarkMode ? "#64748B" : "#999"}
          secureTextEntry={!showPassword}
          textContentType="newPassword"
          autoComplete="password-new"
          importantForAutofill="yes"
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
      <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>
        Confirm Password <Text style={styles.required}>*</Text>
      </Text>
      <View style={[styles.passwordContainer, touched.confirmPassword && errors.confirmPassword && styles.inputError, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
        <TextInput
          ref={confirmPasswordRef}
          style={[styles.passwordInput, isDarkMode && { color: '#F8FAFC' }]}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            // Clear 'Required' error if user starts typing
            if (errors.confirmPassword === 'Required') {
              const newErrors = { ...errors };
              delete newErrors.confirmPassword;
              setErrors(newErrors);
            }
            // Validate format if field was touched
            if (touched.confirmPassword && text.trim() !== '') {
              validateField('confirmPassword', text, true);
            }
          }}
          onBlur={() => handleBlur('confirmPassword')}
          placeholder="Confirm your password"
          placeholderTextColor={isDarkMode ? "#64748B" : "#999"}
          secureTextEntry={!showConfirmPassword}
          textContentType="newPassword"
          autoComplete="password-new"
          importantForAutofill="yes"
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

      {/* Tasker Preferences */}
      <View style={[styles.taskerSection, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
        <Text style={[styles.taskerSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>Tasker Preferences</Text>
        <Text style={[styles.taskerSectionSubtitle, isDarkMode && { color: '#94A3B8' }]}>Register as a tasker to get notified when new tasks are posted.</Text>

        {/* Register as a Tasker */}
        <TouchableOpacity
          style={styles.taskerCheckRow}
          onPress={() => {
            const next = !notifyNewTask;
            setNotifyNewTask(next);
            if (!next) setNotifySkillMatch(false);
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.taskerCheckbox, notifyNewTask && styles.taskerCheckboxChecked]}>
            {notifyNewTask && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <View style={styles.taskerCheckContent}>
            <Text style={[styles.taskerCheckLabel, isDarkMode && { color: '#F8FAFC' }]}>Register as a Tasker</Text>
            <Text style={[styles.taskerCheckDesc, isDarkMode && { color: '#94A3B8' }]}>Get notified when new tasks are posted on the platform.</Text>
          </View>
        </TouchableOpacity>

        {/* Only notify me of tasks in my skillset */}
        <TouchableOpacity
          style={[styles.taskerCheckRow, !notifyNewTask && styles.taskerCheckRowDisabled]}
          onPress={() => { if (notifyNewTask) setNotifySkillMatch(!notifySkillMatch); }}
          activeOpacity={notifyNewTask ? 0.7 : 1}
        >
          <View style={[styles.taskerCheckbox, notifySkillMatch && notifyNewTask && styles.taskerCheckboxChecked, !notifyNewTask && styles.taskerCheckboxDisabled]}>
            {notifySkillMatch && notifyNewTask && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <View style={styles.taskerCheckContent}>
            <Text style={[styles.taskerCheckLabel, !notifyNewTask && styles.taskerCheckLabelDisabled, isDarkMode && { color: '#F8FAFC' }]}>Only notify me of tasks in my skillset</Text>
            <Text style={[styles.taskerCheckDesc, !notifyNewTask && styles.taskerCheckLabelDisabled, isDarkMode && { color: '#94A3B8' }]}>Filter notifications to tasks that match your skills only.</Text>
          </View>
        </TouchableOpacity>

        {notifyNewTask && (
          <View style={styles.abnFieldContainer}>
            <Text style={[styles.abnLabel, isDarkMode && { color: '#F8FAFC' }]}>Australian Business Number (ABN) (optional)</Text>
            <TextInput
              style={[styles.abnInput, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }]}
              value={abnInput}
              onChangeText={(text) => setAbnInput(formatAbnInput(text))}
              placeholder="XX XXX XXX XXX"
              placeholderTextColor={isDarkMode ? "#64748B" : "#999"}
              keyboardType="number-pad"
              maxLength={14}
              autoCorrect={false}
            />
            <Text style={[styles.abnHelper, isDarkMode && { color: '#94A3B8' }]}>
              You can skip this and add your ABN later. Required before payout setup.
            </Text>
          </View>
        )}
      </View>

      {/* Terms and Conditions Checkbox */}
      <View style={styles.termsContainer}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setTermsAccepted(!termsAccepted)}
        >
          <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
            {termsAccepted && (
              <Ionicons name="checkmark" size={16} color="#ffffff" />
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.termsTextContainer}>
          <Text style={[styles.termsText, isDarkMode && { color: '#94A3B8' }]}>
            By creating an account, you agree to the{' '}
          </Text>
          <TouchableOpacity onPress={() => setShowTermsWebView(true)}>
            <Text style={styles.termsLink}>MyToDoo Terms & Conditions</Text>
          </TouchableOpacity>
          <Text style={[styles.termsText, isDarkMode && { color: '#94A3B8' }]}> and </Text>
          <TouchableOpacity onPress={() => setShowPrivacyWebView(true)}>
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={[styles.termsText, isDarkMode && { color: '#94A3B8' }]}>.</Text>
        </View>
      </View>

      {/* Terms & Conditions WebView Modal */}
      <Modal visible={showTermsWebView} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <TermsConditionsScreen onBack={() => setShowTermsWebView(false)} />
        </SafeAreaView>
      </Modal>

      {/* Privacy Policy WebView Modal */}
      <Modal visible={showPrivacyWebView} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <PrivacyPolicyScreen onBack={() => setShowPrivacyWebView(false)} />
        </SafeAreaView>
      </Modal>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.signUpButton, !termsAccepted && styles.signUpButtonDisabled]} 
        onPress={wrappedHandleSignUp} 
        disabled={loading || !termsAccepted}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.signUpButtonText, !termsAccepted && styles.signUpButtonTextDisabled]}>
            Create Account
          </Text>
        )}
      </TouchableOpacity>

      {/* Divider */}
      {handleGoogleSignIn && (
        <>
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, isDarkMode && { backgroundColor: '#334155' }]} />
            <Text style={[styles.dividerText, isDarkMode && { color: '#64748B' }]}>OR</Text>
            <View style={[styles.divider, isDarkMode && { backgroundColor: '#334155' }]} />
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity 
            style={[styles.googleButton, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]} 
            onPress={handleGoogleSignIn} 
            disabled={googleLoading || loading || appleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#666" />
            ) : (
              <>
                <Image 
                  source={require('@/assets/icons/google.png')}
                  style={styles.googleIcon}
                />
                <Text style={[styles.googleButtonText, isDarkMode && { color: '#F8FAFC' }]}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Apple Sign-Up Button - Only show on iOS if available */}
          {Platform.OS === 'ios' && appleAuthAvailable && handleAppleSignIn && (
            <TouchableOpacity 
              style={styles.appleButton} 
              onPress={handleAppleSignIn} 
              disabled={appleLoading || loading || googleLoading}
            >
              {appleLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={20} color="#fff" style={styles.appleIcon} />
                  <Text style={styles.appleButtonText}>Continue with Apple</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </>
      )}
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
    fontSize: RFValue(14),
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  required: {
    color: '#FF3B30',
    fontSize: RFValue(14),
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: RFValue(15),
    marginBottom: 4,
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: RFValue(12),
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
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
  },
  phonePrefixText: {
    fontSize: RFValue(15),
    fontWeight: '600',
    color: '#333',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: RFValue(15),
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 4,
    backgroundColor: '#F8FAFC',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: RFValue(15),
  },
  passwordToggle: {
    padding: 8,
  },
  signUpButton: {
    backgroundColor: '#FF914D',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#FF914D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  signUpButtonDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
  signUpButtonTextDisabled: {
    color: '#666666',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF914D',
    borderColor: '#FF914D',
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  termsText: {
    fontSize: RFValue(14),
    color: '#666',
    lineHeight: 20,
  },
  termsLink: {
    fontSize: RFValue(14),
    color: '#0057FF',
    fontWeight: '600',
    lineHeight: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: RFValue(14),
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: RFValue(15),
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2,
  },
  appleIcon: {
    marginRight: 10,
  },
  appleButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: RFValue(15),
  },
  // Australia-only country display (non-editable)
  countryDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
    gap: 10,
  },
  countryFlagWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryDisplayText: {
    fontSize: RFValue(15),
    color: '#1A1D2E',
    fontWeight: '600',
  },
  // Tasker Preferences Section
  taskerSection: {
    backgroundColor: '#F0F6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D0E4FF',
  },
  taskerSectionTitle: {
    fontSize: RFValue(15),
    fontWeight: '700',
    color: '#0052A2',
    marginBottom: 4,
  },
  taskerSectionSubtitle: {
    fontSize: RFValue(12),
    color: '#666',
    marginBottom: 14,
    lineHeight: 18,
  },
  taskerCheckRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  taskerCheckRowDisabled: {
    opacity: 0.45,
  },
  taskerCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#0052A2',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  taskerCheckboxChecked: {
    backgroundColor: '#0052A2',
    borderColor: '#0052A2',
  },
  taskerCheckboxDisabled: {
    borderColor: '#bbb',
    backgroundColor: '#f0f0f0',
  },
  taskerCheckContent: {
    flex: 1,
  },
  taskerCheckLabel: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  taskerCheckLabelDisabled: {
    color: '#999',
  },
  taskerCheckDesc: {
    fontSize: RFValue(12),
    color: '#555',
    lineHeight: 17,
  },
  abnFieldContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  abnLabel: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  abnInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: RFValue(15),
    color: '#333',
    backgroundColor: '#fff',
  },
  abnHelper: {
    fontSize: RFValue(12),
    color: '#666',
    marginTop: 6,
    lineHeight: RFValue(16),
  },
});
