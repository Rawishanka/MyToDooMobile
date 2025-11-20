// OTP Verification Modals for Email and SMS

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { VerificationStep } from './signup-types';

interface OTPModalProps {
  // Modal visibility
  verificationStep: VerificationStep;
  
  // User info
  email: string;
  phone: string;
  phoneCode: string;
  
  // OTP state
  emailOtp: string[];
  smsOtp: string[];
  emailVerified: boolean;
  smsVerified: boolean;
  
  // Timers
  emailTimer: number;
  smsTimer: number;
  
  // Loading states
  verifyLoading: boolean;
  
  // Refs
  emailOtpRefs: React.MutableRefObject<(TextInput | null)[]>;
  smsOtpRefs: React.MutableRefObject<(TextInput | null)[]>;
  
  // Handlers
  handleEmailOtpChange: (value: string, index: number) => void;
  handleSmsOtpChange: (value: string, index: number) => void;
  handleVerifyEmail: () => void;
  handleVerifySms: () => void;
  handleResendEmail: () => void;
  handleResendSms: () => void;
}

export const OTPModal: React.FC<OTPModalProps> = ({
  verificationStep,
  email,
  phone,
  phoneCode,
  emailOtp,
  smsOtp,
  emailVerified,
  smsVerified,
  emailTimer,
  smsTimer,
  verifyLoading,
  emailOtpRefs,
  smsOtpRefs,
  handleEmailOtpChange,
  handleSmsOtpChange,
  handleVerifyEmail,
  handleVerifySms,
  handleResendEmail,
  handleResendSms,
}) => {
  return (
    <>
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
                <Text style={styles.resendButtonText}>Didn&apos;t receive a code? Resend</Text>
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
              <Text style={styles.contactText}>{phoneCode}{phone}</Text>
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
                <Text style={styles.resendButtonText}>Didn&apos;t receive a code? Resend</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
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
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#E3F2FD',
  },
  tabText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
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
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpBox: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  otpBoxFilled: {
    borderColor: '#007BFF',
  },
  timerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  successTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 6,
  },
  successText: {
    fontSize: 13,
    color: '#28a745',
    fontWeight: '500',
  },
  verifyButton: {
    backgroundColor: '#007BFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  verifyButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  verifiedButton: {
    backgroundColor: '#28a745',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  resendButtonText: {
    color: '#007BFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
