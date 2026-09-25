import { LocationAutocomplete, type LocationData } from '@/src/shared/components/LocationAutocomplete';
import { getDeleteRequest, submitDeleteRequest } from '@/src/api/user-profile-api';
import {
  useRequestEmailOtp,
  useRequestPhoneOtp,
  useVerifyEmailOtp,
  useVerifyPhoneOtp,
} from '@/src/shared/hooks/useContactChangeApi';
import { useGetUserProfile, useUpdateUserProfile } from '@/src/shared/hooks/useUserProfileApi';
import { useAuthStore } from '@/src/store/auth-task-store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';
import { IconChip, LightHeader } from '@/src/shared/components/custom_components/lightCard';
import { HS } from '@/src/shared/theme/homeStyle';

interface AccountInformationProps {
  onBack: () => void;
}

export default function AccountInformation({ onBack }: AccountInformationProps) {
  const { isDarkMode } = useTheme();
  const [currentScreen, setCurrentScreen] = useState('main');
  const insets = useSafeAreaInsets();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [existingDeleteRequest, setExistingDeleteRequest] = useState<{ status: string; created_at: string } | null>(null);
  
  // Fetch user profile data
  const { data: profileData, isLoading, error, refetch, isFetching } = useGetUserProfile();
  const updateProfileMutation = useUpdateUserProfile();
  const requestPhoneOtpMutation = useRequestPhoneOtp();
  const verifyPhoneOtpMutation = useVerifyPhoneOtp();
  const requestEmailOtpMutation = useRequestEmailOtp();
  const verifyEmailOtpMutation = useVerifyEmailOtp();
  const { clearAuth, isAuthenticated, token, user } = useAuthStore();
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 Account Information Debug:', {
      isLoading,
      isFetching,
      hasProfileData: !!profileData,
      hasError: !!error,
      isAuthenticated,
      hasToken: !!token,
      hasUser: !!user,
      currentScreen
    });
  }, [isLoading, isFetching, profileData, error, isAuthenticated, token, user, currentScreen]);
  
  // Personal details state - populated from API
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  // Store raw location object for API submission
  const [locationRaw, setLocationRaw] = useState<Record<string, string>>({});
  const [newPhone, setNewPhone] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  
  // Populate form with API data
  useEffect(() => {
    if (profileData) {
      setEmail(profileData.email || '');
      setFirstName(profileData.firstName || '');
      setLastName(profileData.lastName || '');
      setPhone(profileData.phone || '');
      
      // Handle location - can be string or object
      if (profileData.location) {
        if (typeof profileData.location === 'string') {
          setLocation(profileData.location);
          setLocationRaw({});
        } else if (typeof profileData.location === 'object') {
          const loc = profileData.location as any;
          setLocationRaw(loc);
          // Display only suburb/city — not the full concatenated string
          const displayStr = [loc.suburb, loc.city].filter(Boolean).join(', ');
          setLocation(displayStr || loc.region || loc.country || '');
        }
      } else {
        setLocation('');
        setLocationRaw({});
      }
      
      setBio(profileData.bio || '');
      
      // Parse date of birth if available
      if (profileData.createdAt) {
        try {
          setDateOfBirth(new Date(profileData.createdAt));
        } catch (e) {
          console.warn('Invalid date:', e);
        }
      }
    }
  }, [profileData]);

  const handleUpdatePersonalDetails = () => {
    setCurrentScreen('personal-details');
  };

  const handleChangePassword = () => {
    setCurrentScreen('change-password');
  };

  const handleUpdateMobile = () => {
    setNewPhone(phone);
    setPhoneOtp('');
    setPhoneOtpSent(false);
    setCurrentScreen('mobile-verification');
  };

  const handleChangeEmail = () => {
    setNewEmail(email);
    setEmailOtp('');
    setEmailOtpSent(false);
    setCurrentScreen('email-verification');
  };

  const getApiError = (error: any, fallback: string) => {
    const responseData = error?.response?.data;
    if (responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
      return responseData.errors
        .map((e: any) => e?.message || e?.msg || String(e))
        .join('\n');
    }
    return responseData?.message || error?.message || fallback;
  };

  const handleDeleteAccount = async () => {
    // Check for existing pending request first
    try {
      const existing = await getDeleteRequest();
      if (existing?.data && existing.data.status === 'PENDING_REVIEW') {
        setExistingDeleteRequest({ status: existing.data.status, created_at: existing.data.created_at });
      } else {
        setExistingDeleteRequest(null);
      }
    } catch {
      setExistingDeleteRequest(null);
    }
    setDeleteReason('');
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteReason.trim()) {
      Alert.alert('Reason Required', 'Please provide a reason for deleting your account.');
      return;
    }
    setIsDeleting(true);
    try {
      await submitDeleteRequest(deleteReason.trim());
      setShowDeleteModal(false);
      setDeleteReason('');
      // Sign the user out after submitting — account is under admin review, not usable
      await clearAuth();
      Alert.alert(
        'Deletion Request Submitted',
        'Your account deletion request has been submitted and is under admin review. This process will take effect after 2-5 business days.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      console.error('Delete account error:', error);
      setShowDeleteModal(false);
      if (error?.alreadyPending) {
        Alert.alert(
          'Request Already Submitted',
          'You already have a pending account deletion request under admin review. Please wait for it to be processed.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to submit account deletion request. Please try again.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const goBackToMain = () => {
    setCurrentScreen('main');
  };

  const handleLocationSelect = (locationData: LocationData) => {
    setLocation(locationData.address);
    const parts = locationData.address.split(',').map((p: string) => p.trim());
    const suburb = parts[0] || '';
    const region = parts[1] || '';
    const cityMap: Record<string, string> = {
      'VIC': 'Melbourne', 'NSW': 'Sydney', 'QLD': 'Brisbane',
      'WA': 'Perth', 'SA': 'Adelaide', 'TAS': 'Hobart',
      'NT': 'Darwin', 'ACT': 'Canberra',
    };
    setLocationRaw({
      country: 'Australia',
      countryCode: 'AU',
      suburb,
      region,
      city: cityMap[region] || '',
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(false);
    setDateOfBirth(currentDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSaveChanges = async () => {
    if (firstName.trim().length < 2) {
      Alert.alert('Validation Error', 'First name must be at least 2 characters.');
      return;
    }
    if (lastName.trim().length < 2) {
      Alert.alert('Validation Error', 'Last name must be at least 2 characters.');
      return;
    }
    try {
      await updateProfileMutation.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        location: Object.keys(locationRaw).length > 0
          ? locationRaw
          : { country: location || 'Unknown', countryCode: 'AU' },
        bio: bio.trim(),
      });
      
      Alert.alert(
        'Changes Saved', 
        'Your personal details have been updated successfully.',
        [{ text: 'OK', onPress: () => setCurrentScreen('main') }]
      );
      
      // Refresh profile data
      refetch();
    } catch (error: any) {
      console.error('Update profile error:', error);

      // Extract backend validation errors
      const responseData = error?.response?.data;
      let errorMessage = 'Failed to update profile. Please try again.';
      if (responseData) {
        if (responseData.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
          errorMessage = responseData.errors
            .map((e: any) => e?.message || e?.msg || String(e))
            .join('\n');
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    }
  };

  const handleRemoveMobile = () => {
    Alert.alert(
      'Change Mobile Number',
      'Mobile numbers can no longer be removed from profile settings. Use Change phone to verify a new number.',
      [{ text: 'OK' }]
    );
  };

  const handleRequestPhoneOtp = async () => {
    if (newPhone.trim() === '') {
      Alert.alert('Error', 'Please enter a valid mobile number.');
      return;
    }
    try {
      await requestPhoneOtpMutation.mutateAsync(newPhone.trim());
      setPhoneOtpSent(true);
      Alert.alert('Code sent', 'Enter the verification code sent to your new mobile number.');
    } catch (error) {
      Alert.alert('Error', getApiError(error, 'Failed to send phone verification code.'));
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!newPhone.trim() || !phoneOtp.trim()) {
      Alert.alert('Error', 'Please enter the mobile number and verification code.');
      return;
    }
    try {
      await verifyPhoneOtpMutation.mutateAsync({ phone: newPhone.trim(), otp: phoneOtp.trim() });
      setPhone(newPhone.trim());
      Alert.alert(
        'Mobile Number Updated',
        'Your mobile number has been updated successfully.',
        [{ text: 'OK', onPress: () => setCurrentScreen('main') }]
      );
      refetch();
    } catch (error) {
      Alert.alert('Error', getApiError(error, 'Failed to verify mobile number.'));
    }
  };

  const handleSaveMobile = async () => {
    if (phoneOtpSent) {
      await handleVerifyPhoneOtp();
      return;
    }
    await handleRequestPhoneOtp();
  };

  const handleRequestEmailOtp = async () => {
    if (newEmail.trim() === '') {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    try {
      await requestEmailOtpMutation.mutateAsync(newEmail.trim());
      setEmailOtpSent(true);
      Alert.alert('Code sent', 'Enter the verification code sent to your new email address.');
    } catch (error) {
      Alert.alert('Error', getApiError(error, 'Failed to send email verification code.'));
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!newEmail.trim() || !emailOtp.trim()) {
      Alert.alert('Error', 'Please enter the email address and verification code.');
      return;
    }
    try {
      await verifyEmailOtpMutation.mutateAsync({ email: newEmail.trim(), otp: emailOtp.trim() });
      setEmail(newEmail.trim());
      Alert.alert(
        'Email Updated',
        'Your email has been updated successfully.',
        [{ text: 'OK', onPress: () => setCurrentScreen('main') }]
      );
      refetch();
    } catch (error) {
      Alert.alert('Error', getApiError(error, 'Failed to verify email.'));
    }
  };

  const handleSendPasswordResetEmail = () => {
    if (!email) {
      Alert.alert('Error', 'Email address not found.');
      return;
    }
    
    // TODO: Implement forgot password API call
    Alert.alert(
      'Password Reset Email Sent',
      `A password reset link has been sent to ${email}. Please check your inbox.`,
      [{ text: 'OK', onPress: () => setCurrentScreen('main') }]
    );
  };

  // Check if user is not authenticated
  if (!isAuthenticated || !token) {
    return (
      <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
        <LightHeader title="Account information" onBack={onBack} />
        <View style={styles.errorContainer}>
          <View style={[styles.stateCircle, isDarkMode && { backgroundColor: '#1E293B' }]}><Ionicons name="alert-circle-outline" size={40} color={isDarkMode ? '#DC2626' : HS.redText} /></View>
          <Text style={[styles.errorText, isDarkMode && { color: '#94A3B8' }]}>Please log in to view account information</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              clearAuth();
              router.replace('/(auth)/login');
            }}
          >
            <Text style={styles.retryButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Loading state - show loading when fetching and no cached data
  if ((isLoading || isFetching) && !profileData) {
    return (
      <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
        <LightHeader title="Account information" onBack={onBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDarkMode ? '#38BDF8' : HS.blue} />
          <Text style={[styles.loadingText, isDarkMode && { color: '#94A3B8' }]}>Loading account information...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
        <LightHeader title="Account information" onBack={onBack} />
        <View style={styles.errorContainer}>
          <View style={[styles.stateCircle, isDarkMode && { backgroundColor: '#1E293B' }]}><Ionicons name="alert-circle-outline" size={40} color={isDarkMode ? '#DC2626' : HS.redText} /></View>
          <Text style={[styles.errorText, isDarkMode && { color: '#94A3B8' }]}>Failed to load account information</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // If still no data after all checks, show error
  if (!profileData) {
    return (
      <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
        <LightHeader title="Account information" onBack={onBack} />
        <View style={styles.errorContainer}>
          <View style={[styles.stateCircle, isDarkMode && { backgroundColor: '#1E293B' }]}><Ionicons name="alert-circle-outline" size={40} color={isDarkMode ? '#DC2626' : HS.redText} /></View>
          <Text style={[styles.errorText, isDarkMode && { color: '#94A3B8' }]}>No account data available</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Personal Details Screen
  if (currentScreen === 'personal-details') {
    return (
      <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
        <LightHeader title="Update personal details" onBack={goBackToMain} />
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[styles.formCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>First Name</Text>
          <View style={[styles.inputContainer, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <TextInput
              style={[styles.inputText, isDarkMode && { color: '#F8FAFC' }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              maxLength={50}
            />
          </View>
          <Text style={[styles.charCount, isDarkMode && { color: '#94A3B8' }]}>{firstName.length}/50</Text>

          <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>Last Name</Text>
          <View style={[styles.inputContainer, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <TextInput
              style={[styles.inputText, isDarkMode && { color: '#F8FAFC' }]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
              maxLength={50}
            />
          </View>
          <Text style={[styles.charCount, isDarkMode && { color: '#94A3B8' }]}>{lastName.length}/50</Text>

          <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>Email</Text>
          <View style={[styles.inputContainer, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <TextInput
              style={[styles.inputText, styles.disabledInput, isDarkMode && { color: '#94A3B8' }]}
              value={email}
              editable={false}
              placeholder="Email address"
            />
          </View>
          <TouchableOpacity onPress={handleChangeEmail}>
            <Text style={[styles.changeContactLink, isDarkMode && { color: '#38BDF8' }]}>Change email</Text>
          </TouchableOpacity>

          <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>Phone Number</Text>
          <View style={[styles.inputContainer, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <TextInput
              style={[styles.inputText, styles.disabledInput, isDarkMode && { color: '#94A3B8' }]}
              value={phone}
              editable={false}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>
          <TouchableOpacity onPress={handleUpdateMobile}>
            <Text style={[styles.changeContactLink, isDarkMode && { color: '#38BDF8' }]}>Change phone</Text>
          </TouchableOpacity>

          <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>Location</Text>
          <View style={styles.locationSection}>
            <LocationAutocomplete
              onSelect={handleLocationSelect}
              initialValue={location}
              placeholder="Search suburb or city..."
              country="AU"
            />
          </View>

          <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>Bio</Text>
          <View style={[styles.inputContainer, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <TextInput
              style={[styles.inputText, styles.textArea, isDarkMode && { color: '#F8FAFC' }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={300}
            />
          </View>
          <Text style={[styles.charCount, isDarkMode && { color: '#94A3B8' }]}>{bio.length}/300</Text>

          {/* Save Changes Button */}
          <TouchableOpacity 
            style={[styles.saveButton, updateProfileMutation.isPending && styles.saveButtonDisabled]} 
            onPress={handleSaveChanges}
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          {/* Add some bottom padding */}
          <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </View>
    );
  }

  // Change Password Screen
  if (currentScreen === 'change-password') {
    return (
      <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
        <LightHeader title="Change Password" onBack={goBackToMain} />
        <View style={styles.passwordContent}>
          <View style={styles.lockIconContainer}>
            <View style={[styles.stateCircle, isDarkMode && { backgroundColor: '#1E293B' }]}>
              <Ionicons name="lock-closed-outline" size={40} color={isDarkMode ? '#38BDF8' : HS.blue} />
            </View>
          </View>
          
          <Text style={[styles.passwordText, isDarkMode && { color: '#F8FAFC' }]}>
            To change your password, tap the button below to receive an email with a password reset link.
          </Text>
          <Text style={[styles.passwordText, isDarkMode && { color: '#F8FAFC' }]}>This email will be sent to:</Text>
          
          <Text style={[styles.emailText, isDarkMode && { color: '#F8FAFC' }]}>{email}</Text>
          
          <TouchableOpacity style={[styles.saveButton, { alignSelf: 'stretch' }]} onPress={handleSendPasswordResetEmail} activeOpacity={0.85}>
            <Text style={styles.saveButtonText}>Send Reset Email</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Mobile Verification Screen
  if (currentScreen === 'mobile-verification') {
    const phoneBusy = requestPhoneOtpMutation.isPending || verifyPhoneOtpMutation.isPending;
    return (
      <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
        <LightHeader title="Change phone" onBack={goBackToMain} />
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[styles.formCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>New mobile number</Text>
          <View style={[styles.inputContainer, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <TextInput
              style={[styles.inputText, isDarkMode && { color: '#F8FAFC' }]}
              value={newPhone}
              onChangeText={setNewPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>
          {phoneOtpSent && (
            <>
              <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>Verification code</Text>
              <View style={[styles.inputContainer, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                <TextInput
                  style={[styles.inputText, isDarkMode && { color: '#F8FAFC' }]}
                  value={phoneOtp}
                  onChangeText={setPhoneOtp}
                  placeholder="Enter OTP"
                  keyboardType="number-pad"
                />
              </View>
            </>
          )}
          <View style={styles.mobileButtonsContainer}>
            <TouchableOpacity
              style={[styles.saveMobileButton, phoneBusy && styles.saveButtonDisabled]}
              onPress={phoneOtpSent ? handleVerifyPhoneOtp : handleRequestPhoneOtp}
              disabled={phoneBusy}
            >
              {phoneBusy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveMobileButtonText}>
                  {phoneOtpSent ? 'Verify phone' : 'Send verification code'}
                </Text>
              )}
            </TouchableOpacity>
            {phoneOtpSent && (
              <TouchableOpacity
                style={[styles.removeButton, isDarkMode && { backgroundColor: 'transparent', borderColor: '#FFFFFF' }]}
                onPress={handleRequestPhoneOtp}
                disabled={phoneBusy}
              >
                <Text style={[styles.removeButtonText, isDarkMode && { color: '#FFFFFF' }]}>Resend code</Text>
              </TouchableOpacity>
            )}
          </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (currentScreen === 'email-verification') {
    const emailBusy = requestEmailOtpMutation.isPending || verifyEmailOtpMutation.isPending;
    return (
      <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
        <LightHeader title="Change email" onBack={goBackToMain} />
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[styles.formCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>New email</Text>
          <View style={[styles.inputContainer, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <TextInput
              style={[styles.inputText, isDarkMode && { color: '#F8FAFC' }]}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {emailOtpSent && (
            <>
              <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>Verification code</Text>
              <View style={[styles.inputContainer, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                <TextInput
                  style={[styles.inputText, isDarkMode && { color: '#F8FAFC' }]}
                  value={emailOtp}
                  onChangeText={setEmailOtp}
                  placeholder="Enter OTP"
                  keyboardType="number-pad"
                />
              </View>
            </>
          )}
          <View style={styles.mobileButtonsContainer}>
            <TouchableOpacity
              style={[styles.saveMobileButton, emailBusy && styles.saveButtonDisabled]}
              onPress={emailOtpSent ? handleVerifyEmailOtp : handleRequestEmailOtp}
              disabled={emailBusy}
            >
              {emailBusy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveMobileButtonText}>
                  {emailOtpSent ? 'Verify email' : 'Send verification code'}
                </Text>
              )}
            </TouchableOpacity>
            {emailOtpSent && (
              <TouchableOpacity
                style={[styles.removeButton, isDarkMode && { backgroundColor: 'transparent', borderColor: '#FFFFFF' }]}
                onPress={handleRequestEmailOtp}
                disabled={emailBusy}
              >
                <Text style={[styles.removeButtonText, isDarkMode && { color: '#FFFFFF' }]}>Resend code</Text>
              </TouchableOpacity>
            )}
          </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Main Account Information Screen
  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <LightHeader title="Account information" onBack={onBack} />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <MenuItem 
          icon="person-outline"
          text="Update personal details" 
          onPress={handleUpdatePersonalDetails}
          showArrow={true}
        />
        <MenuItem 
          icon="lock-closed-outline"
          text="Change password" 
          onPress={handleChangePassword}
          showArrow={true}
          disabled={true}
          subtitle="Can only be changed from the web"
        />
        <MenuItem 
          icon="call-outline"
          text="Change phone" 
          onPress={handleUpdateMobile}
          showArrow={true}
        />
        <MenuItem 
          icon="mail-outline"
          text="Change email" 
          onPress={handleChangeEmail}
          showArrow={true}
        />
        <MenuItem 
          icon="trash-outline"
          tone="red"
          text="Delete my account" 
          onPress={handleDeleteAccount}
          showArrow={false}
          textColor={HS.redText}
        />
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Text style={[styles.modalTitle, isDarkMode && { color: '#F8FAFC' }]}>Are you sure you want to delete your account?</Text>
            <Text style={[styles.modalText, isDarkMode && { color: '#94A3B8' }]}>
              Account deletion is irreversible. You will not be able to restore your account after this step is performed, or use the same email address to create a new account. This process will take effect after 2-5 business days.
            </Text>

            {existingDeleteRequest ? (
              // Already has a pending request
              <View style={styles.pendingRequestInfo}>
                <Ionicons name="hourglass-outline" size={20} color="#D97706" />
                <Text style={styles.pendingRequestText}>
                  You already have a pending deletion request submitted on {new Date(existingDeleteRequest.created_at).toLocaleDateString()}. It is currently under admin review.
                </Text>
              </View>
            ) : (
              // Reason input
              <View style={styles.reasonContainer}>
                <Text style={[styles.reasonLabel, isDarkMode && { color: '#F8FAFC' }]}>Reason for deletion *</Text>
                <TextInput
                  style={[styles.reasonInput, isDarkMode && { backgroundColor: '#0F172A', color: '#F8FAFC', borderColor: '#334155' }]}
                  value={deleteReason}
                  onChangeText={setDeleteReason}
                  placeholder="Please tell us why you want to delete your account..."
                  placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text style={[styles.reasonCharCount, isDarkMode && { color: '#94A3B8' }]}>{deleteReason.length}/500</Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.cancelButton, isDarkMode && { backgroundColor: '#0F172A' }]} 
                onPress={cancelDelete}
                disabled={isDeleting}
              >
                <Text style={[styles.cancelButtonText, isDarkMode && { color: '#94A3B8' }]}>No, cancel</Text>
              </TouchableOpacity>
              {!existingDeleteRequest && (
                <TouchableOpacity 
                  style={[styles.deleteButton, (isDeleting || !deleteReason.trim()) && styles.saveButtonDisabled]} 
                  onPress={confirmDelete}
                  disabled={isDeleting || !deleteReason.trim()}
                >
                  {isDeleting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.deleteButtonText}>Yes, delete</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const MenuItem = ({ text, onPress, showArrow = true, textColor = HS.navy, disabled = false, subtitle, icon, tone = 'blue' }: {
  text: string;
  onPress: () => void;
  showArrow?: boolean;
  textColor?: string;
  disabled?: boolean;
  subtitle?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  tone?: 'blue' | 'red';
}) => {
  const { isDarkMode } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.menuItem, disabled && styles.menuItemDisabled, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
      onPress={!disabled ? onPress : undefined}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon ? <IconChip name={icon} tone={tone} style={{ marginRight: 12 }} /> : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={[styles.menuText, { color: disabled ? (isDarkMode ? '#64748B' : HS.muted) : (isDarkMode ? (tone === 'red' ? '#F87171' : '#F8FAFC') : textColor) }]}
          numberOfLines={1}
        >
          {text}
        </Text>
        {subtitle && <Text style={[styles.menuSubtitle, isDarkMode && { color: '#94A3B8' }]}>{subtitle}</Text>}
      </View>
      {showArrow && !disabled && <Ionicons name="chevron-forward" size={18} color={isDarkMode ? '#94A3B8' : HS.muted} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HS.page,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: HS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: HS.cardBorder,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 20,
    shadowColor: HS.blue,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    shadowOffset: { width: 0, height: 6 },
  },
  stateCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: HS.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HS.card,
    padding: 14,
    marginBottom: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: HS.cardBorder,
    shadowColor: HS.blue,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    shadowOffset: { width: 0, height: 6 },
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuItemDisabled: {
    opacity: 0.65,
  },
  menuSubtitle: {
    fontSize: 12,
    color: HS.muted,
    marginTop: 2,
  },
  webOnlyLabel: {
    fontSize: RFValue(12),
    color: '#DC2626',
    marginBottom: 8,
  },
  changeContactLink: {
    fontSize: RFValue(14),
    color: HS.blue,
    textDecorationLine: 'underline',
    fontWeight: '600',
    marginBottom: 8,
  },
  locationSection: {
    marginBottom: 8,
    zIndex: 9999,
    elevation: 9999,
    overflow: 'visible',
  },
  webOnlyScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  webOnlyTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: HS.navy,
    marginBottom: 12,
    textAlign: 'center',
  },
  webOnlyDescription: {
    fontSize: RFValue(15),
    color: HS.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  webOnlyUrl: {
    fontSize: RFValue(14),
    color: HS.blue,
    fontWeight: '600',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: HS.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  subLabel: {
    fontSize: RFValue(14),
    color: '#64748B',
    marginBottom: 8,
  },
  charCount: {
    fontSize: RFValue(12),
    color: HS.muted,
    textAlign: 'right',
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: HS.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  inputText: {
    flex: 1,
    fontSize: RFValue(16),
    color: HS.navy,
  },
  disabledInput: {
    color: '#64748B',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#ff6b35',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  passwordContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  lockIconContainer: {
    marginBottom: 32,
  },
  lockIcon: {
    width: 80,
    height: 100,
    position: 'relative',
  },
  lockBody: {
    position: 'absolute',
    bottom: 0,
    width: 80,
    height: 60,
    backgroundColor: '#FFD700',
    borderRadius: 8,
  },
  lockShackle: {
    position: 'absolute',
    top: 0,
    left: 16,
    width: 48,
    height: 50,
    borderWidth: 8,
    borderColor: '#FFD700',
    borderRadius: 24,
    borderBottomWidth: 0,
  },
  keyhole: {
    position: 'absolute',
    bottom: 20,
    left: 32,
    width: 16,
    height: 20,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  passwordText: {
    fontSize: RFValue(16),
    color: HS.muted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  emailText: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: HS.navy,
    textAlign: 'center',
    marginBottom: 32,
  },
  mobileButtonsContainer: {
    marginTop: 24,
    gap: 14,
  },
  removeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: HS.blue,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: HS.blue,
    fontSize: 16,
    fontWeight: '700',
  },
  saveMobileButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff6b35',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  saveMobileButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: HS.navy,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: RFValue(14),
    color: HS.muted,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  reasonContainer: {
    width: '100%',
    marginTop: 12,
    marginBottom: 4,
  },
  reasonLabel: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#E8ECF4',
    borderRadius: 14,
    padding: 12,
    fontSize: RFValue(14),
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    minHeight: 80,
  },
  reasonCharCount: {
    fontSize: RFValue(11),
    color: '#64748B',
    textAlign: 'right',
    marginTop: 2,
  },
  pendingRequestInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  pendingRequestText: {
    flex: 1,
    fontSize: RFValue(13),
    color: '#92400E',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: RFValue(16),
    color: HS.muted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: RFValue(16),
    color: HS.muted,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
