import { useGetUserProfile, useUpdateUserProfile } from '@/src/shared/hooks/useUserProfileApi';
import { useAuthStore } from '@/src/store/auth-task-store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AccountInformationProps {
  onBack: () => void;
}

export default function AccountInformation({ onBack }: AccountInformationProps) {
  const [currentScreen, setCurrentScreen] = useState('main');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
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
        } else if (typeof profileData.location === 'object') {
          // Extract location from object
          const loc = profileData.location as any;
          const locationStr = [loc.suburb, loc.city, loc.region, loc.country]
            .filter(Boolean)
            .join(', ');
          setLocation(locationStr || loc.country || '');
        }
      } else {
        setLocation('');
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

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Clear authentication and redirect to login
      await clearAuth();
      setShowDeleteModal(false);
      
      Alert.alert(
        'Account Deletion Requested', 
        'Your account deletion request has been submitted. This process will take effect after 2-5 business days.',
        [{
          text: 'OK',
          onPress: () => {
            router.replace('/(auth)/login');
          }
        }]
      );
    } catch (error) {
      console.error('Delete account error:', error);
      Alert.alert('Error', 'Failed to process account deletion. Please try again.');
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
    try {
      // Build update data with only non-empty fields
      const updateData: any = {};
      if (firstName?.trim()) updateData.firstName = firstName.trim();
      if (lastName?.trim()) updateData.lastName = lastName.trim();
      if (phone?.trim()) updateData.phone = phone.trim();
      if (bio?.trim()) updateData.bio = bio.trim();
      
      // Add location if available
      if (location?.trim()) {
        const locationParts = location.split(',').map(part => part.trim()).filter(part => part);
        if (locationParts.length > 0) {
          const locationData: any = {};
          if (locationParts.length === 1) {
            locationData.city = locationParts[0];
          } else if (locationParts.length === 2) {
            locationData.city = locationParts[0];
            locationData.country = locationParts[1];
          } else {
            locationData.city = locationParts[0];
            locationData.region = locationParts[1];
            locationData.country = locationParts[2];
          }
          updateData.location = locationData;
        }
      }
      
      const response = await updateProfileMutation.mutateAsync(updateData);
      
      Alert.alert(
        '✓ Request Submitted', 
        response.message || 'Profile update submitted for admin approval. You will be notified once approved.',
        [{ text: 'OK', onPress: () => setCurrentScreen('main') }]
      );
      
      // Refresh profile data
      refetch();
    } catch (error: any) {
      console.error('Update profile error:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to update profile. Please try again.';
      
      // Check if this is the "pending request" error
      if (errorMsg?.toLowerCase().includes('pending') || 
          errorMsg?.toLowerCase().includes('already have')) {
        Alert.alert(
          '⏳ Pending Request Blocking Updates',
          'You have an existing profile update waiting for admin approval. Your backend only allows 1 pending request at a time.\n\n' +
          '📧 Contact your admin at:\nadministration@mytodoo.com\n\n' +
          'Ask them to approve or reject your pending request so you can make new updates.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', errorMsg);
      }
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
              const response = await updateProfileMutation.mutateAsync({
                phone: '',
              });
              setPhone('');
              Alert.alert('Request Submitted', response.message || 'Mobile number removal submitted for admin approval.');
            } catch (error: any) {
              const errorMsg = error?.response?.data?.message || error?.message || 'Failed to remove mobile number.';
              Alert.alert('Error', errorMsg);
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
      const response = await updateProfileMutation.mutateAsync({
        phone: phone.trim(),
      });
      
      Alert.alert(
        '✓ Request Submitted', 
        response.message || 'Mobile number update submitted for admin approval.',
        [{ text: 'OK', onPress: () => setCurrentScreen('main') }]
      );
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to update mobile number.';
      
      // Check if this is the "pending request" error
      if (errorMsg?.toLowerCase().includes('pending') || 
          errorMsg?.toLowerCase().includes('already have')) {
        Alert.alert(
          '⏳ Pending Request Blocking Updates',
          'You have an existing profile update waiting for admin approval. Your backend only allows 1 pending request at a time.\n\n' +
          '📧 Contact your admin at:\nadministration@mytodoo.com\n\n' +
          'Ask them to approve or reject your pending request so you can make new updates.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', errorMsg);
      }
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
        <ScrollView style={styles.content}>
          <Text style={styles.label}>First Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputText}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
            />
          </View>

          <Text style={styles.label}>Last Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputText}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
            />
          </View>

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
              style={styles.inputText}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.label}>Location</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputText}
              value={location}
              onChangeText={setLocation}
              placeholder="Enter location"
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
            />
          </View>

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
          <Text style={styles.headerTitle}>Mobile verification</Text>
        </View>
        <ScrollView style={styles.content}>
          <Text style={styles.label}>Mobile number</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputText}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.mobileButtonsContainer}>
            {phone.trim() !== '' && (
              <TouchableOpacity 
                style={styles.removeButton} 
                onPress={handleRemoveMobile}
                disabled={updateProfileMutation.isPending}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.saveMobileButton, updateProfileMutation.isPending && styles.saveButtonDisabled]} 
              onPress={handleSaveMobile}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveMobileButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Add some bottom padding */}
          <View style={{ height: 40 }} />
        </ScrollView>
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
        />
        <MenuItem 
          text="Update mobile number" 
          onPress={handleUpdateMobile}
          showArrow={true}
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Are you sure you want to delete your account?</Text>
            <Text style={styles.modalText}>
              Account deletion is irreversible. You will not be able to restore your account after this step is performed, or use the same email address to create a new account. This process will take effect after 2-5 business days.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={cancelDelete}
                disabled={isDeleting}
              >
                <Text style={styles.cancelButtonText}>No, cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.deleteButton, isDeleting && styles.saveButtonDisabled]} 
                onPress={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.deleteButtonText}>Yes, delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const MenuItem = ({ text, onPress, showArrow = true, textColor = "#333" }: {
  text: string;
  onPress: () => void;
  showArrow?: boolean;
  textColor?: string;
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Text style={[styles.menuText, { color: textColor }]}>{text}</Text>
    {showArrow && <Ionicons name="chevron-forward" size={18} color="#888" />}
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
    paddingTop: 50,
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
