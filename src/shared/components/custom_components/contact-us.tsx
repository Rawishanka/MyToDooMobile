import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
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
  
  const categories = [
    { id: 'task', label: 'Task Related Issues', icon: 'briefcase-outline' },
    { id: 'payment', label: 'Payment & Billing', icon: 'card-outline' },
    { id: 'account', label: 'Account Settings', icon: 'person-outline' },
    { id: 'technical', label: 'Technical Support', icon: 'bug-outline' },
    { id: 'report', label: 'Report a Problem', icon: 'flag-outline' },
    { id: 'other', label: 'Other Inquiries', icon: 'help-circle-outline' },
  ];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCategorySelect = (category: typeof categories[0]) => {
    setSelectedCategory(category.label);
    setSubject(category.label);
    setShowCategoryDropdown(false);
  };

  const handleSendEmail = async () => {
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
    if (!subject.trim()) {
      Alert.alert('Required Field', 'Please select a category or enter a subject');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Required Field', 'Please enter your message');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Compose email
      const emailSubject = encodeURIComponent(`[MyToDo Support] ${subject}`);
      const emailBody = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\nCategory: ${selectedCategory || 'General Inquiry'}\n\nMessage:\n${message}`
      );
      
      const mailtoUrl = `mailto:support@mytodo.com?subject=${emailSubject}&body=${emailBody}`;
      
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
        
        // Show success message
        Alert.alert(
          'Email Client Opened',
          'Your email client has been opened. Please review and send the message.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Clear form
                setName('');
                setEmail('');
                setSubject('');
                setMessage('');
                setSelectedCategory('');
              }
            }
          ]
        );
      } else {
        // Fallback: Show email address
        Alert.alert(
          'Email Not Configured',
          'Please send an email to support@mytodo.com with your inquiry.',
          [
            {
              text: 'Copy Email',
              onPress: () => {
                // In a real app, you'd use Clipboard API
                Alert.alert('Email Address', 'support@mytodo.com');
              }
            },
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to open email client. Please email us at support@mytodo.com'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: 'mail-outline',
      title: 'Email Support',
      value: 'support@mytodo.com',
      action: () => Linking.openURL('mailto:support@mytodo.com'),
    },
    {
      icon: 'call-outline',
      title: 'Phone Support',
      value: '+1 (800) 123-4567',
      action: () => Linking.openURL('tel:+18001234567'),
    },
    {
      icon: 'time-outline',
      title: 'Business Hours',
      value: 'Mon-Fri, 9AM-6PM EST',
      action: null,
    },
  ];

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
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <View style={styles.iconCircle}>
                <Ionicons name="chatbubbles" size={32} color="#0052A2" />
              </View>
              <Text style={styles.heroTitle}>We're Here to Help</Text>
              <Text style={styles.heroSubtitle}>
                Get in touch with our support team and we'll respond as soon as possible
              </Text>
            </View>

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
                      name={selectedCategory ? 
                        categories.find(c => c.label === selectedCategory)?.icon as any || 'list-outline' 
                        : 'list-outline'
                      } 
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
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={styles.dropdownItem}
                        onPress={() => handleCategorySelect(category)}
                      >
                        <Ionicons name={category.icon as any} size={20} color="#0052A2" />
                        <Text style={styles.dropdownItemText}>{category.label}</Text>
                        {selectedCategory === category.label && (
                          <Ionicons name="checkmark" size={20} color="#0052A2" />
                        )}
                      </TouchableOpacity>
                    ))}
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
                    onChangeText={setMessage}
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
                onPress={handleSendEmail}
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
  heroSection: {
    backgroundColor: '#fff',
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E8F2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 6,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '95%',
    paddingHorizontal: 8,
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
});

export default ContactUs;