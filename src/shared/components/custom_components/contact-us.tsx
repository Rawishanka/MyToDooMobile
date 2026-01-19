import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
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
import {
    getSupportCategories,
    getSupportStatus,
    submitSupportRequest,
    SupportStatusData
} from '@/src/api/help-support-api';

type ContactUsProps = { 
  onBack: () => void;
};

const ContactUs = ({ onBack }: ContactUsProps) => {
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
        category: selectedCategory,
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
        return '#0052A2';
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
      icon: 'call-outline',
      title: 'Phone Support',
      value: '+1 (800) 123-4567',
      action: null,
    },
    {
      icon: 'time-outline',
      title: 'Business Hours',
      value: 'Mon-Fri, 9AM-6PM EST',
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
        <View style={styles.successModalContent}>
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark" size={40} color="#fff" />
          </View>
          
          <Text style={styles.successTitle}>Message Sent Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Your support request has been submitted to support@mytodoo.com
          </Text>

          {/* Support Token Card */}
          <View style={styles.tokenCard}>
            <View style={styles.tokenHeader}>
              <Ionicons name="ticket-outline" size={20} color="#0052A2" />
              <Text style={styles.tokenLabel}>Support Token</Text>
            </View>
            <Text style={styles.tokenValue}>{supportToken}</Text>
            <Text style={styles.tokenHint}>Save this token to track your request</Text>
          </View>

          {/* Email Confirmation */}
          <View style={styles.emailConfirmation}>
            <Ionicons name="checkmark-circle" size={20} color="#28a745" />
            <Text style={styles.emailConfirmationText}>
              We'll respond to <Text style={styles.emailBold}>{submittedEmail}</Text> as soon as possible
            </Text>
          </View>

          {/* Response Time */}
          <View style={styles.responseTimeContainer}>
            <Ionicons name="time-outline" size={18} color="#666" />
            <Text style={styles.responseTimeText}>
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
        <View style={styles.statusModalContent}>
          {/* Header */}
          <View style={styles.statusModalHeader}>
            <Text style={styles.statusModalTitle}>Support Request Details</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowStatusModal(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
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
                    <Ionicons name="ticket-outline" size={18} color="#0052A2" />
                    <Text style={styles.statusSectionLabel}>Support Token</Text>
                  </View>
                  <Text style={styles.statusTokenValue}>{statusData.supportToken}</Text>
                </View>

                {/* Status Badge */}
                <View style={styles.statusSection}>
                  <View style={styles.statusSectionHeader}>
                    <Ionicons name="flag-outline" size={18} color="#0052A2" />
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
                    <Ionicons name="folder-outline" size={18} color="#0052A2" />
                    <Text style={styles.statusSectionLabel}>Category</Text>
                  </View>
                  <Text style={styles.statusValue}>{statusData.category}</Text>
                </View>

                {/* Subject */}
                <View style={styles.statusSection}>
                  <View style={styles.statusSectionHeader}>
                    <Ionicons name="text-outline" size={18} color="#0052A2" />
                    <Text style={styles.statusSectionLabel}>Subject</Text>
                  </View>
                  <Text style={styles.statusValue}>{statusData.subject}</Text>
                </View>

                {/* Your Message */}
                {statusData.message && (
                  <View style={styles.statusSection}>
                    <View style={styles.statusSectionHeader}>
                      <Ionicons name="chatbubble-outline" size={18} color="#0052A2" />
                      <Text style={styles.statusSectionLabel}>Your Message</Text>
                    </View>
                    <View style={styles.messageBox}>
                      <Text style={styles.messageText}>{statusData.message}</Text>
                    </View>
                  </View>
                )}

                {/* Admin Response */}
                {statusData.adminResponse && (
                  <View style={styles.statusSection}>
                    <View style={styles.statusSectionHeader}>
                      <Ionicons name="chatbubbles" size={18} color="#28a745" />
                      <Text style={[styles.statusSectionLabel, { color: '#28a745' }]}>Support Response</Text>
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
                    <Ionicons name="calendar-outline" size={18} color="#0052A2" />
                    <Text style={styles.statusSectionLabel}>Submitted</Text>
                  </View>
                  <Text style={styles.statusValue}>{formatDate(statusData.createdAt)}</Text>
                </View>

                {statusData.resolvedAt && (
                  <View style={styles.statusSection}>
                    <View style={styles.statusSectionHeader}>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#28a745" />
                      <Text style={styles.statusSectionLabel}>Resolved</Text>
                    </View>
                    <Text style={styles.statusValue}>{formatDate(statusData.resolvedAt)}</Text>
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Contact Us</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Quick Contact Methods */}
            <View style={styles.quickContactSection}>
              {contactMethods.map((method, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.contactMethodCard}
                  onPress={method.action ? method.action : undefined}
                  disabled={!method.action}
                  activeOpacity={method.action ? 0.7 : 1}
                >
                  <View style={styles.contactMethodIcon}>
                    <Ionicons name={method.icon as any} size={24} color="#0052A2" />
                  </View>
                  <View style={styles.contactMethodInfo}>
                    <Text style={styles.contactMethodTitle}>{method.title}</Text>
                    <Text style={styles.contactMethodValue}>{method.value}</Text>
                  </View>
                  {method.action && (
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR SEND US A MESSAGE</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Contact Form */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Send Us a Message</Text>
              
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Your Name *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your.email@example.com"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Category Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category *</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dropdownContent}>
                    <Ionicons 
                      name={(selectedCategory ? categoryIcons[selectedCategory] : 'help-circle-outline') as any} 
                      size={20} 
                      color={selectedCategory ? '#333' : '#999'} 
                      style={styles.inputIcon} 
                    />
                    <Text style={[styles.dropdownText, selectedCategory && styles.dropdownTextSelected]}>
                      {selectedCategory || 'Select a category'}
                    </Text>
                  </View>
                  <Ionicons 
                    name={showCategoryDropdown ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
                
                {showCategoryDropdown && (
                  <View style={styles.dropdownMenu}>
                    {loadingCategories ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#0052A2" />
                        <Text style={styles.loadingText}>Loading categories...</Text>
                      </View>
                    ) : (
                      categories.map((category, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.dropdownItem}
                          onPress={() => handleCategorySelect(category)}
                        >
                          <Ionicons 
                            name={(categoryIcons[category] || 'help-circle-outline') as any} 
                            size={20} 
                            color="#0052A2" 
                          />
                          <Text style={styles.dropdownItemText}>{category}</Text>
                          {selectedCategory === category && (
                            <Ionicons name="checkmark" size={20} color="#0052A2" />
                          )}
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}
              </View>

              {/* Subject Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Subject *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="text-outline" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={subject}
                    onChangeText={setSubject}
                    placeholder="Brief description of your issue"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              {/* Message Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Message *</Text>
                <View style={[styles.inputContainer, styles.messageInputContainer]}>
                  <TextInput
                    style={[styles.input, styles.messageInput]}
                    value={message}
                    onChangeText={(text) => setMessage(text.slice(0, 1000))}
                    placeholder="Please provide detailed information about your inquiry..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                  />
                </View>
                <Text style={styles.charCount}>{message.length} / 1000 characters</Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSendMessage}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Send Message</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Info Note */}
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color="#0052A2" />
                <Text style={styles.infoText}>
                  We typically respond within 24 hours during business days
                </Text>
              </View>
            </View>

            {/* Token Lookup Section */}
            <View style={styles.tokenLookupSection}>
              <Text style={styles.tokenLookupTitle}>Track Your Request</Text>
              <Text style={styles.tokenLookupSubtitle}>
                Enter your support token to check the status of your request
              </Text>
              
              <View style={styles.tokenInputRow}>
                <View style={styles.tokenInputContainer}>
                  <Ionicons name="ticket-outline" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.tokenInput}
                    value={tokenInput}
                    onChangeText={setTokenInput}
                    placeholder="SUP-XXXXXX-XXXXXXXX"
                    placeholderTextColor="#999"
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
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="search" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* FAQ Link */}
            <View style={styles.faqSection}>
              <Text style={styles.faqTitle}>Looking for quick answers?</Text>
              <Text style={styles.faqSubtitle}>
                Check out our FAQ section for instant solutions to common questions
              </Text>
              <TouchableOpacity style={styles.faqButton}>
                <Ionicons name="help-circle-outline" size={20} color="#0052A2" />
                <Text style={styles.faqButtonText}>View FAQ</Text>
                <Ionicons name="chevron-forward" size={20} color="#0052A2" />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  quickContactSection: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 6,
  },
  contactMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactMethodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contactMethodInfo: {
    flex: 1,
  },
  contactMethodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  contactMethodValue: {
    fontSize: 13,
    color: '#0052A2',
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e4e8',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginHorizontal: 16,
    letterSpacing: 0.5,
  },
  formSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
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
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e1e4e8',
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
    fontSize: 15,
    color: '#999',
    flex: 1,
  },
  dropdownTextSelected: {
    color: '#1a1a1a',
    fontWeight: '500',
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0052A2',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#0052A2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#B0C4DE',
    shadowOpacity: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F2FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#0052A2',
    marginLeft: 10,
    lineHeight: 18,
  },
  // Token Lookup Section
  tokenLookupSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 10,
  },
  tokenLookupTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  tokenLookupSubtitle: {
    fontSize: 13,
    color: '#666',
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
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginRight: 10,
  },
  tokenInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    padding: 0,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  checkButton: {
    backgroundColor: '#0052A2',
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonDisabled: {
    backgroundColor: '#B0C4DE',
  },
  // FAQ Section
  faqSection: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  faqTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
    textAlign: 'center',
  },
  faqSubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  faqButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F2FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0052A2',
  },
  faqButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0052A2',
    marginLeft: 8,
    marginRight: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Success Modal
  successModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#28a745',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  tokenCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#0052A2',
    marginBottom: 16,
  },
  tokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tokenLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0052A2',
    marginLeft: 8,
  },
  tokenValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  tokenHint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emailConfirmation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#d4edda',
    padding: 12,
    borderRadius: 10,
    width: '100%',
    marginBottom: 12,
  },
  emailConfirmationText: {
    flex: 1,
    fontSize: 13,
    color: '#155724',
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
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  doneButton: {
    backgroundColor: '#0052A2',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  // Status Modal
  statusModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
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
    borderBottomColor: '#e1e4e8',
  },
  statusModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
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
    fontSize: 13,
    fontWeight: '600',
    color: '#0052A2',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusTokenValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
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
    fontSize: 14,
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  messageBox: {
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#e1e4e8',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  responseBox: {
    backgroundColor: '#d4edda',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
  },
  responseText: {
    fontSize: 14,
    color: '#155724',
    lineHeight: 20,
    marginBottom: 8,
  },
  responseTime: {
    fontSize: 12,
    color: '#155724',
    fontStyle: 'italic',
  },
  statusCloseButton: {
    backgroundColor: '#0052A2',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 10,
  },
  statusCloseButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
});

export default ContactUs;
