// EditProfileScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const EditProfileScreen = ({ onBack, onSave }) => {
  const [firstName, setFirstName] = useState('Prasanna');
  const [lastName, setLastName] = useState('Hewapathirana');
  const [bio, setBio] = useState('Hi I\'m Janidu');
  const [phone, setPhone] = useState('+94771628274');
  const [country, setCountry] = useState('Sri Lanka');
  const [countryCode, setCountryCode] = useState('LK');
  const [suburb, setSuburb] = useState('Meerigama');
  const [region, setRegion] = useState('Western Province');
  const [city, setCity] = useState('Meerigama');
  const [profileImage, setProfileImage] = useState('https://randomuser.me/api/portraits/men/1.jpg');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  
  // Modal states
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPhotoSelectionScreen, setShowPhotoSelectionScreen] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);

  // Example photos for selection
  const examplePhotos = [
    { id: 1, uri: 'https://randomuser.me/api/portraits/women/1.jpg', good: true },
    { id: 2, uri: 'https://randomuser.me/api/portraits/men/2.jpg', good: true },
    { id: 3, uri: 'https://randomuser.me/api/portraits/men/3.jpg', good: false },
    { id: 4, uri: 'https://randomuser.me/api/portraits/women/2.jpg', good: false },
  ];

  const handleSaveChanges = async () => {
    // Validate required fields
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Missing Information', 'Please enter both first name and last name.');
      return;
    }

    console.log('💾 [Profile Edit] Save Changes button pressed');
    
    try {
      // Flatten skills array for API
      const flattenedSkills = [
        ...skills
      ];

      // Prepare the profile update data with location object
      const profileUpdateData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        location: {
          country: country.trim(),
          countryCode: countryCode.trim(),
          region: region.trim(),
          city: city.trim()
        },
        bio: bio.trim(),
        skills: {
          goodAt: flattenedSkills,
          transport: [],
          languages: [],
          qualifications: [],
          experience: []
        }
      };

      console.log('📤 [Profile Edit] Submitting profile update:', JSON.stringify(profileUpdateData, null, 2));

      // Import the user profile API (PUT /users/profile)
      const { updateUserProfile } = await import('@/src/api/user-profile-api');
      
      // Submit profile update (backend handles admin approval)
      const response = await updateUserProfile(profileUpdateData);

      console.log('✅ [Profile Edit] Profile update submitted:', JSON.stringify(response, null, 2));

      if (response) {
        // Show success alert with admin approval message
        Alert.alert(
          '✓ Request Submitted',
          response.message || 'Profile update submitted for admin approval. You will be notified once approved.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                // Call onSave callback with updated data
                if (onSave) {
                  onSave({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    phone: phone.trim(),
                    location: profileUpdateData.location,
                    bio: bio.trim(),
                    skills: flattenedSkills,
                    fullName: `${firstName.trim()} ${lastName.trim()}`
                  });
                }
                // Navigate back
                if (onBack) {
                  onBack();
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ [Profile Edit] Error submitting profile update:', error);
      console.error('❌ [Profile Edit] Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      
      // Check if error is about pending request
      const errorData = error?.response?.data;
      const errorMessage = errorData?.message || error?.message || 'Failed to submit profile update. Please try again.';
      
      // Check if this is the "pending request" error
      if (errorMessage?.toLowerCase().includes('pending') || 
          errorMessage?.toLowerCase().includes('already have')) {
        Alert.alert(
          '⏳ Pending Request Blocking Updates',
          'You have an existing profile update waiting for admin approval. Your backend only allows 1 pending request at a time.\n\n' +
          '📧 Contact your admin at:\nadministration@mytodoo.com\n\n' +
          'Ask them to approve or reject your pending request so you can make new updates.',
          [
            { text: 'OK', style: 'default' },
            { 
              text: 'Copy Admin Email', 
              onPress: () => {
                Alert.alert('Admin Email', 'administration@mytodoo.com\n\nPlease contact them to clear your pending request.');
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Error',
          errorMessage,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleChangePhoto = () => {
    setShowPhotoModal(true);
  };

  const handleTakePhoto = () => {
    setShowPhotoModal(false);
    Alert.alert('Take Photo', 'Camera functionality would be implemented here');
  };

  const handleChoosePhoto = () => {
    setShowPhotoModal(false);
    setShowPhotoSelectionScreen(true);
  };

  const selectPhoto = (photoUri) => {
    setProfileImage(photoUri);
    setShowPhotoSelectionScreen(false);
  };

  const handleAddPhotos = () => {
    setShowPortfolioModal(true);
  };

  const handlePortfolioAction = (action) => {
    setShowPortfolioModal(false);
    Alert.alert('Portfolio', `${action} functionality would be implemented here`);
  };

  const handleAddSkills = () => {
    setShowSkillsModal(true);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSaveSkills = () => {
    setShowSkillsModal(false);
  };

  // Photo Selection Screen Component
  const PhotoSelectionScreen = () => (
    <Modal 
      visible={showPhotoSelectionScreen} 
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            onPress={() => setShowPhotoSelectionScreen(false)}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitle}>Profile Photo</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: profileImage }} style={styles.largeProfileImage} />
          </View>

          <Text style={styles.modalTitle}>Upload a profile photo of you</Text>
          <Text style={styles.modalSubtext}>
            Show yourself clearly to let customers and Taskers know who they're working with.
          </Text>

          <View style={styles.examplePhotos}>
            {examplePhotos.map((photo) => (
              <TouchableOpacity
                key={photo.id}
                style={styles.examplePhotoContainer}
                onPress={() => selectPhoto(photo.uri)}
              >
                <Image source={{ uri: photo.uri }} style={styles.examplePhoto} />
                <View style={[styles.photoStatus, photo.good ? styles.goodPhoto : styles.badPhoto]}>
                  <Ionicons 
                    name={photo.good ? "checkmark" : "close"} 
                    size={16} 
                    color="#fff" 
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.photoTips}>
            <View style={styles.photoTip}>
              <Ionicons name="checkmark" size={16} color="#28a745" />
              <Text style={styles.photoTipText}>Do show your face in bright lighting</Text>
            </View>
            <View style={styles.photoTip}>
              <Ionicons name="close" size={16} color="#dc3545" />
              <Text style={styles.photoTipText}>Avoid using logos, objects, vehicles etc.</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <ScrollView 
              style={styles.content} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="bulb-outline" size={20} color="#0052A2" />
          <View style={styles.infoBannerText}>
            <Text style={styles.infoBannerTitle}>Make your profile shine!</Text>
            <Text style={styles.infoBannerSubtext}>
              The information you add is visible to everyone.
            </Text>
          </View>
        </View>

        {/* Profile Picture Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile picture</Text>
          <Text style={styles.sectionSubtext}>
            Show yourself clearly to let others know who they're connecting with.
          </Text>
          
          <View style={styles.profilePictureContainer}>
            <Image
              source={{ uri: profileImage }}
              style={styles.profilePicture}
            />
            <TouchableOpacity style={styles.changePhotoButton} onPress={handleChangePhoto}>
              <Text style={styles.changePhotoText}>Change photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <Text style={styles.sectionSubtext}>
            Introduce yourself to new customers.
          </Text>
          
          <TextInput
            style={styles.bioInput}
            value={bio}
            onChangeText={setBio}
            placeholder="A brief introduction of who you are and what you do on Airtasker"
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Portfolio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Portfolio</Text>
          <Text style={styles.sectionSubtext}>
            Show off your work (Max. 30 images).
          </Text>
          
          <TouchableOpacity style={styles.addPortfolioButton} onPress={handleAddPhotos}>
            <Ionicons name="add-circle" size={40} color="#0052A2" />
          </TouchableOpacity>
        </View>

        {/* Verifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verifications</Text>
          <Text style={styles.sectionSubtext}>
            Build trust by adding verifications.
          </Text>
          
          <View style={styles.verificationItem}>
            <View style={styles.verificationIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#28a745" />
            </View>
            <Text style={styles.verificationText}>ID verified</Text>
          </View>
        </View>

        {/* Skills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.sectionSubtext}>
            Add skills relevant to your services.
          </Text>
          
          {skills.length > 0 && (
            <View style={styles.skillsContainer}>
              {skills.map((skill, index) => (
                <View key={index} style={styles.skillChip}>
                  <Text style={styles.skillText}>{skill}</Text>
                  <TouchableOpacity 
                    onPress={() => handleRemoveSkill(skill)}
                    style={styles.removeSkillButton}
                  >
                    <Ionicons name="close" size={16} color="#0052A2" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          
          <TouchableOpacity style={styles.addSkillsButton} onPress={handleAddSkills}>
            <Ionicons name="add-circle-outline" size={20} color="#0052A2" />
            <Text style={styles.addSkillsText}>Add skills</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>First name</Text>
          <TextInput
            style={styles.textInput}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last name</Text>
          <TextInput
            style={styles.textInput}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phone Number</Text>
          <TextInput
            style={styles.textInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Country</Text>
          <TextInput
            style={styles.textInput}
            value={country}
            onChangeText={setCountry}
            placeholder="Enter your country"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Country Code</Text>
          <TextInput
            style={styles.textInput}
            value={countryCode}
            onChangeText={setCountryCode}
            placeholder="e.g., AU, US, UK"
            placeholderTextColor="#999"
            autoCapitalize="characters"
            maxLength={2}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suburb</Text>
          <TextInput
            style={styles.textInput}
            value={suburb}
            onChangeText={setSuburb}
            placeholder="Enter your suburb"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>State/Region</Text>
          <TextInput
            style={styles.textInput}
            value={region}
            onChangeText={setRegion}
            placeholder="Enter your state or region"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>City</Text>
          <TextInput
            style={styles.textInput}
            value={city}
            onChangeText={setCity}
            placeholder="Enter your city"
            placeholderTextColor="#999"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Save changes</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Photo Change Modal */}
      <Modal
        visible={showPhotoModal}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBottom}>
            <TouchableOpacity style={styles.modalOption} onPress={handleTakePhoto}>
              <Text style={styles.modalOptionText}>Take photo</Text>
            </TouchableOpacity>
            <View style={styles.modalDivider} />
            <TouchableOpacity style={styles.modalOption} onPress={handleChoosePhoto}>
              <Text style={styles.modalOptionText}>Choose photo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalOption, styles.cancelOption]} 
              onPress={() => setShowPhotoModal(false)}
            >
              <Text style={styles.cancelOptionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Portfolio Modal */}
      <Modal
        visible={showPortfolioModal}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setShowPortfolioModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBottom}>
            <TouchableOpacity 
              style={styles.modalOption} 
              onPress={() => handlePortfolioAction('Add photos')}
            >
              <Text style={styles.modalOptionText}>Add photos</Text>
            </TouchableOpacity>
            <View style={styles.modalDivider} />
            <TouchableOpacity 
              style={styles.modalOption} 
              onPress={() => handlePortfolioAction('Take photo')}
            >
              <Text style={styles.modalOptionText}>Take photo</Text>
            </TouchableOpacity>
            <View style={styles.modalDivider} />
            <TouchableOpacity 
              style={styles.modalOption} 
              onPress={() => handlePortfolioAction('Choose photo')}
            >
              <Text style={styles.modalOptionText}>Choose photo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalOption, styles.cancelOption]} 
              onPress={() => setShowPortfolioModal(false)}
            >
              <Text style={styles.cancelOptionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Skills Modal */}
      <Modal
        visible={showSkillsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSkillsModal(false)}
      >
        <View style={styles.skillsModalContainer}>
          <View style={styles.skillsModalHeader}>
            {/* <TouchableOpacity 
              onPress={() => setShowSkillsModal(false)}
              style={styles.backButton}
            >
              <Text style={styles.cancelSkillsText}>Cancel</Text>
            </TouchableOpacity> */}

            <TouchableOpacity 
              onPress={() => setShowSkillsModal(false)} 
              style={styles.cancelButton}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>

            <Text style={styles.skillsModalTitle}>Add Skills</Text>
            <TouchableOpacity onPress={handleSaveSkills}>
              <Text style={styles.saveSkillsText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.skillsModalContent}>
            <Text style={styles.skillsModalSubtitle}>
              Add skills that are relevant to the services you provide
            </Text>

            <View style={styles.skillInputContainer}>
              <TextInput
                style={styles.skillInput}
                value={newSkill}
                onChangeText={setNewSkill}
                placeholder="Type a skill..."
                placeholderTextColor="#999"
                onSubmitEditing={handleAddSkill}
              />
              <TouchableOpacity 
                style={styles.addSkillButton} 
                onPress={handleAddSkill}
                disabled={!newSkill.trim()}
              >
                <Ionicons name="add" size={24} color={newSkill.trim() ? "#0052A2" : "#ccc"} />
              </TouchableOpacity>
            </View>

            {skills.length > 0 && (
              <View style={styles.addedSkillsSection}>
                <Text style={styles.addedSkillsTitle}>Your Skills ({skills.length})</Text>
                <View style={styles.skillsContainer}>
                  {skills.map((skill, index) => (
                    <View key={index} style={styles.skillChip}>
                      <Text style={styles.skillText}>{skill}</Text>
                      <TouchableOpacity 
                        onPress={() => handleRemoveSkill(skill)}
                        style={styles.removeSkillButton}
                      >
                        <Ionicons name="close" size={16} color="#0052A2" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.suggestedSkillsSection}>
              <Text style={styles.suggestedSkillsTitle}>Suggested Skills</Text>
              <View style={styles.skillsContainer}>
                {['Cleaning', 'Handyman', 'Moving', 'Gardening', 'Painting', 'Assembly', 'Delivery', 'Photography'].map((skill) => (
                  !skills.includes(skill) && (
                    <TouchableOpacity 
                      key={skill}
                      style={styles.suggestedSkillChip}
                      onPress={() => setSkills([...skills, skill])}
                    >
                      <Text style={styles.suggestedSkillText}>{skill}</Text>
                      <Ionicons name="add" size={16} color="#0052A2" />
                    </TouchableOpacity>
                  )
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Photo Selection Screen */}
      <PhotoSelectionScreen />
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    paddingTop: hp('6%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: wp('1%'),
    width: wp('8%'),
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: wp('8%'),
  },
  content: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f8ff',
    margin: wp('4%'),
    padding: wp('4%'),
    borderRadius: wp('2%'),
  },
  infoBannerText: {
    flex: 1,
    marginLeft: wp('3%'),
  },
  infoBannerTitle: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('0.5%'),
  },
  infoBannerSubtext: {
    fontSize: RFValue(14),
    color: '#666',
    lineHeight: RFValue(18),
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    marginHorizontal: wp('4%'),
    marginBottom: hp('2%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  pendingDot: {
    width: wp('2%'),
    height: wp('2%'),
    borderRadius: wp('1%'),
    backgroundColor: '#ff9800',
    marginRight: wp('2%'),
  },
  pendingText: {
    fontSize: RFValue(15),
    fontWeight: '700',
    color: '#856404',
    marginBottom: hp('0.5%'),
  },
  pendingSubtext: {
    fontSize: RFValue(13),
    fontWeight: '400',
    color: '#856404',
    lineHeight: RFValue(18),
  },
  section: {
    paddingHorizontal: wp('4%'),
    marginBottom: hp('4%'),
  },
  sectionTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('1%'),
  },
  sectionSubtext: {
    fontSize: RFValue(14),
    color: '#666',
    marginBottom: hp('2%'),
    lineHeight: RFValue(18),
  },
  profilePictureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: wp('18%'),
    height: wp('18%'),
    borderRadius: wp('9%'),
    marginRight: wp('4%'),
  },
  changePhotoButton: {
    paddingVertical: hp('1%'),
  },
  changePhotoText: {
    fontSize: RFValue(16),
    color: '#0052A2',
    fontWeight: '500',
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('2%'),
    padding: wp('4%'),
    fontSize: RFValue(16),
    minHeight: hp('15%'),
    backgroundColor: '#f9f9f9',
  },
  addPortfolioButton: {
    width: wp('20%'),
    height: wp('20%'),
    backgroundColor: '#f5f5f5',
    borderRadius: wp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: wp('4%'),
    borderRadius: wp('2%'),
  },
  verificationIcon: {
    marginRight: wp('3%'),
  },
  verificationText: {
    fontSize: RFValue(16),
    color: '#000',
    fontWeight: '500',
  },
  addSkillsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addSkillsText: {
    fontSize: RFValue(16),
    color: '#0052A2',
    fontWeight: '500',
    marginLeft: wp('2%'),
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('2%'),
    padding: wp('4%'),
    fontSize: RFValue(16),
    backgroundColor: '#f9f9f9',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: wp('4%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#ddd',
  },
  locationText: {
    fontSize: RFValue(16),
    color: '#000',
    marginLeft: wp('3%'),
  },
  saveButton: {
    backgroundColor: '#0052A2',
    marginHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('6%'),
    alignItems: 'center',
    marginTop: hp('2.5%'),
  },
  saveButtonText: {
    color: '#fff',
    fontSize: RFValue(18),
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    paddingBottom: 0, // Ensure it goes to the very bottom
  },
  modalBottom: {
    backgroundColor: '#fff',
    borderTopLeftRadius: wp('5%'),
    borderTopRightRadius: wp('5%'),
    paddingBottom: hp('5%'),
    paddingTop: hp('1.2%'),
  },
  modalOption: {
    paddingVertical: hp('2.5%'),
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: RFValue(18),
    color: '#0052A2',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#eee',
  },
  cancelOption: {
    marginTop: hp('1.2%'),
    backgroundColor: '#f8f8f8',
  },
  cancelOptionText: {
    fontSize: RFValue(18),
    color: '#dc3545',
    fontWeight: '500',
  },
  // Photo Selection Screen styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 0, // Ensure full screen coverage
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    paddingTop: hp('6%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalHeaderTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: wp('4%'),
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: hp('3.5%'),
  },
  largeProfileImage: {
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: wp('15%'),
  },
  modalTitle: {
    fontSize: RFValue(24),
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: hp('2%'),
  },
  modalSubtext: {
    fontSize: RFValue(16),
    color: '#666',
    textAlign: 'center',
    lineHeight: RFValue(24),
    marginBottom: hp('5%'),
  },
  examplePhotos: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: hp('5%'),
  },
  examplePhotoContainer: {
    position: 'relative',
  },
  examplePhoto: {
    width: wp('18%'),
    height: wp('18%'),
    borderRadius: wp('9%'),
  },
  photoStatus: {
    position: 'absolute',
    bottom: wp('-1.2%'),
    right: wp('-1.2%'),
    width: wp('6%'),
    height: wp('6%'),
    borderRadius: wp('3%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  goodPhoto: {
    backgroundColor: '#28a745',
  },
  badPhoto: {
    backgroundColor: '#dc3545',
  },
  photoTips: {
    marginTop: hp('2.5%'),
  },
  photoTip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  photoTipText: {
    fontSize: RFValue(16),
    color: '#666',
    marginLeft: wp('3%'),
  },
  // Skills styles
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: hp('2%'),
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('3%'),
    borderRadius: wp('5%'),
    marginRight: wp('2%'),
    marginBottom: hp('1%'),
    borderWidth: 1,
    borderColor: '#0052A2',
  },
  skillText: {
    fontSize: RFValue(14),
    color: '#0052A2',
    marginRight: wp('1%'),
  },
  removeSkillButton: {
    marginLeft: wp('1%'),
  },
  // Skills Modal styles
  skillsModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  skillsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    paddingTop: hp('6%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: hp('7.5%'),
  },
  skillsModalTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#000',
  },
  cancelSkillsText: {
    padding: wp('1%')
  },
  saveSkillsText: {
    fontSize: RFValue(16),
    color: '#0052A2',
    fontWeight: '600',
  },
  skillsModalContent: {
    flex: 1,
    padding: wp('4%'),
  },
  skillsModalSubtitle: {
    fontSize: RFValue(16),
    color: '#666',
    marginBottom: hp('3%'),
    lineHeight: RFValue(22),
  },
  skillInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('3%'),
  },
  skillInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('2%'),
    padding: wp('4%'),
    fontSize: RFValue(16),
    backgroundColor: '#f9f9f9',
    marginRight: wp('3%'),
  },
  addSkillButton: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0052A2',
  },
  addedSkillsSection: {
    marginBottom: hp('4%'),
  },
  addedSkillsTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('2%'),
  },
  suggestedSkillsSection: {
    marginBottom: hp('4%'),
  },
  suggestedSkillsTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('2%'),
  },
  suggestedSkillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('3%'),
    borderRadius: wp('5%'),
    marginRight: wp('2%'),
    marginBottom: hp('1%'),
    borderWidth: 1,
    borderColor: '#ddd',
  },
  suggestedSkillText: {
    fontSize: RFValue(14),
    color: '#666',
    marginRight: wp('1%'),
  },
});  