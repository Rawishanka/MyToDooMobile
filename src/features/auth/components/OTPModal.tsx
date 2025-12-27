// OTP Verification Modals for Email and SMS
// Fixed: Keyboard overlap issue and OTP deletion functionality

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { hp, RFValue, wp } from '@/src/shared/utils/responsive';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
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
  onClose?: () => void;
}

// Enhanced OTP Input Component with proper backspace handling
interface OTPInputProps {
  otp: string[];
  otpRefs: React.MutableRefObject<(TextInput | null)[]>;
  onOtpChange: (value: string, index: number) => void;
  disabled?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({ otp, otpRefs, onOtpChange, disabled }) => {
  
  // Handle key press for backspace detection - allows deleting any digit
  const handleKeyPress = useCallback((
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current box is empty and we press backspace, clear previous and focus it
        onOtpChange('', index - 1);
        otpRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
        // If current box has value, clear it but stay focused
        onOtpChange('', index);
      }
    }
  }, [otp, onOtpChange, otpRefs]);

  // Handle text change with paste support
  const handleChange = useCallback((value: string, index: number) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    // Handle paste - if multiple digits pasted
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').split('').slice(0, 6 - index);
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          onOtpChange(digit, index + i);
        }
      });
      // Focus appropriate box after paste
      const nextIndex = Math.min(index + digits.length, 5);
      setTimeout(() => otpRefs.current[nextIndex]?.focus(), 10);
      return;
    }
    
    // Single digit input
    if (value) {
      onOtpChange(value, index);
      // Move to next input if not last
      if (index < 5) {
        setTimeout(() => otpRefs.current[index + 1]?.focus(), 10);
      }
    }
  }, [onOtpChange, otpRefs]);

  return (
    <View style={styles.otpInputContainer}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => { otpRefs.current[index] = ref; }}
          style={[
            styles.otpBox,
            digit && styles.otpBoxFilled,
            disabled && styles.otpBoxDisabled,
          ]}
          value={digit}
          onChangeText={(value) => handleChange(value, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
          selectTextOnFocus
          editable={!disabled}
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
        />
      ))}
    </View>
  );
};

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
  onClose,
}) => {
  const handleClose = () => {
    if (onClose) {
      Alert.alert(
        'Cancel Verification?',
        'You can complete verification later from your account settings. Continue without verifying?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Close', style: 'destructive', onPress: onClose }
        ]
      );
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };

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
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.keyboardAvoidingView}
              keyboardVerticalOffset={0}
            >
              <View style={styles.modalInnerContainer}>
                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                  <View style={styles.modalContainer}>
                    {onClose && (
                      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Ionicons name="close" size={24} color="#666" />
                      </TouchableOpacity>
                    )}
                  
                  <View style={styles.modalHeader}>
                    <View style={styles.iconCircle}>
                      <Ionicons name="mail-outline" size={36} color="#007BFF" />
                    </View>
                    <Text style={styles.modalTitle}>Verify Your Email</Text>
                    <Text style={styles.modalSubtitle}>
                      We&apos;ve sent a 6-digit code to
                    </Text>
                    <Text style={styles.contactText}>{email}</Text>
                  </View>

                  {/* Progress Indicator */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressStep}>
                      <View style={[styles.progressDot, styles.progressDotActive]}>
                        <Text style={styles.progressDotText}>1</Text>
                      </View>
                      <Text style={[styles.progressLabel, styles.progressLabelActive]}>Email</Text>
                    </View>
                    <View style={styles.progressLine} />
                    <View style={styles.progressStep}>
                      <View style={styles.progressDot}>
                        <Text style={styles.progressDotTextInactive}>2</Text>
                      </View>
                      <Text style={styles.progressLabel}>Phone</Text>
                    </View>
                  </View>

                  <View style={styles.otpSection}>
                    <Text style={styles.otpLabel}>Enter verification code</Text>
                    <OTPInput
                      otp={emailOtp}
                      otpRefs={emailOtpRefs}
                      onOtpChange={handleEmailOtpChange}
                      disabled={verifyLoading}
                    />
                    
                    {emailTimer > 0 ? (
                      <Text style={styles.timerText}>
                        Resend code in <Text style={styles.timerHighlight}>{formatTimer(emailTimer)}</Text>
                      </Text>
                    ) : (
                      <TouchableOpacity onPress={handleResendEmail} style={styles.resendInlineButton}>
                        <Text style={styles.resendInlineText}>Didn&apos;t receive code? </Text>
                        <Text style={styles.resendInlineLink}>Resend</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity 
                    style={[
                      styles.verifyButton, 
                      emailOtp.join('').length !== 6 && styles.verifyButtonDisabled
                    ]} 
                    onPress={handleVerifyEmail} 
                    disabled={verifyLoading || emailOtp.join('').length !== 6}
                    activeOpacity={0.8}
                  >
                    {verifyLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                      </>
                    )}
                  </TouchableOpacity>

                  <View style={styles.securityNote}>
                    <Ionicons name="shield-checkmark-outline" size={14} color="#28a745" />
                    <Text style={styles.securityNoteText}>Your information is secure and encrypted</Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
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
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.keyboardAvoidingView}
              keyboardVerticalOffset={0}
            >
              <View style={styles.modalInnerContainer}>
                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                  <View style={styles.modalContainer}>
                    {onClose && (
                      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Ionicons name="close" size={24} color="#666" />
                      </TouchableOpacity>
                    )}
                  
                  <View style={styles.modalHeader}>
                    <View style={styles.iconCircle}>
                      <Ionicons name="phone-portrait-outline" size={36} color="#007BFF" />
                    </View>
                    <Text style={styles.modalTitle}>Verify Your Phone</Text>
                    <Text style={styles.modalSubtitle}>
                      We&apos;ve sent a 6-digit code to
                    </Text>
                    <Text style={styles.contactText}>{phoneCode}{phone}</Text>
                  </View>

                  {/* Progress Indicator - Email Complete */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressStep}>
                      <View style={[styles.progressDot, styles.progressDotComplete]}>
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </View>
                      <Text style={[styles.progressLabel, styles.progressLabelComplete]}>Email</Text>
                    </View>
                    <View style={[styles.progressLine, styles.progressLineComplete]} />
                    <View style={styles.progressStep}>
                      <View style={[styles.progressDot, styles.progressDotActive]}>
                        <Text style={styles.progressDotText}>2</Text>
                      </View>
                      <Text style={[styles.progressLabel, styles.progressLabelActive]}>Phone</Text>
                    </View>
                  </View>

                  <View style={styles.otpSection}>
                    <Text style={styles.otpLabel}>Enter verification code</Text>
                    <OTPInput
                      otp={smsOtp}
                      otpRefs={smsOtpRefs}
                      onOtpChange={handleSmsOtpChange}
                      disabled={verifyLoading || smsVerified}
                    />
                    
                    {smsVerified && (
                      <View style={styles.successBadge}>
                        <Ionicons name="checkmark-circle" size={18} color="#28a745" />
                        <Text style={styles.successBadgeText}>Verified successfully!</Text>
                      </View>
                    )}
                    
                    {!smsVerified && (
                      smsTimer > 0 ? (
                        <Text style={styles.timerText}>
                          Resend code in <Text style={styles.timerHighlight}>{formatTimer(smsTimer)}</Text>
                        </Text>
                      ) : (
                        <TouchableOpacity onPress={handleResendSms} style={styles.resendInlineButton}>
                          <Text style={styles.resendInlineText}>Didn&apos;t receive code? </Text>
                          <Text style={styles.resendInlineLink}>Resend</Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>

                  <TouchableOpacity 
                    style={[
                      styles.verifyButton,
                      smsVerified && styles.verifiedButton,
                      smsOtp.join('').length !== 6 && !smsVerified && styles.verifyButtonDisabled
                    ]} 
                    onPress={handleVerifySms} 
                    disabled={verifyLoading || smsOtp.join('').length !== 6}
                    activeOpacity={0.8}
                  >
                    {verifyLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : smsVerified ? (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        <Text style={styles.verifyButtonText}>Verified!</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.verifyButtonText}>Complete Verification</Text>
                        <Ionicons name="checkmark-done" size={20} color="#fff" />
                      </>
                    )}
                  </TouchableOpacity>

                    <View style={styles.securityNote}>
                      <Ionicons name="shield-checkmark-outline" size={14} color="#28a745" />
                      <Text style={styles.securityNoteText}>Your information is secure and encrypted</Text>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalInnerContainer: {
    maxHeight: '85%',
    backgroundColor: 'white',
    borderTopLeftRadius: wp('6%'),
    borderTopRightRadius: wp('6%'),
  },
  scrollContent: {
    flexGrow: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('3%'),
    paddingBottom: hp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: hp('2%'),
    right: wp('4%'),
    zIndex: 10,
    width: wp('9%'),
    height: wp('9%'),
    borderRadius: wp('4.5%'),
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: hp('2%'),
    marginTop: hp('0.5%'),
  },
  iconCircle: {
    width: wp('16%'),
    height: wp('16%'),
    borderRadius: wp('8%'),
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  modalTitle: {
    fontSize: RFValue(22),
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: hp('0.75%'),
  },
  modalSubtitle: {
    fontSize: RFValue(13),
    color: '#666',
    marginBottom: hp('0.5%'),
  },
  contactText: {
    fontSize: RFValue(15),
    fontWeight: '600',
    color: '#007BFF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('2.5%'),
    paddingHorizontal: wp('7.5%'),
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: wp('7%'),
    height: wp('7%'),
    borderRadius: wp('3.5%'),
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('0.75%'),
  },
  progressDotActive: {
    backgroundColor: '#007BFF',
  },
  progressDotComplete: {
    backgroundColor: '#28a745',
  },
  progressDotText: {
    color: '#fff',
    fontSize: RFValue(12),
    fontWeight: '700',
  },
  progressDotTextInactive: {
    color: '#999',
    fontSize: RFValue(12),
    fontWeight: '600',
  },
  progressLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#E0E0E0',
    marginHorizontal: wp('3%'),
    marginBottom: hp('3%'),
    borderRadius: 2,
  },
  progressLineComplete: {
    backgroundColor: '#28a745',
  },
  progressLabel: {
    fontSize: RFValue(12),
    color: '#999',
    fontWeight: '500',
  },
  progressLabelActive: {
    color: '#007BFF',
    fontWeight: '600',
  },
  progressLabelComplete: {
    color: '#28a745',
    fontWeight: '600',
  },
  otpSection: {
    marginBottom: hp('2%'),
  },
  otpLabel: {
    fontSize: RFValue(13),
    color: '#666',
    marginBottom: hp('1.5%'),
    textAlign: 'center',
    fontWeight: '500',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: wp('2%'),
    marginBottom: hp('1.5%'),
  },
  otpBox: {
    width: wp('11%'),
    height: hp('6.5%'),
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: wp('3%'),
    fontSize: RFValue(20),
    fontWeight: '700',
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
  },
  otpBoxFilled: {
    borderColor: '#007BFF',
    backgroundColor: '#E8F4FD',
  },
  otpBoxDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
  },
  timerText: {
    fontSize: RFValue(13),
    color: '#666',
    textAlign: 'center',
  },
  timerHighlight: {
    color: '#007BFF',
    fontWeight: '600',
  },
  resendInlineButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('0.5%'),
  },
  resendInlineText: {
    fontSize: RFValue(13),
    color: '#666',
  },
  resendInlineLink: {
    fontSize: RFValue(13),
    color: '#007BFF',
    fontWeight: '600',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: hp('1.25%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('5%'),
    marginTop: hp('1%'),
    gap: wp('2%'),
  },
  successBadgeText: {
    fontSize: RFValue(14),
    color: '#28a745',
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: '#007BFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1.75%'),
    borderRadius: wp('3%'),
    gap: wp('2%'),
    marginBottom: hp('1.5%'),
  },
  verifyButtonDisabled: {
    backgroundColor: '#B0C4DE',
  },
  verifiedButton: {
    backgroundColor: '#28a745',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: RFValue(15),
    fontWeight: '700',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('1.5%'),
  },
  securityNoteText: {
    fontSize: RFValue(12),
    color: '#666',
  },
});
