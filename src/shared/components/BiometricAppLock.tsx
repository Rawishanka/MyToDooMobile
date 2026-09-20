import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
  AppStateStatus,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/src/store/auth-task-store';
import { useTheme } from '@/src/shared/theme';
import { RFValue } from '@/src/shared/utils/responsive';
import {
  isBiometricLoginEnabled,
  getBiometricCapability,
  authenticateWithBiometrics,
  BiometricTypeLabel,
} from '@/src/shared/utils/biometric-auth';

interface BiometricAppLockProps {
  children?: React.ReactNode;
}

export const BiometricAppLock: React.FC<BiometricAppLockProps> = ({ children }) => {
  const { token, clearAuth } = useAuthStore();
  const { isDarkMode } = useTheme();

  const [isLocked, setIsLocked] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricTypeLabel>('Face ID');
  const [authError, setAuthError] = useState<string | null>(null);

  const appState = useRef<AppStateStatus>(AppState.currentState);
  const isAuthenticatingRef = useRef<boolean>(false);

  // Initial check on mount
  useEffect(() => {
    checkAndPromptLock();
  }, [token]);

  // Listen to background/foreground app state transitions
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground
        checkAndPromptLock();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [token]);

  const checkAndPromptLock = async () => {
    // Only lock if user is authenticated and has biometric lock enabled
    if (!token) {
      setIsLocked(false);
      return;
    }

    try {
      const isEnabled = await isBiometricLoginEnabled();
      if (!isEnabled) {
        setIsLocked(false);
        return;
      }

      const capability = await getBiometricCapability();
      if (!capability.hasHardware || !capability.isEnrolled) {
        setIsLocked(false);
        return;
      }

      setBiometricType(capability.biometricTypeLabel);
      setIsLocked(true);
      setAuthError(null);

      // Automatically trigger biometric challenge
      triggerBiometricAuth(capability.biometricTypeLabel);
    } catch (error) {
      console.warn('⚠️ [BiometricAppLock] Error evaluating lock status:', error);
      setIsLocked(false);
    }
  };

  const triggerBiometricAuth = async (label: string = biometricType) => {
    if (isAuthenticatingRef.current) return;
    isAuthenticatingRef.current = true;
    setIsChecking(true);
    setAuthError(null);

    try {
      const result = await authenticateWithBiometrics(`Scan your ${label} to unlock MyToDoo`);
      if (result.success) {
        setIsLocked(false);
        setAuthError(null);
      } else {
        setAuthError(result.error || `Authentication failed. Please try again.`);
      }
    } catch (error: any) {
      setAuthError(error?.message || 'Authentication error');
    } finally {
      setIsChecking(false);
      isAuthenticatingRef.current = false;
    }
  };

  const handleSignOut = () => {
    setIsLocked(false);
    clearAuth();
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
      {/* Background Dimmed Content */}
      <View style={styles.contentBox}>
        {/* Biometric Shield Ring */}
        <View style={[styles.iconRing, isDarkMode && { backgroundColor: 'rgba(56, 189, 248, 0.12)' }]}>
          <Ionicons
            name={biometricType === 'Face ID' ? 'scan-circle-outline' : 'finger-print-outline'}
            size={80}
            color={isDarkMode ? '#38BDF8' : '#0EA5E9'}
          />
        </View>

        <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>
          MyToDoo is Protected
        </Text>
        <Text style={[styles.subtitle, isDarkMode && { color: '#94A3B8' }]}>
          {biometricType} authentication is required to access your account.
        </Text>

        {authError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.unlockBtn}
          onPress={() => triggerBiometricAuth(biometricType)}
          disabled={isChecking}
          activeOpacity={0.8}
        >
          {isChecking ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons
                name={biometricType === 'Face ID' ? 'scan-outline' : 'finger-print'}
                size={22}
                color="#fff"
              />
              <Text style={styles.unlockBtnText}>Unlock with {biometricType}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Text style={[styles.signOutBtnText, isDarkMode && { color: '#94A3B8' }]}>
            Log Out / Switch Account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFFFFF',
    zIndex: 999999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  contentBox: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  iconRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: RFValue(22),
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: RFValue(13),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: RFValue(12),
    fontWeight: '500',
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#0EA5E9',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  unlockBtnText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontWeight: '700',
  },
  signOutBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  signOutBtnText: {
    color: '#64748B',
    fontSize: RFValue(13),
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
