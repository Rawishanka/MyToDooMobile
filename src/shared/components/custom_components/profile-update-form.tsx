// components/custom_components/profile-update-form.tsx
import { User } from '@/src/api/types/user';
import { UserProfile } from '@/src/api/user-profile-api';
import { useUpdateUserProfile } from '@/src/shared/hooks/useUserProfileApi';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProfileUpdateFormProps {
  onBack: () => void;
  userData: User | UserProfile | null;
}

export default function ProfileUpdateForm({ onBack, userData }: ProfileUpdateFormProps) {
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState(userData?.firstName || '');
  const [lastName, setLastName] = useState(userData?.lastName || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  
  // Extract existing location data - handle BOTH string (with duplicates) and object formats
  const getLocationString = () => {
    if (!userData?.location) return '';
    
    // If location is a STRING (from backend), deduplicate it
    if (typeof userData.location === 'string') {
      const locationStr = userData.location.trim();
      if (!locationStr) return '';
      
      // Split by comma, trim each part, remove duplicates (case-insensitive)
      const parts = locationStr.split(',').map(p => p.trim()).filter(Boolean);
      const seen = new Set<string>();
      const deduplicated: string[] = [];
      
      for (const part of parts) {
        const normalized = part.toLowerCase();
        if (!seen.has(normalized)) {
          seen.add(normalized);
          deduplicated.push(part); // Keep original capitalization
        }
      }
      
      return deduplicated.join(', ');
    }
    
    // If location is an OBJECT, build string while avoiding duplicates
    const loc = userData.location as any;
    const parts = [];
    
    const isValidValue = (value: any) => {
      return value && 
             value !== 'Not specified' && 
             value !== 'not specified' && 
             typeof value === 'string' &&
             value.trim().length > 0;
    };
    
    // Normalize values to avoid duplicates
    const normalizeValue = (value: string) => value.trim().toLowerCase();
    const addedValues = new Set<string>();
    
    // Priority: suburb > city > region/state > country
    if (isValidValue(loc.suburb)) {
      const normalized = normalizeValue(loc.suburb);
      parts.push(loc.suburb);
      addedValues.add(normalized);
    }
    
    if (isValidValue(loc.city) && !addedValues.has(normalizeValue(loc.city))) {
      const normalized = normalizeValue(loc.city);
      parts.push(loc.city);
      addedValues.add(normalized);
    }
    
    if (isValidValue(loc.region) && !addedValues.has(normalizeValue(loc.region))) {
      parts.push(loc.region);
    } else if (isValidValue(loc.state) && !addedValues.has(normalizeValue(loc.state))) {
      parts.push(loc.state);
    }
    
    if (isValidValue(loc.country) && !addedValues.has(normalizeValue(loc.country))) {
      parts.push(loc.country);
    }
    
    return parts.join(', ');
  };
  
  const [location, setLocation] = useState(getLocationString());
  const [bio, setBio] = useState(userData?.bio || '');
  
  // Skills state
  const getSkillsArray = (field: 'goodAt' | 'transport' | 'languages' | 'qualifications' | 'experience') => {
    if (!userData?.skills) return [];
    if (typeof userData.skills === 'object' && !Array.isArray(userData.skills)) {
      return userData.skills[field] || [];
    }
    return [];
  };
  
  const [goodAt, setGoodAt] = useState<string[]>(getSkillsArray('goodAt'));
  const [transport, setTransport] = useState<string[]>(getSkillsArray('transport'));
  const [languages, setLanguages] = useState<string[]>(getSkillsArray('languages'));
  const [qualifications, setQualifications] = useState<string[]>(getSkillsArray('qualifications'));
  const [experience, setExperience] = useState<string[]>(getSkillsArray('experience'));
  
  // Input fields for adding new items
  const [newGoodAt, setNewGoodAt] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newQualification, setNewQualification] = useState('');
  const [newExperience, setNewExperience] = useState('');
  
  const updateProfile = useUpdateUserProfile();

  const handleSaveProfile = async () => {
    console.log('💾 [Profile Update] Save Profile clicked');

    // ── Client-side validation ──────────────────────────────────
    if (firstName.trim().length < 2) {
      Alert.alert('Validation Error', 'First name must be at least 2 characters.');
      return;
    }
    if (lastName.trim().length < 2) {
      Alert.alert('Validation Error', 'Last name must be at least 2 characters.');
      return;
    }
    if (bio.trim().length > 300) {
      Alert.alert('Validation Error', `Bio must be 300 characters or less (currently ${bio.trim().length}).`);
      return;
    }
    // ────────────────────────────────────────────────────────────

    try {
      const profileData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        location: location.trim(),
        bio: bio.trim(),
        skills: {
          goodAt,
          transport,
          languages,
          qualifications,
          experience,
        },
      };

      console.log("📤 [Profile Update] Sending profile data:", JSON.stringify(profileData, null, 2));
      
      await updateProfile.mutateAsync(profileData);

      console.log("✅ [Profile Update] Profile updated successfully!");
      
      Alert.alert(
        '✓ Success',
        'Profile updated successfully!',
        [{ text: 'OK', onPress: onBack }]
      );
    } catch (error: any) {
      console.error('❌ [Profile Update] Error updating profile:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });

      // ── Extract backend validation errors ───────────────────────
      const responseData = error?.response?.data;
      let errorMessage = 'Failed to update profile. Please try again.';

      if (responseData) {
        if (responseData.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
          // List all field-level validation errors from backend
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
      // ────────────────────────────────────────────────────────────

      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    }
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.contentWrapper}>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              autoCapitalize="words"
              placeholderTextColor="#999"
              maxLength={50}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              autoCapitalize="words"
              placeholderTextColor="#999"
              maxLength={50}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={phone}
              editable={false}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              placeholderTextColor="#999"
              maxLength={20}
            />
            <Text style={styles.webOnlyMessage}>📱 Phone number can only be changed from the web</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Sydney, NSW, Australia"
              autoCapitalize="words"
              placeholderTextColor="#999"
              maxLength={100}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea, bio.length > 280 && styles.inputNearLimit]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell others about yourself"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999"
              maxLength={300}
            />
            <Text style={[styles.charCount, bio.length > 280 && styles.charCountWarning]}>
              {bio.length}/300
            </Text>
          </View>
          
          {/* Skills Section */}
          <Text style={styles.sectionTitle}>Skills</Text>
          
          {/* What are you good at? */}
          <View style={styles.skillGroup}>
            <Text style={styles.label}>What are you good at?</Text>
            <View style={styles.skillsTagsContainer}>
              {goodAt.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{skill}</Text>
                  <TouchableOpacity onPress={() => setGoodAt(goodAt.filter((_, i) => i !== index))}>
                    <Ionicons name="close-circle" size={18} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.addSkillContainer}>
              <TextInput
                style={styles.addSkillInput}
                value={newGoodAt}
                onChangeText={setNewGoodAt}
                placeholder="Add a skill..."
                placeholderTextColor="#999"
                maxLength={50}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  if (newGoodAt.trim() && !goodAt.includes(newGoodAt.trim())) {
                    setGoodAt([...goodAt, newGoodAt.trim()]);
                    setNewGoodAt('');
                  }
                }}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* How do you get around? */}
          <View style={styles.skillGroup}>
            <Text style={styles.label}>How do you get around?</Text>
            <View style={styles.transportOptions}>
              {['Bicycle', 'Car', 'Online', 'Scooter', 'Truck', 'Walk'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.transportOption,
                    transport.includes(option) && styles.transportOptionSelected
                  ]}
                  onPress={() => {
                    if (transport.includes(option)) {
                      setTransport(transport.filter(t => t !== option));
                    } else {
                      setTransport([...transport, option]);
                    }
                  }}
                >
                  <Text style={[
                    styles.transportOptionText,
                    transport.includes(option) && styles.transportOptionTextSelected
                  ]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Languages */}
          <View style={styles.skillGroup}>
            <Text style={styles.label}>What languages can you speak/write?</Text>
            <View style={styles.skillsTagsContainer}>
              {languages.map((lang, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{lang}</Text>
                  <TouchableOpacity onPress={() => setLanguages(languages.filter((_, i) => i !== index))}>
                    <Ionicons name="close-circle" size={18} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.addSkillContainer}>
              <TextInput
                style={styles.addSkillInput}
                value={newLanguage}
                onChangeText={setNewLanguage}
                placeholder="Add a language..."
                placeholderTextColor="#999"
                maxLength={50}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
                    setLanguages([...languages, newLanguage.trim()]);
                    setNewLanguage('');
                  }
                }}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Qualifications */}
          <View style={styles.skillGroup}>
            <Text style={styles.label}>What qualifications do you have?</Text>
            <View style={styles.skillsTagsContainer}>
              {qualifications.map((qual, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{qual}</Text>
                  <TouchableOpacity onPress={() => setQualifications(qualifications.filter((_, i) => i !== index))}>
                    <Ionicons name="close-circle" size={18} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.addSkillContainer}>
              <TextInput
                style={styles.addSkillInput}
                value={newQualification}
                onChangeText={setNewQualification}
                placeholder="Add a qualification..."
                placeholderTextColor="#999"
                maxLength={100}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  if (newQualification.trim() && !qualifications.includes(newQualification.trim())) {
                    setQualifications([...qualifications, newQualification.trim()]);
                    setNewQualification('');
                  }
                }}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Work Experience */}
          <View style={styles.skillGroup}>
            <Text style={styles.label}>What's your work experience?</Text>
            <View style={styles.skillsTagsContainer}>
              {experience.map((exp, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{exp}</Text>
                  <TouchableOpacity onPress={() => setExperience(experience.filter((_, i) => i !== index))}>
                    <Ionicons name="close-circle" size={18} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.addSkillContainer}>
              <TextInput
                style={styles.addSkillInput}
                value={newExperience}
                onChangeText={setNewExperience}
                placeholder="Add work experience..."
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  if (newExperience.trim() && !experience.includes(newExperience.trim())) {
                    setExperience([...experience, newExperience.trim()]);
                    setNewExperience('');
                  }
                }}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Extra padding to ensure fields are visible above keyboard */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
        </View>
      </TouchableWithoutFeedback>
      
      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, updateProfile.isPending && styles.saveButtonDisabled]}
          onPress={handleSaveProfile}
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 34, // Same as back button to center the title
  },
  content: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  inputNearLimit: {
    borderColor: '#e67e22',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  charCountWarning: {
    color: '#e67e22',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#0052A2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  modalSubMessage: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  modalSendButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#0052A2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonDisabled: {
    backgroundColor: '#ccc',
  },
  modalSendText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  pendingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3e5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff9800',
    marginRight: 8,
  },
  pendingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
  },
  backToProfileButton: {
    backgroundColor: '#0052A2',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  backToProfileText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  modalFooterText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Skills Styles
  skillGroup: {
    marginBottom: 24,
  },
  skillsTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  skillTagText: {
    fontSize: 14,
    color: '#0052A2',
  },
  addSkillContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  addSkillInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    backgroundColor: '#0052A2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  transportOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  transportOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  transportOptionSelected: {
    backgroundColor: '#0052A2',
    borderColor: '#0052A2',
  },
  transportOptionText: {
    fontSize: 14,
    color: '#333',
  },
  transportOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#888',
  },
  webOnlyMessage: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
  },
});