// ...existing code...
//     <SafeAreaView style={styles.container}>
//       {/* Cross icon in top right */}
//       <TouchableOpacity
//         style={styles.closeIcon}
//         onPress={() => router.replace('/')}
//         hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
//       >
//         <Ionicons name="close" size={28} color="#333" />
//       </TouchableOpacity>
      
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         style={styles.innerContainer}
//       >
//         <View style={styles.header}>
//           <Text style={styles.title}>Create Account</Text>
//           <Text style={styles.subtitle}>Sign up to get started</Text>
//         </View>

//         <View style={styles.form}>
//           <View style={styles.nameRow}>
//             <View style={styles.nameField}>
//               <Text style={styles.label}>First Name</Text>
//               <TextInput
//                 style={styles.input}
//                 value={firstName}
//                 onChangeText={setFirstName}
//                 placeholder="Enter first name"
//                 autoCapitalize="words"
//               />
//             </View>
            
//             <View style={styles.nameField}>
//               <Text style={styles.label}>Last Name</Text>
//               <TextInput
//                 style={styles.input}
//                 value={lastName}
//                 onChangeText={setLastName}
//                 placeholder="Enter last name"
//                 autoCapitalize="words"
//               />
//             </View>
//           </View>

//           <Text style={styles.label}>Email</Text>
//           <TextInput
//             style={styles.input}
//             value={email}
//             onChangeText={setEmail}
//             placeholder="Enter your email"
//             keyboardType="email-address"
//             autoCapitalize="none"
//           />
//           <Text style={styles.label}>Phone Number</Text>
//           <TextInput
//             style={styles.input}
//             value={phone}
//             onChangeText={setPhone}
//             placeholder="Enter your phone number"
//             keyboardType="phone-pad"
//             autoCapitalize="none"
//           />

//           <Text style={styles.label}>Password</Text>
//           <TextInput
//             style={styles.input}
//             value={password}
//             onChangeText={setPassword}
//             placeholder="Enter your password"
//             secureTextEntry
//           />

//           <Text style={styles.label}>Confirm Password</Text>
//           <TextInput
//             style={styles.input}
//             value={confirmPassword}
//             onChangeText={setConfirmPassword}
//             placeholder="Confirm your password"
//             secureTextEntry
//           />

//           <TouchableOpacity 
//             style={styles.signUpButton} 
//             onPress={handleSignUp} 
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.signUpButtonText}>Create Account</Text>
//             )}
//           </TouchableOpacity>
//         </View>

//         <View style={styles.footer}>
//           <Text style={styles.footerText}>Already have an account? </Text>
//           <TouchableOpacity onPress={() => router.push('./login-screen')}>
//             <Text style={styles.registerText}>Sign In</Text>
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>

//       {/* OTP Verification Modal */}
//       <Modal
//         visible={showOtpModal}
//         transparent={true}
//         animationType="slide"
//         onRequestClose={() => {
//           // Prevent closing modal by back button - user must verify OTP
//         }}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Verify Your Email</Text>
//               <Text style={styles.modalSubtitle}>
//                 We've sent a 6-digit verification code to
//               </Text>
//               <Text style={styles.emailText}>{email}</Text>
//             </View>

//             <View style={styles.otpContainer}>
//               <Text style={styles.otpLabel}>Enter Verification Code</Text>
//               <TextInput
//                 style={styles.otpInput}
//                 value={otp}
//                 onChangeText={setOtp}
//                 placeholder="000000"
//                 keyboardType="numeric"
//                 maxLength={6}
//                 textAlign="center"
//                 autoFocus={true}
//               />
//               <Text style={styles.otpHelperText}>
//                 Check your email for the verification code
//               </Text>
//             </View>

//             <View style={styles.modalActions}>
//               <TouchableOpacity 
//                 style={[styles.verifyButton, (!otp || otp.length !== 6) && styles.verifyButtonDisabled]} 
//                 onPress={handleVerifyOTP} 
//                 disabled={otpLoading || !otp || otp.length !== 6}
//               >
//                 {otpLoading ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <Text style={styles.verifyButtonText}>Verify & Complete</Text>
//                 )}
//               </TouchableOpacity>

