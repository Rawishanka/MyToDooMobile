// EditProfileScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LocationAutocomplete } from '@/src/shared/components/LocationAutocomplete';
import { uploadUserAvatar } from '@/src/api/user-profile-api';
import OCRAPI from '@/src/api/ocr-api';

const EditProfileScreen = ({ onBack, onSave, userData }) => {
  const insets = useSafeAreaInsets();
  // Initialize from userData if available, otherwise use defaults
  const [firstName, setFirstName] = useState(userData?.firstName || '');
  const [lastName, setLastName] = useState(userData?.lastName || '');
  const [bio, setBio] = useState(userData?.bio || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  
  // Extract location fields from userData
  const getLocationField = (field) => {
    if (!userData?.location) return '';
    if (typeof userData.location === 'object') {
      return userData.location[field] || '';
    }
    return '';
  };
  
  const [country, setCountry] = useState(getLocationField('country') || 'Australia');
  const [countryCode, setCountryCode] = useState(getLocationField('countryCode') || 'AU');
  const [suburb, setSuburb] = useState(getLocationField('suburb') || '');
  const [region, setRegion] = useState(getLocationField('region') || '');
  const [city, setCity] = useState(getLocationField('city') || '');
  const [profileImage, setProfileImage] = useState(userData?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg');
  
  // Extract skills from userData
  const getSkillsArray = () => {
    if (!userData?.skills) return [];
    if (Array.isArray(userData.skills)) return userData.skills;
    return [];
  };
  
  const [skills, setSkills] = useState(getSkillsArray());
  const [newSkill, setNewSkill] = useState('');
  
  // Modal states
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPhotoSelectionScreen, setShowPhotoSelectionScreen] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Example photos for selection
  const examplePhotos = [
    { id: 1, uri: 'https://randomuser.me/api/portraits/women/1.jpg', good: true },
    { id: 2, uri: 'https://randomuser.me/api/portraits/men/2.jpg', good: true },
    { id: 3, uri: 'https://randomuser.me/api/portraits/men/3.jpg', good: false },
    { id: 4, uri: 'https://randomuser.me/api/portraits/women/2.jpg', good: false },
  ];

  const handleSaveChanges = async () => {
    console.log('💾 [Profile Edit] Save Changes button pressed');
    
    // Validate required fields - firstName, lastName, and suburb are required
    if (!firstName.trim()) {
      Alert.alert('Required Field', 'Please enter your first name.');
      return;
    }
    
    if (!lastName.trim()) {
      Alert.alert('Required Field', 'Please enter your last name.');
      return;
    }
    
    // Suburb is now mandatory
    if (!suburb.trim()) {
      Alert.alert('Required Field', 'Please select your suburb using the search field.');
      return;
    }
    
    // Validate countryCode if provided (must be 2 characters)
    if (countryCode.trim() && countryCode.trim().length !== 2) {
      Alert.alert('Invalid Country Code', 'Country code must be exactly 2 characters (e.g., AU, US, UK).');
      return;
    }
    
    try {
      // Flatten skills array for API
      const flattenedSkills = [
        ...skills
      ];

      // Prepare the profile update data with smart defaults
      const profileUpdateData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined, // Don't send empty string
        location: {
          country: country.trim() || 'Australia', // Default to Australia
          countryCode: (countryCode.trim() || 'AU').toUpperCase(), // Default to AU
          suburb: suburb.trim(), // Required - validated above
          region: region.trim() || undefined, // Optional
          city: city.trim() || undefined, // Optional
        },
        bio: bio.trim() || undefined, // Don't send empty string
        skills: flattenedSkills.length > 0 ? flattenedSkills : undefined // Don't send empty array
      };

      console.log('📤 [Profile Edit] Updating profile with data:', JSON.stringify(profileUpdateData, null, 2));

      // Import the update profile API
      const { updateUserProfile } = await import('@/src/api/user-profile-api');
      
      // Call the API to update profile
      const response = await updateUserProfile(profileUpdateData);

      console.log('✅ [Profile Edit] Profile updated successfully:', JSON.stringify(response, null, 2));

      if (response.success) {
        // Show success alert
        Alert.alert(
          '✓ Success',
          'Profile updated successfully!',
          [
            { 
              text: 'OK', 
              onPress: () => {
                // Call onSave callback with updated data including proper location object
                if (onSave) {
                  onSave({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    phone: phone.trim(),
                    // Send location as object to match the API structure
                    location: {
                      country: country.trim() || 'Australia',
                      countryCode: (countryCode.trim() || 'AU').toUpperCase(),
                      suburb: suburb.trim(), // Required field
                      region: region.trim() || undefined,
                      city: city.trim() || undefined,
                    },
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
      console.error('❌ [Profile Edit] Error updating profile:', error);
      console.error('❌ [Profile Edit] Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      
      Alert.alert(
        'Error',
        error?.response?.data?.message || error?.message || 'Failed to update profile. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleChangePhoto = () => {
    setShowPhotoModal(true);
  };

  // Upload selected image to server via CDN
  const uploadProfilePhoto = async (imageUri) => {
    setIsUploadingPhoto(true);
    try {
      // ✅ OCR: Validate image for sensitive data before uploading
      console.log('🔍 [Edit Profile] Validating image with OCR API...');
      const validation = await OCRAPI.validateImageForUpload(imageUri);

      if (!validation.isValid) {
        console.warn('❌ [Edit Profile] Image contains sensitive data:', validation.reason);
        setIsUploadingPhoto(false);
        Alert.alert(
          'Sensitive Data Detected',
          `This image contains sensitive information and cannot be uploaded:\n\n${validation.reason}\n\nPlease remove phone numbers and addresses from the image.`,
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('✅ [Edit Profile] Image passed OCR validation');
      console.log('📸 [Edit Profile] Uploading profile photo via CDN...');
      // Pass URI directly - CDN upload is handled inside uploadUserAvatar
      const response = await uploadUserAvatar(imageUri);
      console.log('✅ [Edit Profile] Profile photo uploaded successfully:', response);

      // CRITICAL: Update local state with the backend avatar URL
      const avatarUrl = response?.data?.avatar || imageUri;
      setProfileImage(avatarUrl);
      console.log('✅ [Edit Profile] Profile image state updated:', avatarUrl);

      // CRITICAL: Invalidate user profile cache to refresh profile data
      console.log('🔄 [Edit Profile] Invalidating user profile cache...');
      try {
        const { queryClient } = await import('@tanstack/react-query');
        if (queryClient) {
          await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
          await queryClient.invalidateQueries({ queryKey: ['profile'] });
          console.log('✅ [Edit Profile] Profile cache invalidated');
        }
      } catch (cacheError) {
        console.warn('⚠️ [Edit Profile] Could not invalidate cache:', cacheError);
      }

      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('❌ [Edit Profile] Photo upload error:', error);
      Alert.alert(
        'Upload Failed',
        error?.message || 'Failed to upload profile picture. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleTakePhoto = async () => {
    setShowPhotoModal(false);

    // Request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need camera access to take your profile photo. Please enable it in your device settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      // Don't set local state yet - wait for successful upload
      // uploadProfilePhoto will update state with backend URL
      uploadProfilePhoto(imageUri);
    }
  };

  const handleChoosePhoto = async () => {
    setShowPhotoModal(false);

    // Request media library permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photo library to choose a profile picture. Please enable it in your device settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      // Don't set local state yet - wait for successful upload
      // uploadProfilePhoto will update state with backend URL
      uploadProfilePhoto(imageUri);
    }
  };

  const selectPhoto = (photoUri) => {
    setProfileImage(photoUri);
    setShowPhotoSelectionScreen(false);
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
        <View style={[styles.modalHeader, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
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
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
            <View>
              <Image
                source={{ uri: profileImage }}
                style={styles.profilePicture}
              />
              {isUploadingPhoto && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}
            </View>
            <TouchableOpacity 
              style={styles.changePhotoButton} 
              onPress={handleChangePhoto}
              disabled={isUploadingPhoto}
            >
              <Text style={styles.changePhotoText}>
                {isUploadingPhoto ? 'Uploading...' : 'Change photo'}
              </Text>
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
            style={[
              styles.bioInput,
              bio.length > 300 && styles.bioInputError
            ]}
            value={bio}
            onChangeText={(text) => setBio(text.slice(0, 300))}
            placeholder="A brief introduction of who you are and what you do on Mytodoo"
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            maxLength={300}
            textAlignVertical="top"
          />
          <View style={styles.bioFooter}>
            {bio.length >= 280 ? (
              <Text style={[styles.bioCharCount, bio.length >= 300 && styles.bioCharCountError]}>
                {bio.length >= 300 ? '⚠️ Maximum 300 characters reached' : `⚠️ ${300 - bio.length} characters remaining`}
              </Text>
            ) : (
              <Text style={styles.bioCharCountNormal}>
                {bio.length}/300
              </Text>
            )}
          </View>
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
          <Text style={styles.sectionTitle}>First name <Text style={styles.requiredAsterisk}>*</Text></Text>
          <TextInput
            style={styles.textInput}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last name <Text style={styles.requiredAsterisk}>*</Text></Text>
          <TextInput
            style={styles.textInput}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phone Number</Text>
          <TextInput
            style={[styles.textInput, styles.readOnlyInput]}
            value={phone}
            editable={false}
            placeholder="Phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
          <Text style={styles.webOnlyMessage}>📱 Phone number can only be changed from the web</Text>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Country (Optional)</Text>
          <Text style={styles.sectionSubtext}>Defaults to Australia if left blank</Text>
          <TextInput
            style={[styles.textInput, styles.readOnlyInput]}
            value={country}
            editable={false}
            placeholder="Australia"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Country Code (Optional)</Text>
          <Text style={styles.sectionSubtext}>Defaults to AU if left blank (must be 2 characters)</Text>
          <TextInput
            style={[styles.textInput, styles.readOnlyInput]}
            value={countryCode}
            editable={false}
            placeholder="AU"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suburb *</Text>
          <Text style={styles.helperText}>Search for your Australian suburb</Text>
          <LocationAutocomplete
            initialValue={suburb}
            placeholder="Start typing suburb name..."
            country="AU"
            onSelect={(locationData) => {
              console.log('📍 [Edit Profile] Location selected:', locationData);
              
              // Parse the address: "Suburb, State" or "Suburb, State, Country"
              const parts = locationData.address.split(',').map(p => p.trim());
              
              if (parts.length >= 2) {
                // Format: "Suburb, State" or "Suburb, State, Country"
                const suburbName = parts[0]; // e.g., "Narre Warren"
                const stateName = parts[1]; // e.g., "VIC"
                
                setSuburb(suburbName);
                setRegion(stateName);
                
                // Set city based on state (major cities)
                const cityMap = {
                  'VIC': 'Melbourne',
                  'NSW': 'Sydney',
                  'QLD': 'Brisbane',
                  'WA': 'Perth',
                  'SA': 'Adelaide',
                  'TAS': 'Hobart',
                  'ACT': 'Canberra',
                  'NT': 'Darwin'
                };
                
                if (cityMap[stateName]) {
                  setCity(cityMap[stateName]);
                }
                
                console.log('✅ [Edit Profile] Location fields updated:', {
                  suburb: suburbName,
                  region: stateName,
                  city: cityMap[stateName] || city
                });
              } else {
                // Fallback: just set the whole address as suburb
                setSuburb(locationData.address);
              }
            }}
            style={styles.locationAutocomplete}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>State/Region (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={region}
            onChangeText={setRegion}
            placeholder="e.g., VIC, NSW, QLD"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>City (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={city}
            onChangeText={setCity}
            placeholder="e.g., Melbourne, Sydney"
            placeholderTextColor="#999"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Save changes</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

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

      {/* Skills Modal */}
      <Modal
        visible={showSkillsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSkillsModal(false)}
      >
        <View style={styles.skillsModalContainer}>
          <View style={[styles.skillsModalHeader, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f8ff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  infoBannerText: {
    flex: 1,
    marginLeft: 12,
  },
  infoBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  infoBannerSubtext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  requiredAsterisk: {
    color: '#dc3545',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  profilePictureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    paddingVertical: 8,
  },
  changePhotoText: {
    fontSize: 16,
    color: '#0052A2',
    fontWeight: '500',
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#f9f9f9',
  },
  bioInputError: {
    borderColor: '#dc3545',
  },
  bioFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  bioCharCountNormal: {
    fontSize: 12,
    color: '#999',
  },
  bioCharCount: {
    fontSize: 12,
    color: '#e67e22',
    fontWeight: '500',
  },
  bioCharCountError: {
    color: '#dc3545',
    fontWeight: '600',
  },
  addPortfolioButton: {
    width: 80,
    height: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
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
    padding: 16,
    borderRadius: 8,
  },
  verificationIcon: {
    marginRight: 12,
  },
  verificationText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  addSkillsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addSkillsText: {
    fontSize: 16,
    color: '#0052A2',
    fontWeight: '500',
    marginLeft: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  readOnlyInput: {
    backgroundColor: '#f0f0f0',
    color: '#888',
  },
  webOnlyMessage: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
  },
  locationAutocomplete: {
    // LocationAutocomplete has its own internal styling
    // This is just a container style if needed
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  locationText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  saveButton: {
    backgroundColor: '#0052A2',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  modalOption: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 18,
    color: '#0052A2',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#eee',
  },
  cancelOption: {
    marginTop: 10,
    backgroundColor: '#f8f8f8',
  },
  cancelOptionText: {
    fontSize: 18,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  largeProfileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  examplePhotos: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  examplePhotoContainer: {
    position: 'relative',
  },
  examplePhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  photoStatus: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
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
    marginTop: 20,
  },
  photoTip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoTipText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  // Skills styles
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#0052A2',
  },
  skillText: {
    fontSize: 14,
    color: '#0052A2',
    marginRight: 4,
  },
  removeSkillButton: {
    marginLeft: 4,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 60,
  },
  skillsModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  cancelSkillsText: {
    padding: 4
  },
  saveSkillsText: {
    fontSize: 16,
    color: '#0052A2',
    fontWeight: '600',
  },
  skillsModalContent: {
    flex: 1,
    padding: 16,
  },
  skillsModalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  skillInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  skillInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginRight: 12,
  },
  addSkillButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0052A2',
  },
  addedSkillsSection: {
    marginBottom: 32,
  },
  addedSkillsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  suggestedSkillsSection: {
    marginBottom: 32,
  },
  suggestedSkillsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  suggestedSkillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  suggestedSkillText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
});  