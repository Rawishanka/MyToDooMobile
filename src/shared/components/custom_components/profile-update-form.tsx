import { useTheme } from '@/src/shared/theme';
import { BRAND_BLUE, BRAND_ORANGE, CARD_BG, CARD_TEXT, CARD_TEXT_MUTED, CARD_DIVIDER, CARD_CHIP_BG } from '@/src/shared/theme/brandColors';
// components/custom_components/profile-update-form.tsx
import { User } from '@/src/api/types/user';
import { UserProfile } from '@/src/api/user-profile-api';
import { useUpdateUserProfile } from '@/src/shared/hooks/useUserProfileApi';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from '@/src/shared/utils/responsive';
import AddSkillsModal from '@/src/shared/components/custom_components/add-skills-modal';
import { requestPhoneOtp, verifyPhoneOtp } from '@/src/api/contact-change-api';

export function formatToE164(input: string): string {
  if (!input) return '';
  let cleaned = input.trim().replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('04')) {
    cleaned = '+61' + cleaned.slice(1);
  } else if (/^4\d{8}$/.test(cleaned)) {
    cleaned = '+61' + cleaned;
  } else if (!cleaned.startsWith('+') && cleaned.startsWith('61')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
}

interface ProfileUpdateFormProps {
  onBack: () => void;
  userData: User | UserProfile | null;
}

