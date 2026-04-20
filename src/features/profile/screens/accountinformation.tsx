import { LocationAutocomplete, type LocationData } from '@/src/shared/components/LocationAutocomplete';
import { getDeleteRequest, submitDeleteRequest } from '@/src/api/user-profile-api';
import { useGetUserProfile, useUpdateUserProfile } from '@/src/shared/hooks/useUserProfileApi';
import { useAuthStore } from '@/src/store/auth-task-store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AccountInformationProps {
  onBack: () => void;
}

export default function AccountInformation({ onBack }: AccountInformationProps) {
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
    setCurrentScreen('mobile-verification');
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
        phone,
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
      'Remove Mobile Number',
      'Are you sure you want to remove your mobile number?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              await updateProfileMutation.mutateAsync({
                phone: '',
              });
              setPhone('');
              Alert.alert('Mobile Removed', 'Your mobile number has been removed successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove mobile number.');
            }
          }
        }
      ]
    );
  };

  const handleSaveMobile = async () => {
    if (phone.trim() === '') {
      Alert.alert('Error', 'Please enter a valid mobile number.');
      return;
    }
    
    try {
      await updateProfileMutation.mutateAsync({
        phone: phone.trim(),
      });
      
      Alert.alert(
        'Mobile Number Updated', 
        'Your mobile number has been updated successfully.',
        [{ text: 'OK', onPress: () => setCurrentScreen('main') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update mobile number.');
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
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account information</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#dc3545" />
          <Text style={styles.errorText}>Please log in to view account information</Text>
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
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account information</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0052A2" />
          <Text style={styles.loadingText}>Loading account information...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account information</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#dc3545" />
          <Text style={styles.errorText}>Failed to load account information</Text>
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
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account information</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#dc3545" />
          <Text style={styles.errorText}>No account data available</Text>
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
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBackToMain} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Update personal details</Text>
        </View>
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>First Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputText}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              maxLength={50}
            />
          </View>
          <Text style={styles.charCount}>{firstName.length}/50</Text>

          <Text style={styles.label}>Last Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputText}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
              maxLength={50}
            />
          </View>
          <Text style={styles.charCount}>{lastName.length}/50</Text>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.inputText, styles.disabledInput]}
              value={email}
              editable={false}
              placeholder="Email address"
            />
          </View>
          <Text style={styles.subLabel}>Email cannot be changed for security reasons</Text>

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.inputText, styles.disabledInput]}
              value={phone}
              editable={false}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>
          <Text style={styles.webOnlyLabel}>📱 Phone number can only be changed from the web</Text>

          <Text style={styles.label}>Location</Text>
          <View style={styles.locationSection}>
            <LocationAutocomplete
              onSelect={handleLocationSelect}
              initialValue={location}
              placeholder="Search suburb or city..."
              country="AU"
            />
          </View>

          <Text style={styles.label}>Bio</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.inputText, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={300}
            />
          </View>
          <Text style={styles.charCount}>{bio.length}/300</Text>

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
        </ScrollView>
      </View>
    );
  }

  // Change Password Screen
  if (currentScreen === 'change-password') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBackToMain} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
        </View>
        <View style={styles.passwordContent}>
          <View style={styles.lockIconContainer}>
            <View style={styles.lockIcon}>
              <View style={styles.lockBody} />
              <View style={styles.lockShackle} />
              <View style={styles.keyhole} />
            </View>
          </View>
          
          <Text style={styles.passwordText}>
            To change your password, tap the button below to receive an email with a password reset link.
          </Text>
          <Text style={styles.passwordText}>This email will be sent to:</Text>
          
          <Text style={styles.emailText}>{email}</Text>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSendPasswordResetEmail}>
            <Text style={styles.saveButtonText}>Send Reset Email</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Mobile Verification Screen
  if (currentScreen === 'mobile-verification') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBackToMain} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Update Mobile Number</Text>
        </View>
        <View style={styles.webOnlyScreen}>
          <Ionicons name="phone-portrait-outline" size={64} color="#0052A2" style={{ marginBottom: 24 }} />
          <Text style={styles.webOnlyTitle}>Web Only Feature</Text>
          <Text style={styles.webOnlyDescription}>
            Mobile number changes can only be made from the web platform for security reasons.
          </Text>
          <Text style={styles.webOnlyUrl}>Visit: www.mytodoo.com.au</Text>
          <TouchableOpacity style={styles.saveButton} onPress={goBackToMain}>
            <Text style={styles.saveButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Main Account Information Screen
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account information</Text>
      </View>
      
      <View style={styles.content}>
        <MenuItem 
          text="Update personal details" 
          onPress={handleUpdatePersonalDetails}
          showArrow={true}
        />
        <MenuItem 
          text="Change password" 
          onPress={handleChangePassword}
          showArrow={true}
          disabled={true}
          subtitle="Can only be changed from the web"
        />
        <MenuItem 
          text="Update mobile number" 
          onPress={handleUpdateMobile}
          showArrow={true}
          disabled={true}
          subtitle="Can only be changed from the web"
        />
        <MenuItem 
          text="Delete my account" 
          onPress={handleDeleteAccount}
          showArrow={false}
          textColor="#333"
        />
      </View>

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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Are you sure you want to delete your account?</Text>
            <Text style={styles.modalText}>
              Account deletion is irreversible. You will not be able to restore your account after this step is performed, or use the same email address to create a new account. This process will take effect after 2-5 business days.
            </Text>

            {existingDeleteRequest ? (
              // Already has a pending request
              <View style={styles.pendingRequestInfo}>
                <Ionicons name="hourglass-outline" size={20} color="#f39c12" />
                <Text style={styles.pendingRequestText}>
                  You already have a pending deletion request submitted on {new Date(existingDeleteRequest.created_at).toLocaleDateString()}. It is currently under admin review.
                </Text>
              </View>
            ) : (
              // Reason input
              <View style={styles.reasonContainer}>
                <Text style={styles.reasonLabel}>Reason for deletion *</Text>
                <TextInput
                  style={styles.reasonInput}
                  value={deleteReason}
                  onChangeText={setDeleteReason}
                  placeholder="Please tell us why you want to delete your account..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text style={styles.reasonCharCount}>{deleteReason.length}/500</Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={cancelDelete}
                disabled={isDeleting}
              >
                <Text style={styles.cancelButtonText}>No, cancel</Text>
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

const MenuItem = ({ text, onPress, showArrow = true, textColor = "#333", disabled = false, subtitle }: {
  text: string;
  onPress: () => void;
  showArrow?: boolean;
  textColor?: string;
  disabled?: boolean;
  subtitle?: string;
}) => (
  <TouchableOpacity style={[styles.menuItem, disabled && styles.menuItemDisabled]} onPress={!disabled ? onPress : undefined} disabled={disabled}>
    <View style={{ flex: 1 }}>
      <Text style={[styles.menuText, { color: disabled ? '#aaa' : textColor }]}>{text}</Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    {showArrow && !disabled && <Ionicons name="chevron-forward" size={18} color="#888" />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuItemDisabled: {
    backgroundColor: '#fafafa',
    opacity: 0.7,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 2,
  },
  webOnlyLabel: {
    fontSize: 12,
    color: '#dc3545',
    marginBottom: 8,
    marginHorizontal: 20,
  },
  locationSection: {
    marginHorizontal: 20,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  webOnlyDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  webOnlyUrl: {
    fontSize: 14,
    color: '#0052A2',
    fontWeight: '600',
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 20,
  },
  subLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginHorizontal: 20,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginHorizontal: 20,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    marginHorizontal: 20,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  disabledInput: {
    color: '#999',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#0052A2',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 32,
  },
  mobileButtonsContainer: {
    marginTop: 24,
    gap: 16,
  },
  removeButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#dc3545',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
  },
  saveMobileButton: {
    backgroundColor: '#0052A2',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  saveMobileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
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
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reasonContainer: {
    width: '100%',
    marginTop: 12,
    marginBottom: 4,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
    minHeight: 80,
  },
  reasonCharCount: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
    marginTop: 2,
  },
  pendingRequestInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff8e1',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  pendingRequestText: {
    flex: 1,
    fontSize: 13,
    color: '#856404',
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
    fontSize: 16,
    color: '#666',
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
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0052A2',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
