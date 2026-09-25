// Refactored Signup Screen - Main Orchestrator

import MyToDooLogo from '@/assets/images/MyToDoo_logo.svg';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
  KeyboardAvoidingView,
  Platform,
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
import { FORM_MAX_WIDTH, RFValue, isTablet } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();

// Warm up the browser for better OAuth performance
WebBrowser.warmUpAsync();

export default function SignUpScreen() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        )}
        
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <MyToDooLogo width={50} height={50} />
            </View>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>
      </View>

      {/* Scrollable Form Section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.innerContainer, isDarkMode && { backgroundColor: '#0B1120' }]}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 32) },
            isTablet && styles.scrollContentTablet,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          bounces={true}
          overScrollMode="always"
          nestedScrollEnabled={true}
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
            setShowDatePicker={signup.setShowDatePicker}
            setDateOfBirth={signup.setDateOfBirth}
            handleSignUp={signup.handleSignUp}
            handleDateChange={handleDateChange}
            handleGoogleSignIn={signup.handleGoogleSignIn}
            handleAppleSignIn={signup.handleAppleSignIn}
            appleLoading={signup.appleLoading}
            appleAuthAvailable={signup.appleAuthAvailable}
            notifyNewTask={signup.notifyNewTask}
            notifySkillMatch={signup.notifySkillMatch}
            setNotifyNewTask={signup.setNotifyNewTask}
            setNotifySkillMatch={signup.setNotifySkillMatch}
            abnInput={signup.abnInput}
            setAbnInput={signup.setAbnInput}
          />

          <View style={styles.footer}>
            <Text style={[styles.footerText, isDarkMode && { color: '#94A3B8' }]}>Already have an account? </Text>
            <TouchableOpacity 
              onPress={() => router.replace('/(auth)/login')}
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
        onPhoneChange={signup.setPhone}
        handleSendPhoneOtp={signup.handleSendPhoneOtp}
        onClose={signup.handleCloseVerification}
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
    backgroundColor: '#003399',
  },
  container: {
    flex: 1,
    backgroundColor: '#003399',
  },
  bottomSafeArea: {
    backgroundColor: '#003399',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'android' ? 48 : 0, // Cover Android navigation bar area
  },
  fixedHeader: {
    backgroundColor: '#003399',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 8,
    paddingBottom: 16,
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
  logoContainer: {
    marginBottom: 12,
  },
  logoBackground: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 60,
  },
  scrollContentTablet: {
    maxWidth: FORM_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: RFValue(28),
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff',
  },
  subtitle: {
    fontSize: RFValue(16),
    color: 'rgba(255,255,255,0.8)',
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
    fontSize: RFValue(14),
  },
  registerText: {
    color: '#ff6b35',
    fontWeight: '600',
    fontSize: RFValue(14),
  },
  disabledText: {
    color: '#999',
  },
});