export default function ProfileUpdateForm({ onBack, userData }: ProfileUpdateFormProps) {
  const { isDarkMode } = useTheme();
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
  const [notifyNewTask, setNotifyNewTask] = useState<boolean>(
    (userData as any)?.notifyNewTask ?? false
  );
  const [notifySkillMatch, setNotifySkillMatch] = useState<boolean>(
    (userData as any)?.notifySkillMatch ?? false
  );
  
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
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [newLanguage, setNewLanguage] = useState('');
  const [newQualification, setNewQualification] = useState('');
  const [newExperience, setNewExperience] = useState('');
  // Phone change with OTP states
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [newPhoneInput, setNewPhoneInput] = useState("");
  const [phoneOtpCode, setPhoneOtpCode] = useState("");
  const [phoneStep, setPhoneStep] = useState<"input" | "otp">("input");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneResendTimer, setPhoneResendTimer] = useState(0);

  const startResendTimer = () => {
    setPhoneResendTimer(60);
    const interval = setInterval(() => {
      setPhoneResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRequestPhoneOtp = async () => {
    const formatted = formatToE164(newPhoneInput);
    if (!formatted || formatted.length < 9) {
      setPhoneError("Please enter a valid phone number (e.g. +61400000000 or 0400000000)");
      return;
    }
    setPhoneLoading(true);
    setPhoneError(null);
    try {
      await requestPhoneOtp(formatted);
      setPhoneStep("otp");
      startResendTimer();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to send verification code. Please check the number and try again.";
      setPhoneError(msg);
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    const formatted = formatToE164(newPhoneInput);
    const trimmedOtp = phoneOtpCode.trim();
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setPhoneError("Please enter the 6-digit verification code");
      return;
    }
    setPhoneLoading(true);
    setPhoneError(null);
    try {
      await verifyPhoneOtp(formatted, trimmedOtp);
      setPhone(formatted);
      setShowPhoneModal(false);
      setPhoneStep("input");
      setNewPhoneInput("");
      setPhoneOtpCode("");
      Alert.alert("Success", "Your phone number has been successfully verified and updated!");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Invalid or expired verification code. Please try again.";
      setPhoneError(msg);
    } finally {
      setPhoneLoading(false);
    }
  };
  
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
        notifyNewTask,
        notifySkillMatch,
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
          <Ionicons name="arrow-back" size={24} color={CARD_TEXT} />
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
            <View style={styles.phoneLabelRow}>
              <Text style={styles.label}>Phone Number</Text>
              <TouchableOpacity
                style={styles.changePhoneBadge}
                activeOpacity={0.8}
                onPress={() => {
                  setPhoneStep('input');
                  setNewPhoneInput('');
                  setPhoneOtpCode('');
                  setPhoneError(null);
                  setShowPhoneModal(true);
                }}
              >
                <Ionicons name="create-outline" size={13} color="#003399" />
                <Text style={styles.changePhoneBadgeText}>Change</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={phone || 'No phone number added'}
              editable={false}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              placeholderTextColor="#999"
              maxLength={20}
            />
            <Text style={styles.phoneSecurityHint}>
              🔒 Protected by SMS verification for your security
            </Text>
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
          
          {/* What are you good at? — opens animated AddSkillsModal */}
          <View style={styles.skillGroup}>
            <Text style={styles.label}>What are you good at?</Text>

            {/* Selected skills preview chips */}
            {goodAt.length > 0 && (
              <View style={styles.skillsTagsContainer}>
                {goodAt.map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillTagText}>{skill}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Tap to open modal */}
            <TouchableOpacity
              style={styles.openSkillsBtn}
              onPress={() => setShowSkillsModal(true)}
              activeOpacity={0.75}
            >
              <Ionicons name="add-circle-outline" size={18} color="#003399" />
              <Text style={styles.openSkillsBtnText}>
                {goodAt.length === 0 ? 'Add Skills' : `Edit Skills (${goodAt.length})`}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#003399" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            {/* Add Skills Modal */}
            <AddSkillsModal
              visible={showSkillsModal}
              currentSkills={goodAt}
              onSave={(skills) => {
                setGoodAt(skills);
                setShowSkillsModal(false);
              }}
              onClose={() => setShowSkillsModal(false)}
            />
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
          
          {/* Notification Preferences */}
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          
          <View style={styles.notifCard}>
            {/* Register as a Tasker */}
            <View style={styles.notifRow}>
              <View style={styles.notifTextBlock}>
                <Text style={styles.notifLabel}>Register as a Tasker</Text>
                <Text style={styles.notifDesc}>Receive notifications when new tasks are posted on the platform.</Text>
              </View>
              <Switch
                value={notifyNewTask}
                onValueChange={(val) => {
                  setNotifyNewTask(val);
                  if (!val) setNotifySkillMatch(false);
                }}
                trackColor={{ false: '#ddd', true: BRAND_ORANGE }}
                thumbColor={notifyNewTask ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.notifDivider} />

            {/* Only notify tasks in skillset */}
            <View style={[styles.notifRow, !notifyNewTask && styles.notifRowDisabled]}>
              <View style={styles.notifTextBlock}>
                <Text style={[styles.notifLabel, !notifyNewTask && styles.notifLabelDisabled]}>Only notify tasks in my skillset</Text>
                <Text style={[styles.notifDesc, !notifyNewTask && styles.notifLabelDisabled]}>Filter notifications to tasks matching your skills only. You can still browse all tasks.</Text>
              </View>
              <Switch
                value={notifySkillMatch && notifyNewTask}
                onValueChange={(val) => { if (notifyNewTask) setNotifySkillMatch(val); }}
                disabled={!notifyNewTask}
                trackColor={{ false: '#ddd', true: BRAND_ORANGE }}
                thumbColor={(notifySkillMatch && notifyNewTask) ? '#fff' : '#f4f3f4'}
              />
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
    
      {/* 2026 Modern Phone Update & SMS OTP Modal */}
      <Modal
        visible={showPhoneModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          if (!phoneLoading) setShowPhoneModal(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.phoneModalOverlay}
        >
          <View style={[styles.phoneModalCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1 }]}>
            <View style={styles.phoneModalHeader}>
              <View style={[styles.phoneModalIconBg, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', borderWidth: 1 }]}>
                <Ionicons
                  name={phoneStep === 'input' ? 'call-outline' : 'shield-checkmark-outline'}
                  size={24}
                  color={isDarkMode ? '#60A5FA' : '#003399'}
                />
              </View>
              <Text style={[styles.phoneModalTitle, isDarkMode && { color: '#F8FAFC' }]}>
                {phoneStep === 'input' ? 'Update Phone Number' : 'Verify SMS Code'}
              </Text>
              <Text style={[styles.phoneModalSubtitle, isDarkMode && { color: '#94A3B8' }]}>
                {phoneStep === 'input'
                  ? 'Enter your new phone number to receive a 6-digit verification code.'
                  : `Enter the 6-digit verification code sent via SMS to ${newPhoneInput}.`}
              </Text>
            </View>

            {phoneError && (
              <View style={[
                styles.phoneErrorBanner,
                isDarkMode && { backgroundColor: '#450A0A', borderColor: '#7F1D1D' }
              ]}>
                <Ionicons name="alert-circle" size={16} color={isDarkMode ? "#F87171" : "#DC2626"} />
                <Text style={[styles.phoneErrorBannerText, isDarkMode && { color: '#FCA5A5' }]}>{phoneError}</Text>
              </View>
            )}

            {phoneStep === 'input' ? (
              <View style={styles.phoneStepBody}>
                <Text style={[styles.phoneFieldLabel, isDarkMode && { color: '#E2E8F0' }]}>New Phone Number</Text>
                <TextInput
                  style={[styles.phoneModalInput, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }]}
                  value={newPhoneInput}
                  onChangeText={setNewPhoneInput}
                  placeholder="+61 400 000 000"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  autoFocus={true}
                />
                <Text style={styles.phoneFieldNote}>
                  Include country code (e.g. +61 for Australia) or enter standard Australian mobile (04...).
                </Text>

                <View style={styles.phoneModalBtnRow}>
                  <TouchableOpacity
                    style={[styles.phoneModalCancelBtn, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', borderWidth: 1 }]}
                    onPress={() => setShowPhoneModal(false)}
                    disabled={phoneLoading}
                  >
                    <Text style={[styles.phoneModalCancelBtnText, isDarkMode && { color: '#94A3B8' }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.phoneModalSubmitBtn}
                    onPress={handleRequestPhoneOtp}
                    disabled={phoneLoading}
                  >
                    {phoneLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.phoneModalSubmitBtnText}>Send Code</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.phoneStepBody}>
                <Text style={[styles.phoneFieldLabel, isDarkMode && { color: '#E2E8F0' }]}>6-Digit Verification Code</Text>
                <TextInput
                  style={[styles.phoneOtpInput, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#60A5FA', color: '#F8FAFC' }]}
                  value={phoneOtpCode}
                  onChangeText={setPhoneOtpCode}
                  placeholder="000000"
                  placeholderTextColor="#CBD5E1"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus={true}
                />

                <View style={styles.phoneResendRow}>
                  {phoneResendTimer > 0 ? (
                    <Text style={styles.phoneResendTimerText}>
                      Resend code in {phoneResendTimer}s
                    </Text>
                  ) : (
                    <TouchableOpacity
                      onPress={handleRequestPhoneOtp}
                      disabled={phoneLoading}
                    >
                      <Text style={styles.phoneResendActionText}>Resend Code</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.phoneModalBtnRow}>
                  <TouchableOpacity
                    style={[styles.phoneModalCancelBtn, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', borderWidth: 1 }]}
                    onPress={() => setPhoneStep('input')}
                    disabled={phoneLoading}
                  >
                    <Text style={[styles.phoneModalCancelBtnText, isDarkMode && { color: '#94A3B8' }]}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.phoneModalSubmitBtn}
                    onPress={handleVerifyPhoneOtp}
                    disabled={phoneLoading}
                  >
                    {phoneLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.phoneModalSubmitBtnText}>Verify & Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
    borderBottomColor: BRAND_BLUE, backgroundColor: BRAND_BLUE,
},
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: CARD_TEXT,
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
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: RFValue(14),
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
    fontSize: RFValue(16),
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
    fontSize: RFValue(12),
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
    backgroundColor: BRAND_ORANGE,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
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
    fontSize: RFValue(20),
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: RFValue(15),
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  modalSubMessage: {
    fontSize: RFValue(13),
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
    fontSize: RFValue(15),
    fontWeight: '600',
    color: '#666',
  },
  modalSendButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#003399',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonDisabled: {
    backgroundColor: '#ccc',
  },
  modalSendText: {
    fontSize: RFValue(15),
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
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#856404',
  },
  backToProfileButton: {
    backgroundColor: '#003399',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  backToProfileText: {
    fontSize: RFValue(15),
    fontWeight: '600',
    color: '#fff',
  },
  modalFooterText: {
    fontSize: RFValue(12),
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
    fontSize: RFValue(14),
    color: '#003399',
  },
  // "Add Skills" / "Edit Skills" tap row for goodAt
  openSkillsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#003399',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 8,
    backgroundColor: '#f0f6ff',
  },
  openSkillsBtnText: {
    fontSize: RFValue(15),
    color: '#003399',
    fontWeight: '600',
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
    fontSize: RFValue(15),
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    backgroundColor: '#003399',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: RFValue(15),
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
    backgroundColor: '#003399',
    borderColor: '#003399',
  },
  transportOptionText: {
    fontSize: RFValue(14),
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
    fontSize: RFValue(12),
    color: '#dc3545',
    marginTop: 4,
  },
  // Notification Preferences Styles
  notifCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CARD_DIVIDER,
    marginBottom: 24,
    overflow: 'hidden',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  notifRowDisabled: {
    opacity: 0.45,
  },
  notifTextBlock: {
    flex: 1,
  },
  notifLabel: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: CARD_TEXT,
    marginBottom: 3,
  },
  notifLabelDisabled: {
    color: CARD_TEXT_MUTED,
  },
  notifDesc: {
    fontSize: RFValue(12),
    color: CARD_TEXT_MUTED,
    lineHeight: 17,
  },
  notifDivider: {
    height: 1,
    backgroundColor: CARD_DIVIDER,
    marginHorizontal: 16,
  },
  phoneLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  changePhoneBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  changePhoneBadgeText: {
    fontSize: RFValue(11.5),
    fontWeight: "700",
    color: "#003399",
  },
  phoneSecurityHint: {
    fontSize: RFValue(11.5),
    color: "#059669",
    marginTop: 4,
    fontWeight: "500",
  },
  phoneModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  phoneModalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  phoneModalHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  phoneModalIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  phoneModalTitle: {
    fontSize: RFValue(18),
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  phoneModalSubtitle: {
    fontSize: RFValue(13),
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },
  phoneErrorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  phoneErrorBannerText: {
    flex: 1,
    fontSize: RFValue(12),
    color: "#DC2626",
    fontWeight: "500",
  },
  phoneStepBody: {
    width: "100%",
  },
  phoneFieldLabel: {
    fontSize: RFValue(12.5),
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },
  phoneModalInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: RFValue(16),
    color: "#0F172A",
    fontWeight: "600",
  },
  phoneOtpInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#003399",
    borderRadius: 14,
    paddingVertical: 14,
    fontSize: RFValue(24),
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: 10,
  },
  phoneFieldNote: {
    fontSize: RFValue(11.5),
    color: "#64748B",
    marginTop: 6,
    lineHeight: 16,
  },
  phoneResendRow: {
    alignItems: "center",
    marginVertical: 12,
  },
  phoneResendTimerText: {
    fontSize: RFValue(12.5),
    color: "#94A3B8",
    fontWeight: "500",
  },
  phoneResendActionText: {
    fontSize: RFValue(13),
    color: "#003399",
    fontWeight: "700",
  },
  phoneModalBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  phoneModalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  phoneModalCancelBtnText: {
    fontSize: RFValue(14),
    fontWeight: "600",
    color: "#64748B",
  },
  phoneModalSubmitBtn: {
    flex: 1.6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#003399",
    alignItems: "center",
    justifyContent: "center",
  },
  phoneModalSubmitBtnText: {
    fontSize: RFValue(14),
    fontWeight: "700",
    color: "#FFFFFF",
  },
});