//               <TouchableOpacity 
//                 style={styles.resendButton}
//                 onPress={() => {
//                   // You can add resend OTP functionality here
//                   Alert.alert('Resend OTP', 'OTP resent to your email!');
//                 }}
//               >
//                 <Text style={styles.resendButtonText}>Didn't receive code? Resend</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   innerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: 24,
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 32,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     color: '#333',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//   },
//   form: {
//     marginBottom: 24,
//   },
//   nameRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 0,
//   },
//   nameField: {
//     flex: 0.48,
//   },
//   label: {
//     fontSize: 14,
//     color: '#333',
//     marginBottom: 4,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     marginBottom: 16,
//   },
//   signUpButton: {
//     backgroundColor: '#007BFF',
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   signUpButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   footerText: {
//     color: '#666',
//   },
//   registerText: {
//     color: '#007BFF',
//     fontWeight: 'bold',
//   },
//   closeIcon: {
//     position: 'absolute',
//     top: 40,
//     right: 18,
//     zIndex: 10,
//     backgroundColor: 'rgba(255,255,255,0.7)',
//     borderRadius: 16,
//     padding: 4,
//   },
//   otpInput: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     letterSpacing: 8,
//     backgroundColor: '#f8f9fa',
//     borderWidth: 2,
//     borderColor: '#007BFF',
//     borderRadius: 12,
//     paddingVertical: 16,
//     marginVertical: 16,
//   },
//   otpHelperText: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 16,
//     fontStyle: 'italic',
//   },
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     backgroundColor: '#fff',
//     margin: 20,
//     borderRadius: 16,
//     padding: 24,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//     width: '90%',
//     maxWidth: 400,
//   },
//   modalHeader: {
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   modalTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 8,
//   },
//   modalSubtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 4,
//   },
//   emailText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#007BFF',
//     textAlign: 'center',
//   },
//   otpContainer: {
//     marginBottom: 24,
//   },
//   otpLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   modalActions: {
//     gap: 12,
//   },
//   verifyButton: {
//     backgroundColor: '#007BFF',
//     paddingVertical: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   verifyButtonDisabled: {
//     backgroundColor: '#ccc',
//   },
//   verifyButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   resendButton: {
//     paddingVertical: 12,
//     alignItems: 'center',
//   },
//   resendButtonText: {
//     color: '#007BFF',
//     fontSize: 14,
//     textDecorationLine: 'underline',
//   },
// });
import API_CONFIG from '@/api/config';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import { useCreateSignUpToken, useVerifyOTP } from '@/hooks/useApi';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
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

type VerificationStep = 'email' | 'sms' | null;

// Location data interface for Mapbox
interface LocationData {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// Country data with states/provinces and cities
interface CountryData {
  name: string;
  code: string;
  flag: string;
  phoneCode: string;
  states: { [key: string]: string[] };
}

const COUNTRIES: CountryData[] = [
  {
    name: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    phoneCode: '+61',
    states: {
      'New South Wales': ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast', 'Maitland'],
      'Victoria': ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton'],
      'Queensland': ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville', 'Cairns'],
      'Western Australia': ['Perth', 'Mandurah', 'Bunbury', 'Kalgoorlie', 'Geraldton'],
      'South Australia': ['Adelaide', 'Mount Gambier', 'Whyalla', 'Murray Bridge', 'Port Augusta'],
      'Tasmania': ['Hobart', 'Launceston', 'Devonport', 'Burnie', 'Ulverstone'],
      'Australian Capital Territory': ['Canberra'],
      'Northern Territory': ['Darwin', 'Alice Springs', 'Palmerston', 'Katherine'],
    },
  },
  {
    name: 'New Zealand',
    code: 'NZ',
    flag: '🇳🇿',
    phoneCode: '+64',
    states: {
      'Auckland': ['Auckland City', 'Manukau', 'Waitakere', 'North Shore', 'Papakura'],
      'Wellington': ['Wellington City', 'Lower Hutt', 'Upper Hutt', 'Porirua', 'Kapiti Coast'],
      'Canterbury': ['Christchurch', 'Timaru', 'Ashburton', 'Rangiora', 'Kaiapoi'],
      'Waikato': ['Hamilton', 'Tauranga', 'Rotorua', 'Tokoroa', 'Cambridge'],
      'Bay of Plenty': ['Tauranga', 'Rotorua', 'Whakatane', 'Opotiki'],
      'Otago': ['Dunedin', 'Queenstown', 'Wanaka', 'Oamaru', 'Alexandra'],
      'Northland': ['Whangarei', 'Kerikeri', 'Kaitaia', 'Dargaville'],
      'Manawatu-Wanganui': ['Palmerston North', 'Whanganui', 'Feilding', 'Levin'],
    },
  },
  {
    name: 'Sri Lanka',
    code: 'LK',
    flag: '🇱🇰',
    phoneCode: '+94',
    states: {
      'Western Province': ['Colombo', 'Gampaha', 'Kalutara', 'Negombo', 'Moratuwa'],
      'Central Province': ['Kandy', 'Matale', 'Nuwara Eliya', 'Dambulla'],
      'Southern Province': ['Galle', 'Matara', 'Hambantota', 'Tangalle'],
      'Northern Province': ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
      'Eastern Province': ['Trincomalee', 'Batticaloa', 'Ampara'],
      'North Western Province': ['Kurunegala', 'Puttalam', 'Chilaw'],
      'North Central Province': ['Anuradhapura', 'Polonnaruwa'],
      'Uva Province': ['Badulla', 'Monaragala', 'Bandarawela'],
      'Sabaragamuwa Province': ['Ratnapura', 'Kegalle', 'Avissawella'],
    },
  },
];

export default function SignUpScreen() {
  const router = useRouter();
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Location state - Default to Sri Lanka
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(COUNTRIES[2]); // Sri Lanka
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  
  // Verification state
  const [verificationStep, setVerificationStep] = useState<VerificationStep>(null);
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [smsOtp, setSmsOtp] = useState(['', '', '', '', '', '']);
  const [emailVerified, setEmailVerified] = useState(false);
  const [smsVerified, setSmsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Timer state
  const [emailTimer, setEmailTimer] = useState(57);
  const [smsTimer, setSmsTimer] = useState(57);
  
  // Refs for OTP inputs
  const emailOtpRefs = useRef<Array<TextInput | null>>([]);
  const smsOtpRefs = useRef<Array<TextInput | null>>([]);
  
  const { mutateAsync: signUp } = useCreateSignUpToken();
  const { mutateAsync: verifyOTP } = useVerifyOTP();

  // Handle hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (verificationStep) {
          Alert.alert(
            'Verification Required',
            'Please complete verification to continue.',
            [{ text: 'OK' }]
          );
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [verificationStep])
  );

  // Age validation utility functions
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const isAgeValid = (birthDate: Date, minAge: number = 18): boolean => {
    const age = calculateAge(birthDate);
    return age >= minAge;
  };

  const formatDateForDisplay = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`; // YYYY-MM-DD format as per backend requirement
  };

  // Helper functions to extract region and city from Mapbox address
  const extractCityFromAddress = (address: string): string => {
    // Mapbox format: "Suburb, City, State/Province, Country"
    const parts = address.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      return parts[0]; // Return suburb/locality as city
    }
    return address;
  };

  const extractRegionFromAddress = (address: string): string => {
    // Mapbox format: "Suburb, City, State/Province, Country"
    const parts = address.split(',').map(p => p.trim());
    if (parts.length >= 3) {
      return parts[parts.length - 2]; // Return state/province
    }
    if (parts.length >= 2) {
      return parts[1]; // Fallback to second part
    }
    return '';
  };

  // Handle location selection from Mapbox
  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    console.log('Selected location:', location);
  };

  // Timer effects
  React.useEffect(() => {
    if (verificationStep === 'email' && emailTimer > 0) {
      const interval = setInterval(() => {
        setEmailTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [verificationStep, emailTimer]);

  React.useEffect(() => {
    if (verificationStep === 'sms' && smsTimer > 0) {
      const interval = setInterval(() => {
        setSmsTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [verificationStep, smsTimer]);

  const validateForm = () => {
    if (!firstName || !lastName || !email || !password || !phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    // Location validation
    if (!selectedCountry) {
      Alert.alert('Error', 'Please select your country');
      return false;
    }

    if (!selectedLocation) {
      Alert.alert('Error', 'Please select your location (suburb/address)');
      return false;
    }

    // Date of Birth validation
    if (!dateOfBirth) {
      Alert.alert('Error', 'Please select your date of birth');
      return false;
    }

    // Check if date is in the future
    if (dateOfBirth > new Date()) {
      Alert.alert('Error', 'Date of birth cannot be in the future');
      return false;
    }

    // Check age requirement (must be 18+)
    if (!isAgeValid(dateOfBirth, 18)) {
      const age = calculateAge(dateOfBirth);
      Alert.alert(
        'Age Requirement', 
        `You must be at least 18 years old to register. Your age: ${age}`
      );
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    // Validate phone number - accept 8-15 digits (different countries have different lengths)
    const phoneRegex = /^[0-9]{8,15}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number (8-15 digits)');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const response = await signUp({
        firstName,
        lastName,
        email,
        password,
        phone: `${selectedCountry.phoneCode}${phone}`, // Prepend country code for E.164 format
        dateOfBirth: formatDateForAPI(dateOfBirth!), // Format as YYYY-MM-DD for backend
        location: {
          country: selectedCountry.code,
          countryCode: selectedCountry.code,
          suburb: selectedLocation ? selectedLocation.address : '', // Full address like "Frankston 3199, VIC"
          region: selectedLocation ? extractRegionFromAddress(selectedLocation.address) : '',
          city: selectedLocation ? extractCityFromAddress(selectedLocation.address) : '',
        },
      });
      
      console.log('Signup response:', response);
      console.log('Phone sent to backend:', `${selectedCountry.phoneCode}${phone}`);
      console.log('Suburb sent to backend:', selectedLocation ? selectedLocation.address : '');
      
      if (response?.userId) {
        setUserId(response.userId);
      }
      
      setVerificationStep('email');
      setEmailTimer(57);
      
    } catch (error: any) {
      console.error('Sign up Error:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to create account. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOtpChange = (value: string, index: number) => {
    // Only allow numeric values
    if (!/^\d*$/.test(value)) return;
    
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    const newOtp = [...emailOtp];
    newOtp[index] = value;
    setEmailOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5 && emailOtpRefs.current[index + 1]) {
      emailOtpRefs.current[index + 1]?.focus();
    }
    
    // Auto-focus previous input on backspace
    if (!value && index > 0 && emailOtpRefs.current[index - 1]) {
      emailOtpRefs.current[index - 1]?.focus();
    }
  };

  const handleSmsOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    const newOtp = [...smsOtp];
    newOtp[index] = value;
    setSmsOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5 && smsOtpRefs.current[index + 1]) {
      smsOtpRefs.current[index + 1]?.focus();
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (event.type === 'set' && selectedDate) {
      setDateOfBirth(selectedDate);
      if (Platform.OS === 'ios') {
        setShowDatePicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  const handleVerifyEmail = async () => {
    const otpCode = emailOtp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    try {
      setVerifyLoading(true);
      
      const response = await verifyOTP({ 
        email, 
        otp: otpCode,
      });
      
      console.log('Email verification response:', response);
      
      setEmailVerified(true);
      setVerificationStep('sms');
      setSmsTimer(57);
      
    } catch (error: any) {
      console.error('Email verification error:', error);
      Alert.alert('Error', 'Invalid verification code. Please try again.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerifySms = async () => {
    const otpCode = smsOtp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    try {
      setVerifyLoading(true);
      
      const fullPhone = `${selectedCountry.phoneCode}${phone}`;
      console.log('Verifying SMS with phone:', fullPhone);
      console.log('Verifying SMS with email:', email);
      console.log('Verifying SMS with OTP:', otpCode);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/two-factor-auth/sms-verification`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email,
            otp: otpCode, // ✅ Backend expects 'otp' not 'code'
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setSmsVerified(true);
        setVerificationStep(null);
        
        Alert.alert(
          'Success!',
          'Account verified successfully! Welcome to MyToDo.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)')
            }
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Invalid SMS code.');
      }
    } catch (error) {
      console.error('SMS verification error:', error);
      Alert.alert('Error', 'Failed to verify SMS code.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      await fetch(
        `${API_CONFIG.BASE_URL}/two-factor-auth/send-email`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, userId }),
        }
      );
      setEmailTimer(57);
      Alert.alert('Sent!', 'Verification code resent to your email.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend email code.');
    }
  };

  const handleResendSms = async () => {
    try {
      const fullPhone = `${selectedCountry.phoneCode}${phone}`;
      console.log('Resending SMS to phone:', fullPhone);
      
      // include email because backend expects { phone, email } per API docs
      const payload: any = { phone: fullPhone, email }; // Prepend country code
      if (userId) payload.userId = userId;

      await fetch(
        `${API_CONFIG.BASE_URL}/two-factor-auth/send-sms`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      setSmsTimer(57);
      Alert.alert('Sent!', 'Verification code resent to your phone.');
    } catch (error) {
      console.error('Resend SMS error:', error);
      Alert.alert('Error', 'Failed to resend SMS code.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!verificationStep && (
        <TouchableOpacity
          style={styles.closeIcon}
          onPress={() => router.replace('/')}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
      )}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          <View style={styles.form}>
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

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Country</Text>
          <TouchableOpacity 
            style={styles.dropdownContainer}
            onPress={() => setShowCountryPicker(!showCountryPicker)}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownText}>
              {selectedCountry.flag} {selectedCountry.name}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          {showCountryPicker && (
            <View style={styles.dropdownList}>
              {COUNTRIES.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.dropdownItem,
                    selectedCountry.code === country.code && styles.dropdownItemSelected
                  ]}
                  onPress={() => {
                    setSelectedCountry(country);
                    setSelectedLocation(null);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>
                    {country.flag} {country.name}
                  </Text>
                  {selectedCountry.code === country.code && (
                    <Ionicons name="checkmark" size={20} color="#0057FF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Location (Suburb/Address)</Text>
          <LocationAutocomplete
            onSelect={handleLocationSelect}
            placeholder="Search for suburb, city or address..."
            style={{ marginBottom: 16 }}
            country={selectedCountry.code}
          />
          {selectedLocation && (
            <View style={styles.selectedLocationContainer}>
              <Ionicons name="location" size={16} color="#0057FF" />
              <Text style={styles.selectedLocationText}>
                {selectedLocation.address}
              </Text>
            </View>
          )}

          <Text style={styles.label}>Date of Birth *</Text>
          <Text style={styles.subLabel}>You must be 18 years or older to create an account</Text>
          <TouchableOpacity 
            style={styles.dateInputContainer}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.dateInputWrapper}>
              <Ionicons 
                name="calendar-outline" 
                size={18} 
                color="#666" 
                style={styles.dateIcon}
              />
              <Text style={dateOfBirth ? styles.dateInputTextSelected : styles.dateInputTextPlaceholder}>
                {dateOfBirth ? formatDateForDisplay(dateOfBirth) : 'Select your date of birth'}
              </Text>
            </View>
          </TouchableOpacity>

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

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity 
            onPress={() => router.push('./login-screen')}
            disabled={!!verificationStep}
          >
            <Text style={[styles.registerText, verificationStep && styles.disabledText]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Email Verification Modal */}
      <Modal
        visible={verificationStep === 'email'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          Alert.alert(
            'Verification Required',
            'Please complete email verification to continue.',
            [{ text: 'OK' }]
          );
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark-outline" size={32} color="#007BFF" />
              </View>
              <Text style={styles.modalTitle}>Verify Your Email</Text>
              <Text style={styles.modalSubtitle}>Enter the code sent to</Text>
              <Text style={styles.contactText}>{email}</Text>
            </View>

            <View style={styles.verificationTabs}>
              <View style={[styles.tab, styles.activeTab]}>
                <Ionicons name="mail" size={20} color="#007BFF" />
                <Text style={styles.activeTabText}>Email Verification</Text>
              </View>
              <View style={styles.tab}>
                <Ionicons name="phone-portrait-outline" size={20} color="#999" />
                <Text style={styles.tabText}>SMS Verification</Text>
              </View>
            </View>

            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>Enter verification code</Text>
              <View style={styles.otpInputContainer}>
                {emailOtp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => { emailOtpRefs.current[index] = ref; }}
                    style={styles.otpBox}
                    value={digit}
                    onChangeText={(value) => handleEmailOtpChange(value, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    textAlign="center"
                  />
                ))}
              </View>
              <Text style={styles.timerText}>
                Resend code in {emailTimer}s
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.verifyButton, emailOtp.join('').length !== 6 && styles.verifyButtonDisabled]} 
              onPress={handleVerifyEmail} 
              disabled={verifyLoading || emailOtp.join('').length !== 6}
            >
              {verifyLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                  <Ionicons name="shield-checkmark" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            {emailTimer === 0 && (
              <TouchableOpacity style={styles.resendButton} onPress={handleResendEmail}>
                <Text style={styles.resendButtonText}>Didn't receive a code? Resend</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* SMS Verification Modal */}
      <Modal
        visible={verificationStep === 'sms'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          Alert.alert(
            'Verification Required',
            'Please complete SMS verification to continue.',
            [{ text: 'OK' }]
          );
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark-outline" size={32} color="#007BFF" />
              </View>
              <Text style={styles.modalTitle}>Verify Your Phone</Text>
              <Text style={styles.modalSubtitle}>Enter the code sent to</Text>
              <Text style={styles.contactText}>+94{phone}</Text>
            </View>

            <View style={styles.verificationTabs}>
              <View style={styles.tab}>
                <Ionicons name="mail" size={20} color="#28a745" />
                <Text style={styles.verifiedTabText}>Email Verification</Text>
                <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              </View>
              <View style={[styles.tab, styles.activeTab]}>
                <Ionicons name="phone-portrait-outline" size={20} color="#007BFF" />
                <Text style={styles.activeTabText}>SMS Verification</Text>
              </View>
            </View>

            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>Enter verification code</Text>
              <View style={styles.otpInputContainer}>
                {smsOtp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => { smsOtpRefs.current[index] = ref; }}
                    style={[
                      styles.otpBox,
                      digit && styles.otpBoxFilled
                    ]}
                    value={digit}
                    onChangeText={(value) => handleSmsOtpChange(value, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    textAlign="center"
                  />
                ))}
              </View>
              {smsOtp.join('').length === 6 && !verifyLoading && (
                <View style={styles.successTextContainer}>
                  <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                  <Text style={styles.successText}>Verification successful! Redirecting...</Text>
                </View>
              )}
              <Text style={styles.timerText}>
                Resend code in {smsTimer}s
              </Text>
            </View>

            <TouchableOpacity 
              style={[
                styles.verifyButton,
                smsVerified && styles.verifiedButton,
                smsOtp.join('').length !== 6 && styles.verifyButtonDisabled
              ]} 
              onPress={handleVerifySms} 
              disabled={verifyLoading || smsOtp.join('').length !== 6}
            >
              {verifyLoading ? (
                <ActivityIndicator color="#fff" />
              ) : smsVerified ? (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.verifyButtonText}>Verified Successfully</Text>
                </>
              ) : (
                <>
                  <Text style={styles.verifyButtonText}>Verify & Complete</Text>
                  <Ionicons name="shield-checkmark" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            {smsTimer === 0 && (
              <TouchableOpacity style={styles.resendButton} onPress={handleResendSms}>
                <Text style={styles.resendButtonText}>Didn't receive a code? Resend</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal/Native Picker */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.datePickerModalOverlay}>
              <View style={styles.datePickerModalContent}>
                <View style={styles.datePickerHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.datePickerCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.datePickerTitle}>Select Date of Birth</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.datePickerDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={dateOfBirth || new Date(2000, 0, 1)}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={dateOfBirth || new Date(2000, 0, 1)}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
          />
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  nameField: {
    flex: 0.48,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    paddingRight: 8,
    backgroundColor: '#f8f9fa',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  passwordToggle: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  phonePrefix: {
    backgroundColor: '#e9ecef',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    justifyContent: 'center',
  },
  phonePrefixText: {
    fontSize: 14,
    color: '#333',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
  },
  signUpButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signUpButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#666',
  },
  registerText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#ccc',
  },
  closeIcon: {
    position: 'absolute',
    top: 40,
    right: 18,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e8f4fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007BFF',
  },
  verificationTabs: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#e8f4fd',
  },
  tabText: {
    fontSize: 12,
    color: '#999',
  },
  activeTabText: {
    fontSize: 12,
    color: '#007BFF',
    fontWeight: '600',
  },
  verifiedTabText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
  },
  otpContainer: {
    marginBottom: 24,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#f8f9fa',
  },
  otpBoxFilled: {
    borderColor: '#28a745',
    backgroundColor: '#e8f5e9',
  },
  timerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  successTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 4,
  },
  successText: {
    fontSize: 14,
    color: '#28a745',
  },
  verifyButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  verifyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  verifiedButton: {
    backgroundColor: '#28a745',
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resendButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#007BFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  // Date Picker Styles - matching other input fields exactly
  dateInputContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 8,
  },
  dateInputTextPlaceholder: {
    fontSize: 14,
    color: '#999',
    flex: 1,
  },
  dateInputTextSelected: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  // Legacy styles - keeping for backwards compatibility
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  datePickerTextPlaceholder: {
    fontSize: 14,
    color: '#999',
  },
  datePickerTextSelected: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  ageHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  datePickerModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  datePickerCancelText: {
    fontSize: 16,
    color: '#666',
  },
  datePickerDoneText: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: '600',
  },
  subLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    marginTop: -8,
  },
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  dropdownText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
    maxHeight: 200,
    overflow: 'scroll',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#e6f3ff',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f3ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  selectedLocationText: {
    flex: 1,
    fontSize: 14,
    color: '#0057FF',
    fontWeight: '500',
  },
});
