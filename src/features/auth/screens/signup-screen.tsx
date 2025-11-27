// Refactored Signup Screen - Main Orchestrator

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { OTPModal } from '../components/OTPModal';
import { SignupForm } from '../components/SignupForm';
import { useSignup } from '../components/useSignup';

WebBrowser.maybeCompleteAuthSession();

// Warm up the browser for better OAuth performance
WebBrowser.warmUpAsync();

export default function SignUpScreen() {
  const router = useRouter();
  const signup = useSignup();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      signup.setShowDatePicker(false);
    }
    
    if (event.type === 'set' && selectedDate) {
      signup.setDateOfBirth(selectedDate);
      if (Platform.OS === 'ios') {
        signup.setShowDatePicker(false);
      }
    } else if (event.type === 'dismissed') {
      signup.setShowDatePicker(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.container}>
        {/* Fixed Header Section */}
        <View style={styles.fixedHeader}>
        {!signup.verificationStep && (
          <TouchableOpacity
            style={styles.closeIcon}
            onPress={() => router.replace('/')}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
        )}
        
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>
      </View>

      {/* Scrollable Form Section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SignupForm
            firstName={signup.firstName}
            lastName={signup.lastName}
            email={signup.email}
            password={signup.password}
            confirmPassword={signup.confirmPassword}
            phone={signup.phone}
            dateOfBirth={signup.dateOfBirth}
            showPassword={signup.showPassword}
            showConfirmPassword={signup.showConfirmPassword}
            selectedCountry={signup.selectedCountry}
            selectedLocation={signup.selectedLocation}
            showCountryPicker={signup.showCountryPicker}
            showDatePicker={signup.showDatePicker}
            loading={signup.loading}
            googleLoading={signup.googleLoading}
            setFirstName={signup.setFirstName}
            setLastName={signup.setLastName}
            setEmail={signup.setEmail}
            setPassword={signup.setPassword}
            setConfirmPassword={signup.setConfirmPassword}
            setPhone={signup.setPhone}
            setShowPassword={signup.setShowPassword}
            setShowConfirmPassword={signup.setShowConfirmPassword}
            setSelectedCountry={signup.setSelectedCountry}
            setSelectedLocation={signup.setSelectedLocation}
            setShowCountryPicker={signup.setShowCountryPicker}
            setShowDatePicker={signup.setShowDatePicker}
            setDateOfBirth={signup.setDateOfBirth}
            handleSignUp={signup.handleSignUp}
            handleDateChange={handleDateChange}
            handleGoogleSignIn={signup.handleGoogleSignIn}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity 
              onPress={() => router.push('/(auth)/login')}
              disabled={!!signup.verificationStep}
            >
              <Text style={[styles.registerText, signup.verificationStep && styles.disabledText]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <OTPModal
        verificationStep={signup.verificationStep}
        email={signup.email}
        phone={signup.phone}
        phoneCode={signup.selectedCountry.phoneCode}
        emailOtp={signup.emailOtp}
        smsOtp={signup.smsOtp}
        emailVerified={signup.emailVerified}
        smsVerified={signup.smsVerified}
        emailTimer={signup.emailTimer}
        smsTimer={signup.smsTimer}
        verifyLoading={signup.verifyLoading}
        emailOtpRefs={signup.emailOtpRefs}
        smsOtpRefs={signup.smsOtpRefs}
        handleEmailOtpChange={signup.handleEmailOtpChange}
        handleSmsOtpChange={signup.handleSmsOtpChange}
        handleVerifyEmail={signup.handleVerifyEmail}
        handleVerifySms={signup.handleVerifySms}
        handleResendEmail={signup.handleResendEmail}
        handleResendSms={signup.handleResendSms}
      />
      </SafeAreaView>
      {/* Bottom Safe Area for System Navigation Bar */}
      <View style={styles.bottomSafeArea} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bottomSafeArea: {
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'android' ? 48 : 0, // Cover Android navigation bar area
  },
  fixedHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeIcon: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 8,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 8,
  },
  innerContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32, // Added margin to avoid overlay with system navigation
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  registerText: {
    color: '#0057FF',
    fontWeight: '600',
    fontSize: 14,
  },
  disabledText: {
    color: '#999',
  },
});