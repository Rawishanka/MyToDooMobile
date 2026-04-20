import { removeFCMToken } from '@/src/api/fcm-api';
import { getPushToken } from '@/src/services/notification-service';
import { useClearAllCaches } from '@/src/shared/utils/cache-utils';
import { useAuthStore } from '@/src/store/auth-task-store';
import { useCreateTaskStore } from '@/src/store/create-task-store';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
      onBack(); // Navigate back to account screen
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log("🔐 Starting logout process...");
      
      // STEP 1: Delete FCM token from backend (while still authenticated)
      try {
        console.log("🗑️ Removing FCM token from backend...");
        const currentToken = await getPushToken();
        if (currentToken) {
          await removeFCMToken({ token: currentToken });
          console.log("✅ FCM token removed from backend successfully");
        } else {
          console.log("ℹ️ No FCM token to remove");
        }
      } catch (fcmError) {
        // Don't block logout if FCM deletion fails
        console.warn("⚠️ Failed to remove FCM token (continuing logout):", fcmError);
      }
      
      // STEP 2: Clear React Query cache FIRST while user is still authenticated
      console.log("🧹 Clearing all caches...");
      clearAllCaches();
      
      // STEP 3: Reset task creation form to clear any unsaved data
      console.log("🧹 Resetting task creation form...");
      resetTask();
      
      // STEP 4: Wait a moment for cache clearing to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // STEP 5: Disable auth queries
      console.log("🚫 Disabling all React Query hooks...");
      const { disableAuth } = useAuthStore.getState();
      disableAuth();
      
      // STEP 6: Clear all authentication data
      await clearAuth();
      
      console.log("✅ Logout successful");
      
      // Close popup
      setShowPopup(false);
      
      // NOTE: No manual navigation needed!
      // The app/index.tsx will automatically detect isAuthenticated=false
      // and navigate to login screen, preventing duplicate navigation
      
      // Show success message
      Alert.alert('Success', 'You have been logged out successfully!');
      
    } catch (error) {
      console.error("❌ Logout error:", error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
      if (onBack) {
        onBack(); // Navigate back to account screen
      }
    }
  };

  const showPopupAgain = () => {
    setShowPopup(true);
  };

  return (
    <View style={styles.container}>
      {/* Demo Button to show popup again */}
      {!showPopup && (
        <TouchableOpacity
          onPress={showPopupAgain}
          style={styles.demoButton}
        >
          <Text style={styles.demoButtonText}>Show Logout Popup</Text>
        </TouchableOpacity>
      )}

      {/* Modal popup */}
      <Modal
        transparent={true}
        visible={showPopup}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        {/* Backdrop overlay */}
        <View style={styles.backdrop}>
          {/* Popup modal */}
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Log out?</Text>
              <Text style={styles.subtitle}>
                Are you sure you want to log out?
              </Text>
            </View>

            {/* Action buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={handleCancel}
                style={[styles.button, styles.leftButton]}
                disabled={isLoggingOut}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <View style={styles.buttonDivider} />
              
              <TouchableOpacity
                onPress={handleLogout}
                style={[styles.button, styles.rightButton]}
                disabled={isLoggingOut}
              >
                <Text style={styles.buttonText}>
                  {isLoggingOut ? 'Logging out...' : 'Log out'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  demoButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxWidth: 320,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftButton: {
    borderBottomLeftRadius: 12,
  },
  rightButton: {
    borderBottomRightRadius: 12,
  },
  buttonDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3b82f6',
  },
});