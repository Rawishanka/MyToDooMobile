import { useRequestReview } from '@/src/shared/hooks/useUserProfileApi';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Country codes mapping
const COUNTRY_CODES = {
  'US': '+1',
  'CA': '+1', 
  'GB': '+44',
  'AU': '+61',
  'LK': '+94',
  'IN': '+91',
  'DE': '+49',
  'FR': '+33',
  'JP': '+81',
  'CN': '+86',
  // Add more as needed
};

interface RequestReviewModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
}

export const RequestReviewModal: React.FC<RequestReviewModalProps> = ({ 
  visible, 
  onClose, 
  userId,
  userName = 'User'
}) => {
  const [method, setMethod] = useState<'email' | 'sms'>('email');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [countryCode, setCountryCode] = useState('+94'); // Default to Sri Lanka
  const [detectedCountry, setDetectedCountry] = useState('LK');
  
  // Review link using hosted frontend
  const reviewLink = `http://134.199.172.167:3000/review/${userId}`;
  
  const requestReviewMutation = useRequestReview();

  // Auto-fill default message when modal opens
  useEffect(() => {
    if (visible && !message) {
      const defaultMessage = `Hi! I'd love to get your feedback on our experience working together. Could you please leave me a review? Here's the link: ${reviewLink}\n\nThank you!\n${userName}`;
      setMessage(defaultMessage);
    }
  }, [visible, reviewLink, userName]);

  // Auto-detect country based on location
  useEffect(() => {
    detectCountryCode();
  }, []);

  const detectCountryCode = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync();
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (reverseGeocode.length > 0) {
          const country = reverseGeocode[0].isoCountryCode?.toUpperCase() || 'LK';
          const code = COUNTRY_CODES[country as keyof typeof COUNTRY_CODES] || '+94';
          setCountryCode(code);
          setDetectedCountry(country);
          console.log(`🌍 Detected country: ${country}, code: ${code}`);
        }
      }
    } catch (error) {
      console.log('📍 Could not detect location, using default country code');
      // Keep default values
    }
  };

  const handleSendRequest = async () => {
    if (!recipient.trim()) {
      Alert.alert('Error', `Please enter a valid ${method === 'email' ? 'email address' : 'phone number'}`);
      return;
    }

    // Basic validation
    if (method === 'email' && !recipient.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (method === 'sms' && recipient.length < 9) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      // Use current message or fallback
      const messageToSend = message.trim() || `Hi! I'd love to get your feedback on our experience working together. Could you please leave me a review? Here's the link: ${reviewLink}\n\nThank you!\n${userName}`;
      
      // Format phone number if SMS - support all countries
      let formattedRecipient = recipient.trim();
      if (method === 'sms') {
        // Remove any spaces, dashes, or special characters
        formattedRecipient = formattedRecipient.replace(/[\s\-\(\)]/g, '');
        
        // If number doesn't start with +, add the detected country code
        if (!formattedRecipient.startsWith('+')) {
          // Remove leading 0 if present (common in local format)
          if (formattedRecipient.startsWith('0')) {
            formattedRecipient = formattedRecipient.substring(1);
          }
          // Add the detected country code
          formattedRecipient = countryCode + formattedRecipient;
        }
        
        console.log(`📱 Original: ${recipient} → Formatted: ${formattedRecipient}`);
      }
      
      await requestReviewMutation.mutateAsync({
        method,
        recipient: formattedRecipient,
        message: messageToSend
      });

      Alert.alert(
        'Success!', 
        `Review request sent via ${method} to ${recipient}`,
        [{ text: 'OK', onPress: onClose }]
      );
      
      // Reset form
      setRecipient('');
      setMessage('');
      
    } catch (error: any) {
      Alert.alert(
        'Error', 
        error.message || `Failed to send review request via ${method}`
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Request a Review</Text>
            <Text style={styles.headerSubtitle}>Send a review request to someone you've worked with</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Method Selection */}
          <Text style={styles.sectionTitle}>How would you like to send the request?</Text>
          <View style={styles.methodContainer}>
            <TouchableOpacity 
              style={[styles.methodButton, method === 'email' && styles.methodButtonActive]}
              onPress={() => setMethod('email')}
            >
              <Ionicons 
                name="mail" 
                size={20} 
                color={method === 'email' ? '#007AFF' : '#666'} 
              />
              <Text style={[styles.methodText, method === 'email' && styles.methodTextActive]}>
                Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.methodButton, method === 'sms' && styles.methodButtonActive]}
              onPress={() => setMethod('sms')}
            >
              <Ionicons 
                name="chatbubble" 
                size={20} 
                color={method === 'sms' ? '#007AFF' : '#666'} 
              />
              <Text style={[styles.methodText, method === 'sms' && styles.methodTextActive]}>
                SMS
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recipient Input */}
          <Text style={styles.sectionTitle}>
            {method === 'email' ? 'Email Address *' : `Phone Number *`}
          </Text>
          
          {method === 'sms' ? (
            <View>
              <View style={styles.phoneInputContainer}>
                <View style={styles.countryCodeContainer}>
                  <Text style={styles.countryCodeText}>{countryCode}</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  value={recipient}
                  onChangeText={setRecipient}
                  placeholder={detectedCountry === 'LK' ? '754640658' : '123456789'}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <Text style={styles.phoneHintText}>Enter number without country code</Text>
            </View>
          ) : (
            <TextInput
              style={styles.input}
              value={recipient}
              onChangeText={setRecipient}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}

          {/* Message */}
          <Text style={styles.sectionTitle}>Message *</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            value={message}
            onChangeText={setMessage}
            placeholder="Hi! I'd love to get your feedback on our experience working together..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <Text style={styles.messageInfoText}>The review link is automatically included in your message</Text>

          {/* Send Button */}
          <TouchableOpacity 
            style={[styles.sendButton, requestReviewMutation.isPending && styles.sendButtonDisabled]}
            onPress={handleSendRequest}
            disabled={requestReviewMutation.isPending}
          >
            {requestReviewMutation.isPending ? (
              <Text style={styles.sendButtonText}>Sending...</Text>
            ) : (
              <>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.sendButtonText}>
                  Send {method === 'email' ? 'Email' : 'SMS'} Request
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle" size={16} color="#666" />
            <Text style={styles.infoText}>
              {method === 'email' 
                ? 'An email will be sent with a link to review your profile' 
                : 'An SMS will be sent with a link to review your profile'
              }
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingTop: Platform.OS === 'ios' ? 60 : 15,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
  },
  placeholder: {
    width: 34, // Same width as close button
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 20,
  },
  methodContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#F8F9FA',
  },
  methodButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E6F3FF',
  },
  methodText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  methodTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  messageInput: {
    minHeight: 120,
  },
  messageInfoText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28A745',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 30,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCE5D4',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  countryCodeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 15,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  phoneHintText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 8,
  },
});