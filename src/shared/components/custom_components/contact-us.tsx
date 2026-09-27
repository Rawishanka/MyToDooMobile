import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import AppLoader from '@/src/shared/components/AppLoader';
import {
    getSupportCategories,
    getSupportStatus,
    submitSupportRequest,
    SupportStatusData
} from '@/src/api/help-support-api';
import FAQScreen from '@/src/shared/components/custom_components/faq-screen';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';
import { BRAND_BLUE, BRAND_ORANGE } from '@/src/shared/theme/brandColors';
import { BlueBackdrop, IconChip, LightHeader } from '@/src/shared/components/custom_components/lightCard';

type ContactUsProps = { 
  onBack: () => void;
};

const ContactUs = ({ onBack }: ContactUsProps) => {
  const { isDarkMode } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [supportToken, setSupportToken] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  
  // Token lookup state
  const [tokenInput, setTokenInput] = useState('');
  const [isCheckingToken, setIsCheckingToken] = useState(false);
  
  // Status modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusData, setStatusData] = useState<SupportStatusData | null>(null);
  
  // FAQ screen state
  const [showFAQ, setShowFAQ] = useState(false);

  // Custom category for "Other" option
  const [customCategory, setCustomCategory] = useState('');

  // Category icons mapping
  const categoryIcons: Record<string, string> = {
    'General Inquiry': 'help-circle-outline',
    'Task Related Issues': 'briefcase-outline',
    'Payment & Billing': 'card-outline',
    'Account Issues': 'person-outline',
    'Account Settings': 'settings-outline',
    'Technical Support': 'bug-outline',
    'Report a Problem': 'flag-outline',
    'Other': 'ellipsis-horizontal-outline',
  };

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await getSupportCategories();
      if (response.success && response.categories.length > 0) {
        setCategories(response.categories);
      } else {
        // Use default categories
        setCategories([
          'General Inquiry',
          'Task Related Issues',
          'Payment & Billing',
          'Account Issues',
          'Technical Support',
          'Report a Problem',
          'Other'
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Use default categories
      setCategories([
        'General Inquiry',
        'Task Related Issues',
        'Payment & Billing',
        'Account Issues',
        'Technical Support',
        'Report a Problem',
        'Other'
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const validateEmail = (emailToValidate: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToValidate);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
    if (category !== 'Other') {
      setCustomCategory('');
    }
  };

  const handleSendMessage = async () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter your name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Required Field', 'Please enter your email address');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Required Field', 'Please select a category');
      return;
    }
    if (selectedCategory === 'Other' && !customCategory.trim()) {
      Alert.alert('Required Field', 'Please specify your category');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Required Field', 'Please enter a subject');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Required Field', 'Please enter your message');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await submitSupportRequest({
        fullName: name.trim(),
        email: email.trim(),
        category: selectedCategory === 'Other' && customCategory.trim() ? customCategory.trim() : selectedCategory,
        subject: subject.trim(),
        message: message.trim()
      });

      if (response.success) {
        setSupportToken(response.supportToken);
        setSubmittedEmail(email.trim());
        setShowSuccessModal(true);
        
        // Clear form
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setSelectedCategory('');
        setCustomCategory('');
      }
    } catch (error: any) {
      console.error('Failed to submit support request:', error);
      Alert.alert(
        'Submission Failed',
        error?.response?.data?.message || 'Unable to submit your request. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckStatus = async () => {
    const token = tokenInput.trim().toUpperCase();
    
    if (!token) {
      Alert.alert('Required', 'Please enter a support token');
      return;
    }

    // Basic validation for token format (SUP-XXXXX-XXXXXXXX)
    if (!token.startsWith('SUP-') || token.length < 10) {
      Alert.alert('Invalid Token', 'Please enter a valid support token (e.g., SUP-MKC96L84-1DB89E2D)');
      return;
    }

    try {
      setIsCheckingToken(true);
      
      const response = await getSupportStatus(token);
      
      if (response.success && response.data) {
        setStatusData(response.data);
        setShowStatusModal(true);
        setTokenInput('');
      }
    } catch (error: any) {
      console.error('Failed to check status:', error);
      
      if (error?.response?.status === 404) {
        Alert.alert(
          'Not Found',
          'No support request found with this token. Please check the token and try again.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          'Unable to check the status. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsCheckingToken(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'in-progress':
        return '#003399';
      case 'resolved':
        return '#28a745';
      case 'closed':
        return '#6c757d';
      default:
        return '#666';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'in-progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const contactMethods = [
    {
      icon: 'mail-outline',
      title: 'Email Support',
      value: 'support@mytodoo.com',
      action: () => Linking.openURL('mailto:support@mytodoo.com'),
    },
    {
      icon: 'time-outline',
      title: 'Business Hours',
      value: 'Mon-Fri, 9AM-6PM AEST',
      action: null,
    },
  ];

  // Success Modal Component
  const SuccessModal = () => (
    <Modal
      visible={showSuccessModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSuccessModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.successModalContent, isDarkMode && { backgroundColor: '#1E293B' }]}>
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark" size={40} color="#fff" />
          </View>
          
          <Text style={[styles.successTitle, isDarkMode && { color: '#F8FAFC' }]}>Message Sent Successfully!</Text>
          <Text style={[styles.successSubtitle, isDarkMode && { color: '#94A3B8' }]}>
            Your support request has been submitted to support@mytodoo.com
          </Text>

          {/* Support Token Card */}
          <View style={[styles.tokenCard, isDarkMode && { backgroundColor: '#0F172A' }]}>
            <View style={styles.tokenHeader}>
              <Ionicons name="ticket-outline" size={20} color="#FFFFFF" />
              <Text style={styles.tokenLabel}>Support Token</Text>
            </View>
            <Text style={[styles.tokenValue, isDarkMode && { color: '#F8FAFC' }]}>{supportToken}</Text>
            <Text style={[styles.tokenHint, isDarkMode && { color: '#94A3B8' }]}>Save this token to track your request</Text>
          </View>

          {/* Email Confirmation */}
          <View style={[styles.emailConfirmation, isDarkMode && { backgroundColor: '#064E3B' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#7ED957" />
            <Text style={[styles.emailConfirmationText, isDarkMode && { color: '#A7F3D0' }]}>
              We'll respond to <Text style={styles.emailBold}>{submittedEmail}</Text> as soon as possible
            </Text>
          </View>

          {/* Response Time */}
          <View style={styles.responseTimeContainer}>
            <Ionicons name="time-outline" size={18} color="rgba(255,255,255,0.7)" />
            <Text style={[styles.responseTimeText, isDarkMode && { color: '#94A3B8' }]}>
              We typically respond within 24 hours during business days
            </Text>
          </View>

          {/* Done Button */}
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => {
              setShowSuccessModal(false);
              // Auto-fill the token in the search box
              setTokenInput(supportToken);
            }}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Status Modal Component
  const StatusModal = () => (
    <Modal
      visible={showStatusModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowStatusModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.statusModalContent, isDarkMode && { backgroundColor: '#1E293B' }]}>
          {/* Header */}
          <View style={styles.statusModalHeader}>
            <Text style={[styles.statusModalTitle, isDarkMode && { color: '#F8FAFC' }]}>Support Request Details</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowStatusModal(false)}
            >
              <Ionicons name="close" size={24} color={'#F8FAFC'} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.statusModalScroll}
            showsVerticalScrollIndicator={false}
          >
            {statusData && (
              <>
                {/* Token */}
                <View style={styles.statusSection}>
                  <View style={styles.statusSectionHeader}>
                    <Ionicons name="ticket-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.statusSectionLabel}>Support Token</Text>
                  </View>
                  <Text style={[styles.statusTokenValue, isDarkMode && { color: '#F8FAFC' }]}>{statusData.supportToken}</Text>
                </View>

                {/* Status Badge */}
                <View style={styles.statusSection}>
                  <View style={styles.statusSectionHeader}>
                    <Ionicons name="flag-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.statusSectionLabel}>Status</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(statusData.status) + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(statusData.status) }]} />
                    <Text style={[styles.statusBadgeText, { color: getStatusColor(statusData.status) }]}>
                      {getStatusLabel(statusData.status)}
                    </Text>
                  </View>
                </View>

                {/* Category */}
                <View style={styles.statusSection}>
                  <View style={styles.statusSectionHeader}>
                    <Ionicons name="folder-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.statusSectionLabel}>Category</Text>
                  </View>
                  <Text style={[styles.statusValue, isDarkMode && { color: '#E2E8F0' }]}>{statusData.category}</Text>
                </View>

                {/* Subject */}
                <View style={styles.statusSection}>
                  <View style={styles.statusSectionHeader}>
                    <Ionicons name="text-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.statusSectionLabel}>Subject</Text>
                  </View>
                  <Text style={[styles.statusValue, isDarkMode && { color: '#E2E8F0' }]}>{statusData.subject}</Text>
                </View>

                {/* Your Message */}
                {statusData.message && (
                  <View style={styles.statusSection}>
                    <View style={styles.statusSectionHeader}>
                      <Ionicons name="chatbubble-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.statusSectionLabel}>Your Message</Text>
                    </View>
                    <View style={[styles.messageBox, isDarkMode && { backgroundColor: '#0F172A', borderLeftColor: '#334155' }]}>
                      <Text style={[styles.messageText, isDarkMode && { color: '#E2E8F0' }]}>{statusData.message}</Text>
                    </View>
                  </View>
                )}

                {/* Admin Response */}
                {statusData.adminResponse && (
                  <View style={styles.statusSection}>
                    <View style={styles.statusSectionHeader}>
                      <Ionicons name="chatbubbles" size={18} color="#7ED957" />
                      <Text style={[styles.statusSectionLabel, { color: '#7ED957' }]}>Support Response</Text>
                    </View>
                    <View style={styles.responseBox}>
                      <Text style={styles.responseText}>{statusData.adminResponse}</Text>
                      {statusData.responseAt && (
                        <Text style={styles.responseTime}>
                          Responded on {formatDate(statusData.responseAt)}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Dates */}
                <View style={styles.statusSection}>
                  <View style={styles.statusSectionHeader}>
                    <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.statusSectionLabel}>Submitted</Text>
                  </View>
                  <Text style={[styles.statusValue, isDarkMode && { color: '#E2E8F0' }]}>{formatDate(statusData.createdAt)}</Text>
                </View>

                {statusData.resolvedAt && (
                  <View style={styles.statusSection}>
                    <View style={styles.statusSectionHeader}>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#7ED957" />
                      <Text style={styles.statusSectionLabel}>Resolved</Text>
                    </View>
                    <Text style={[styles.statusValue, isDarkMode && { color: '#E2E8F0' }]}>{formatDate(statusData.resolvedAt)}</Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.statusCloseButton}
            onPress={() => setShowStatusModal(false)}
          >
            <Text style={styles.statusCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <BlueBackdrop />
      <StatusBar barStyle="light-content" backgroundColor={isDarkMode ? "#0B1120" : BRAND_BLUE} />
      
      <LightHeader title="Contact Us" onBack={onBack} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            style={styles.content} 
            contentContainerStyle={styles.contentInner}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Quick Contact Methods */}
            <View style={styles.quickContactSection}>
              {contactMethods.map((method, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.contactMethodCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
                  onPress={method.action ? method.action : undefined}
                  disabled={!method.action}
                  activeOpacity={method.action ? 0.7 : 1}
                >
                  <IconChip name={method.icon as any} style={{ marginRight: 12 }} />
                  <View style={styles.contactMethodInfo}>
                    <Text style={[styles.contactMethodTitle, isDarkMode && { color: '#F8FAFC' }]}>{method.title}</Text>
                    <Text style={[styles.contactMethodValue, isDarkMode && { color: '#38BDF8' }]} numberOfLines={1}>{method.value}</Text>
                  </View>
                  {method.action && (
                    <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#94A3B8" : "rgba(255,255,255,0.6)"} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, isDarkMode && { backgroundColor: '#334155' }]} />
              <Text style={[styles.dividerText, isDarkMode && { color: '#94A3B8' }]}>OR SEND US A MESSAGE</Text>
              <View style={[styles.dividerLine, isDarkMode && { backgroundColor: '#334155' }]} />
            </View>

            {/* Contact Form */}
            <View style={[styles.formSection, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>Send Us a Message</Text>
              
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>Your Name <Text style={{ color: '#FCA5A5' }}>*</Text></Text>
                <View style={[styles.inputContainer, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                  <Ionicons name="person-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, isDarkMode && { color: '#F8FAFC' }]}
                    value={name}
                    onChangeText={(text) => {
                      // Allow only letters, spaces, hyphens and apostrophes
                      const cleaned = text.replace(/[^a-zA-Z\s'\-]/g, '');
                      setName(cleaned);
                    }}
                    placeholder="Enter your full name"
                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                    autoCapitalize="words"
                    maxLength={80}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>Email Address <Text style={{ color: '#FCA5A5' }}>*</Text></Text>
                <View style={[styles.inputContainer, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                  <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, isDarkMode && { color: '#F8FAFC' }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your.email@example.com"
                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Category Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>Category <Text style={{ color: '#FCA5A5' }}>*</Text></Text>
                <TouchableOpacity 
                  style={[styles.dropdownButton, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}
                  onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dropdownContent}>
                    <Ionicons 
                      name={(selectedCategory ? categoryIcons[selectedCategory] : 'help-circle-outline') as any} 
                      size={20} 
                      color={selectedCategory ? (isDarkMode ? '#38BDF8' : '#003399') : '#94A3B8'} 
                      style={styles.inputIcon} 
                    />
                    <Text style={[styles.dropdownText, selectedCategory && styles.dropdownTextSelected, selectedCategory && isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>
                      {selectedCategory || 'Select a category'}
                    </Text>
                  </View>
                  <Ionicons 
                    name={showCategoryDropdown ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#94A3B8" 
                  />
                </TouchableOpacity>
                
                {showCategoryDropdown && (
                  <View style={[styles.dropdownMenu, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                    {loadingCategories ? (
                      <View style={styles.loadingContainer}>
                        <AppLoader size={22} color={isDarkMode ? '#38BDF8' : '#003399'} />
                        <Text style={[styles.loadingText, isDarkMode && { color: '#94A3B8' }]}>Loading categories...</Text>
                      </View>
                    ) : (
                      categories.map((category, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[styles.dropdownItem, isDarkMode && { borderBottomColor: '#334155' }]}
                          onPress={() => handleCategorySelect(category)}
                        >
                          <Ionicons 
                            name={(categoryIcons[category] || 'help-circle-outline') as any} 
                            size={20} 
                            color={isDarkMode ? '#38BDF8' : '#003399'} 
                          />
                          <Text style={[styles.dropdownItemText, isDarkMode && { color: '#F8FAFC' }]}>{category}</Text>
                          {selectedCategory === category && (
                            <Ionicons name="checkmark" size={20} color={isDarkMode ? '#38BDF8' : '#003399'} />
                          )}
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}

                {/* Custom category input when "Other" is selected */}
                {selectedCategory === 'Other' && (
                  <View style={styles.customCategoryContainer}>
                    <View style={[styles.inputContainer, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                      <Ionicons name="create-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, isDarkMode && { color: '#F8FAFC' }]}
                        value={customCategory}
                        onChangeText={setCustomCategory}
                        placeholder="Please specify your category"
                        placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                        maxLength={100}
                        autoFocus
                      />
                    </View>
                  </View>
                )}
              </View>

              {/* Subject Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>Subject <Text style={{ color: '#FCA5A5' }}>*</Text></Text>
                <View style={[styles.inputContainer, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                  <Ionicons name="text-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, isDarkMode && { color: '#F8FAFC' }]}
                    value={subject}
                    onChangeText={setSubject}
                    placeholder="Brief description of your issue"
                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                    maxLength={200}
                  />
                </View>
              </View>

              {/* Message Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDarkMode && { color: '#F8FAFC' }]}>Message <Text style={{ color: '#FCA5A5' }}>*</Text></Text>
                <View style={[styles.inputContainer, styles.messageInputContainer, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                  <TextInput
                    style={[styles.input, styles.messageInput, isDarkMode && { color: '#F8FAFC' }]}
                    value={message}
                    onChangeText={(text) => setMessage(text.slice(0, 1000))}
                    placeholder="Please provide detailed information about your inquiry..."
                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                  />
                </View>
                <Text style={[styles.charCount, isDarkMode && { color: '#94A3B8' }]}>{message.length} / 1000 characters</Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSendMessage}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <AppLoader color="#fff" size={22} />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Send Message</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Info Note */}
              <View style={[styles.infoBox, isDarkMode && { backgroundColor: '#0F172A' }]}>
                <Ionicons name="information-circle" size={20} color={isDarkMode ? "#38BDF8" : "#FFFFFF"} />
                <Text style={[styles.infoText, isDarkMode && { color: '#CBD5E1' }]}>
                  We typically respond within 24 hours during business days
                </Text>
              </View>
            </View>

            {/* Token Lookup Section */}
            <View style={[styles.tokenLookupSection, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              <Text style={[styles.tokenLookupTitle, isDarkMode && { color: '#F8FAFC' }]}>Track Your Request</Text>
              <Text style={[styles.tokenLookupSubtitle, isDarkMode && { color: '#94A3B8' }]}>
                Enter your support token to check the status of your request
              </Text>
              
              <View style={styles.tokenInputRow}>
                <View style={[styles.tokenInputContainer, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                  <Ionicons name="ticket-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.tokenInput, isDarkMode && { color: '#F8FAFC' }]}
                    value={tokenInput}
                    onChangeText={setTokenInput}
                    placeholder="SUP-XXXXXX-XXXXXXXX"
                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.checkButton, isCheckingToken && styles.checkButtonDisabled]}
                  onPress={handleCheckStatus}
                  disabled={isCheckingToken}
                >
                  {isCheckingToken ? (
                    <AppLoader size={22} color="#fff" />
                  ) : (
                    <Ionicons name="search" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* FAQ Link */}
            <View style={[styles.faqSection, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              <Text style={[styles.faqTitle, isDarkMode && { color: '#F8FAFC' }]}>Looking for quick answers?</Text>
              <Text style={[styles.faqSubtitle, isDarkMode && { color: '#94A3B8' }]}>
                Check out our FAQ section for instant solutions to common questions
              </Text>
              <TouchableOpacity style={[styles.faqButton, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#38BDF8' }]} onPress={() => setShowFAQ(true)}>
                <Ionicons name="help-circle-outline" size={20} color={isDarkMode ? '#38BDF8' : '#FFFFFF'} />
                <Text style={[styles.faqButtonText, isDarkMode && { color: '#38BDF8' }]}>View FAQ</Text>
                <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#38BDF8' : '#FFFFFF'} />
              </TouchableOpacity>
            </View>

            {/* Bottom Spacing */}
            <View style={{ height: 40 }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Modals */}
      <SuccessModal />
      <StatusModal />

      {/* FAQ Screen */}
      {showFAQ && (
        <Modal visible={showFAQ} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={{ flex: 1, backgroundColor: '#003399' }}>
            <FAQScreen visible={true} onClose={() => setShowFAQ(false)} />
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003399',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  quickContactSection: {
    marginBottom: 2,
  },
  contactMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#00114D',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
  contactMethodInfo: {
    flex: 1,
    minWidth: 0,
  },
  contactMethodTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  contactMethodValue: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    marginHorizontal: 14,
    letterSpacing: 0.8,
  },
  formSection: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#00114D',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: RFValue(15),
    color: '#0F172A',
    padding: 0,
  },
  messageInputContainer: {
    alignItems: 'flex-start',
    minHeight: 140,
    paddingVertical: 12,
  },
  messageInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: RFValue(12),
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
    textAlign: 'right',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 52,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownText: {
    fontSize: RFValue(15),
    color: '#94A3B8',
    flex: 1,
  },
  dropdownTextSelected: {
    color: '#0F172A',
    fontWeight: '600',
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    shadowColor: '#00114D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF4',
  },
  dropdownItemText: {
    flex: 1,
    fontSize: RFValue(15),
    color: '#0F172A',
    marginLeft: 12,
  },
  customCategoryContainer: {
    marginTop: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: RFValue(14),
    color: '#64748B',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_ORANGE,
    height: 52,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: BRAND_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.55,
    shadowOpacity: 0,
  },
  submitButtonText: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: RFValue(13),
    color: '#FFFFFF',
    marginLeft: 10,
    lineHeight: 18,
  },
  // Token Lookup Section
  tokenLookupSection: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#00114D',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
  tokenLookupTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  tokenLookupSubtitle: {
    fontSize: RFValue(13),
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 14,
  },
  tokenInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginRight: 10,
  },
  tokenInput: {
    flex: 1,
    fontSize: RFValue(15),
    color: '#0F172A',
    padding: 0,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  checkButton: {
    backgroundColor: BRAND_ORANGE,
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonDisabled: {
    opacity: 0.55,
  },
  // FAQ Section
  faqSection: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#00114D',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    alignItems: 'center',
  },
  faqTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  faqSubtitle: {
    fontSize: RFValue(13),
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  faqButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  faqButtonText: {
    fontSize: RFValue(15),
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
    marginRight: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 12, 48, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Success Modal
  successModalContent: {
    backgroundColor: '#003399',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: RFValue(22),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  tokenCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b35',
    marginBottom: 16,
  },
  tokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tokenLabel: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginLeft: 8,
  },
  tokenValue: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  tokenHint: {
    fontSize: RFValue(12),
    color: 'rgba(255,255,255,0.65)',
    fontStyle: 'italic',
  },
  emailConfirmation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(126,217,87,0.18)',
    padding: 12,
    borderRadius: 10,
    width: '100%',
    marginBottom: 12,
  },
  emailConfirmationText: {
    flex: 1,
    fontSize: RFValue(13),
    color: '#D9F7C8',
    marginLeft: 8,
    lineHeight: 18,
  },
  emailBold: {
    fontWeight: '700',
  },
  responseTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  responseTimeText: {
    fontSize: RFValue(12),
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 8,
  },
  doneButton: {
    backgroundColor: '#ff6b35',
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 40,
    borderRadius: 14,
    width: '100%',
  },
  doneButtonText: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  // Status Modal
  statusModalContent: {
    backgroundColor: '#003399',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  statusModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.18)',
  },
  statusModalTitle: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  statusModalScroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statusSection: {
    marginBottom: 20,
  },
  statusSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusSectionLabel: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusTokenValue: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusBadgeText: {
    fontSize: RFValue(14),
    fontWeight: '600',
  },
  statusValue: {
    fontSize: RFValue(15),
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 22,
  },
  messageBox: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(255,255,255,0.35)',
  },
  messageText: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 20,
  },
  responseBox: {
    backgroundColor: 'rgba(126,217,87,0.18)',
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#7ED957',
  },
  responseText: {
    fontSize: RFValue(14),
    color: '#D9F7C8',
    lineHeight: 20,
    marginBottom: 8,
  },
  responseTime: {
    fontSize: RFValue(12),
    color: '#D9F7C8',
    fontStyle: 'italic',
  },
  statusCloseButton: {
    backgroundColor: '#ff6b35',
    marginHorizontal: 20,
    marginVertical: 16,
    height: 50,
    justifyContent: 'center',
    borderRadius: 14,
  },
  statusCloseButtonText: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
});

export default ContactUs;
