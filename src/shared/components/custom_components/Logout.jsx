import { removeFCMToken } from '@/src/api/fcm-api';
import { deleteFCMToken, getFCMToken } from '@/src/services/notification-service';
import { useClearAllCaches } from '@/src/shared/utils/cache-utils';
import { useAuthStore } from '@/src/store/auth-task-store';
import { useCreateTaskStore } from '@/src/store/create-task-store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LogoutPopup({ onBack }) {
  const [showPopup, setShowPopup] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { clearAuth } = useAuthStore();
  const { resetTask } = useCreateTaskStore();
  const clearAllCaches = useClearAllCaches();
  const router = useRouter();

  const handleCancel = () => {
    setShowPopup(false);
    if (onBack) {
      onBack();
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('🔐 Starting logout process...');

      // STEP 1: Remove FCM Token from backend & device
      try {
        const currentToken = await getFCMToken();
        if (currentToken) {
          await removeFCMToken({ token: currentToken });
          console.log('✅ FCM token removed from backend');
        }
      } catch (fcmError) {
        console.warn('⚠️ Failed to remove FCM token from backend:', fcmError);
      }

      try {
        await deleteFCMToken();
        console.log('✅ FCM token invalidated on device');
      } catch (fcmError) {
        console.warn('⚠️ Failed to invalidate FCM token on device:', fcmError);
      }

      // STEP 2: Clear caches and reset stores
      clearAllCaches();
      resetTask();

      await new Promise((resolve) => setTimeout(resolve, 150));

      // STEP 3: Disable auth queries & clear authentication data
      const { disableAuth } = useAuthStore.getState();
      disableAuth();
      await clearAuth();

      console.log('✅ Logout completed successfully');
      setShowPopup(false);

      // Smoothly redirect to login screen
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('❌ Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <Modal
      transparent
      visible={showPopup}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.backdrop} onPress={handleCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Red/Coral Soft Icon Badge */}
          <View style={styles.iconBadge}>
            <Ionicons name="log-out-outline" size={32} color="#EF4444" />
          </View>

          {/* Heading */}
          <Text style={styles.title}>Log Out of MyToDoo?</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Are you sure you want to log out? You will need to sign in again to access your tasks and messages.
          </Text>

          {/* 2026 Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancel}
              disabled={isLoggingOut}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              disabled={isLoggingOut}
              activeOpacity={0.85}
            >
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.logoutBtnText}>Log Out</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  logoutBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
