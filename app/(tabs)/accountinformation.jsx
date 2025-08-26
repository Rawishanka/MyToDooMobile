import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AccountInformation({ onBack }) {
  const [currentScreen, setCurrentScreen] = useState('main');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Personal details state
  const [dateOfBirth, setDateOfBirth] = useState(new Date('1964-06-02'));
  const [email, setEmail] = useState('tonyjayasinghecrl@hotmail.com');
  const [mainGoal, setMainGoal] = useState('earn-money'); // 'get-things-done' or 'earn-money'
  const [userType, setUserType] = useState('business'); // 'individual' or 'business'
  const [abn, setAbn] = useState('53350036384');
  const [mobileNumber, setMobileNumber] = useState('0403001316');

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

  const confirmDelete = () => {
    setShowDeleteModal(false);
    // Handle delete account logic here
    Alert.alert('Account Deleted', 'Your account has been scheduled for deletion.');
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const goBackToMain = () => {
    setCurrentScreen('main');
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(false);
    setDateOfBirth(currentDate);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSaveChanges = () => {
    // Here you would typically save the changes to your backend
    Alert.alert(
      'Changes Saved', 
      'Your personal details have been updated successfully.',
      [{ text: 'OK', onPress: () => setCurrentScreen('main') }]
    );
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
          onPress: () => {
            setMobileNumber('');
            Alert.alert('Mobile Removed', 'Your mobile number has been removed successfully.');
          }
        }
      ]
    );
  };

  const handleSaveMobile = () => {
    if (mobileNumber.trim() === '') {
      Alert.alert('Error', 'Please enter a valid mobile number.');
      return;
    }
    Alert.alert(
      'Mobile Number Updated', 
      'Your mobile number has been updated successfully.',
      [{ text: 'OK', onPress: () => setCurrentScreen('main') }]
    );
  };

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
          <Text style={styles.label}>Date of birth</Text>
          <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
            <Text style={styles.inputText}>{formatDate(dateOfBirth)}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          <Text style={styles.label}>Email</Text>
          <Text style={styles.subLabel}>
            This can only be changed <Text style={styles.linkText}>here</Text>
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputText}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>What is your main goal on Airtasker?*</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity 
              style={[
                styles.optionButton, 
                mainGoal === 'get-things-done' ? styles.optionSelected : styles.optionUnselected
              ]}
              onPress={() => setMainGoal('get-things-done')}
            >
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color={mainGoal === 'get-things-done' ? '#fff' : '#666'} 
              />
              <Text style={[
                styles.optionText, 
                mainGoal === 'get-things-done' && { color: '#fff' }
              ]}>
                Get things done
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.optionButton, 
                mainGoal === 'earn-money' ? styles.optionSelected : styles.optionUnselected
              ]}
              onPress={() => setMainGoal('earn-money')}
            >
              <Text style={[
                styles.dollarSign,
                mainGoal === 'earn-money' ? { color: '#fff' } : { color: '#666' }
              ]}>
                $
              </Text>
              <Text style={[
                styles.optionText, 
                mainGoal === 'earn-money' && { color: '#fff' }
              ]}>
                Earn money
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Are you an individual or a business?</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity 
              style={[
                styles.optionButton, 
                userType === 'individual' ? styles.optionSelected : styles.optionUnselected
              ]}
              onPress={() => setUserType('individual')}
            >
              <Ionicons 
                name="person-outline" 
                size={24} 
                color={userType === 'individual' ? '#fff' : '#666'} 
              />
              <Text style={[
                styles.optionText, 
                userType === 'individual' && { color: '#fff' }
              ]}>
                Individual
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.optionButton, 
                userType === 'business' ? styles.optionSelected : styles.optionUnselected
              ]}
              onPress={() => setUserType('business')}
            >
              <MaterialIcons 
                name="business" 
                size={24} 
                color={userType === 'business' ? '#fff' : '#666'} 
              />
              <Text style={[
                styles.optionText, 
                userType === 'business' && { color: '#fff' }
              ]}>
                Business
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>ABN (If applicable)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputText}
              value={abn}
              onChangeText={setAbn}
              placeholder="Enter ABN"
              keyboardType="numeric"
            />
          </View>

          {/* Save Changes Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
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
          
          <Text style={styles.updateEmailText}>
            If you need to update your email address, please tap <Text style={styles.linkText}>here</Text>.
          </Text>
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
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.mobileButtonsContainer}>
            {mobileNumber.trim() !== '' && (
              <TouchableOpacity style={styles.removeButton} onPress={handleRemoveMobile}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.saveMobileButton} onPress={handleSaveMobile}>
              <Text style={styles.saveMobileButtonText}>Save Changes</Text>
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
              <TouchableOpacity style={styles.cancelButton} onPress={cancelDelete}>
                <Text style={styles.cancelButtonText}>No, cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
                <Text style={styles.deleteButtonText}>Yes, delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const MenuItem = ({ text, onPress, showArrow = true, textColor = "#333" }) => (
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
    borderBottomColor: '#eee',
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
    backgroundColor: '#fff',
    marginTop: 1,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#0052A2',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '500',
  },

  // Personal Details styles
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  linkText: {
    color: '#0052A2',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  optionSelected: {
    backgroundColor: '#0052A2',
  },
  optionUnselected: {
    backgroundColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  dollarSign: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },

  // Save button styles
  saveButton: {
    backgroundColor: '#0052A2',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Change Password styles
  passwordContent: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    alignItems: 'center',
  },
  lockIconContainer: {
    marginBottom: 60,
  },
  lockIcon: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  lockBody: {
    width: 60,
    height: 45,
    backgroundColor: '#0052A2',
    borderRadius: 8,
    position: 'absolute',
    bottom: 0,
    left: 10,
  },
  lockShackle: {
    width: 40,
    height: 30,
    borderWidth: 8,
    borderColor: '#0052A2',
    borderRadius: 20,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 5,
    left: 20,
    borderBottomWidth: 0,
  },
  keyhole: {
    width: 8,
    height: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    position: 'absolute',
    bottom: 15,
    left: 36,
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
  updateEmailText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Mobile verification styles
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
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveMobileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});