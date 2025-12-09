/**
 * Notification Permission Prompt Component
 * 
 * Displays a friendly prompt asking users to allow notifications
 * Shows on app first open (before authentication)
 */

import { checkNotificationPermissions, requestNotificationPermissions } from '@/src/services/notification-service';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NOTIFICATION_PROMPT_KEY = '@notification_permission_asked';

interface NotificationPermissionPromptProps {
  onComplete?: () => void;
}

export const NotificationPermissionPrompt: React.FC<NotificationPermissionPromptProps> = ({ onComplete }) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkShouldShowPrompt();
  }, []);

  const checkShouldShowPrompt = async () => {
    try {
      // Only show on Android (iOS handles this differently)
      if (Platform.OS !== 'android') {
        onComplete?.();
        return;
      }

      // Check if we've already asked
      const hasAsked = await AsyncStorage.getItem(NOTIFICATION_PROMPT_KEY);
      if (hasAsked === 'true') {
        onComplete?.();
        return;
      }

      // Check if permission is already granted
      const hasPermission = await checkNotificationPermissions();
      if (hasPermission) {
        await AsyncStorage.setItem(NOTIFICATION_PROMPT_KEY, 'true');
        onComplete?.();
        return;
      }

      // Show the prompt
      setVisible(true);
    } catch (error) {
      console.error('Error checking notification prompt:', error);
      onComplete?.();
    }
  };

  const handleAllow = async () => {
    setLoading(true);
    try {
      console.log('🔔 User requesting notification permissions...');
      const result = await requestNotificationPermissions();
      
      if (result.granted) {
        console.log('✅ Notification permission granted by user');
      } else {
        console.log('❌ Notification permission denied by user');
      }

      await AsyncStorage.setItem(NOTIFICATION_PROMPT_KEY, 'true');
      setVisible(false);
      onComplete?.();
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setVisible(false);
      onComplete?.();
    } finally {
      setLoading(false);
    }
  };

  const handleNotNow = async () => {
    console.log('⏭️ User skipped notification permission');
    setVisible(false);
    onComplete?.();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleNotNow}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Ionicons name="notifications" size={60} color="#007AFF" />
          </View>

          <Text style={styles.title}>Stay Updated!</Text>
          
          <Text style={styles.message}>
            Get instant notifications for new messages, offers, and task updates.
          </Text>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Ionicons name="chatbubble" size={20} color="#34C759" />
              <Text style={styles.featureText}>New messages</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="cash" size={20} color="#FF9500" />
              <Text style={styles.featureText}>New offers</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
              <Text style={styles.featureText}>Task updates</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.allowButton]}
            onPress={handleAllow}
            disabled={loading}
          >
            <Text style={styles.allowButtonText}>
              {loading ? 'Enabling...' : 'Allow Notifications'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.notNowButton]}
            onPress={handleNotNow}
            disabled={loading}
          >
            <Text style={styles.notNowButtonText}>Not Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
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
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  features: {
    width: '100%',
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  allowButton: {
    backgroundColor: '#007AFF',
  },
  allowButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  notNowButton: {
    backgroundColor: 'transparent',
  },
  notNowButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
