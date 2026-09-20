import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
  AppStateStatus,
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

  // Guards against infinite loops
  const isAuthenticatingRef = useRef<boolean>(false);
  const lastBackgroundTimeRef = useRef<number>(0);
  const hasCheckedInitialLaunchRef = useRef<boolean>(false);

  // 1. Initial Launch Check (run once when token is present)
  useEffect(() => {
    if (!token) {
      setIsLocked(false);
      return;
    }

    if (hasCheckedInitialLaunchRef.current) return;
    hasCheckedInitialLaunchRef.current = true;

    (async () => {
      try {
        const enabled = await isBiometricLoginEnabled();
        if (!enabled) {
          setIsLocked(false);
          return;
        }

        const cap = await getBiometricCapability();
        if (!cap.hasHardware || !cap.isEnrolled) {
          setIsLocked(false);
          return;
        }

        setBiometricType(cap.biometricTypeLabel);
        setIsLocked(true);
        // Prompt once on launch
        promptBiometricAuth(cap.biometricTypeLabel);
      } catch (err) {
        console.warn('⚠️ [BiometricAppLock] Initial check error:', err);
        setIsLocked(false);
      }
    })();
  }, [token]);

  // 2. Listen STRICTLY to real background transitions (NOT 'inactive')
  useEffect(() => {
    const handleAppStateChange = async (nextState: AppStateStatus) => {
      // If currently authenticating (e.g. native Face ID modal is displayed),
      // iOS temporarily sets state to 'inactive'. NEVER treat this as leaving the app!
      if (isAuthenticatingRef.current) {
        return;
      }

      if (nextState === 'background') {
        // App was truly sent to background (home screen or other app)
        lastBackgroundTimeRef.current = Date.now();
      } else if (nextState === 'active') {
        const timeInBackground = Date.now() - lastBackgroundTimeRef.current;
        
        // Only lock if app was genuinely in background for > 3 seconds
        // and user has biometric lock enabled
        if (lastBackgroundTimeRef.current > 0 && timeInBackground > 3000) {
          if (!token) return;

          const enabled = await isBiometricLoginEnabled();
          if (enabled) {
            setIsLocked(true);
            setAuthError(null);
            promptBiometricAuth(biometricType);
          }
        }
        lastBackgroundTimeRef.current = 0;
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      sub.remove();
    };
  }, [token, biometricType]);

  const promptBiometricAuth = async (label: string = biometricType) => {
    // Prevent duplicate or parallel authentication dialogs
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
        // Stop and wait for user to click button - do NOT auto-retry in a loop!
        setAuthError(result.error || 'Authentication failed. Tap the button below to try again.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Biometric authentication error');
    } finally {
      setIsChecking(false);
      // Brief cooldown before releasing lock to prevent event bounce
      setTimeout(() => {
        isAuthenticatingRef.current = false;
      }, 500);
    }
  };

  const handleSignOut = () => {
    setIsLocked(false);
    isAuthenticatingRef.current = false;
    clearAuth();
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
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
          {biometricType} is required to access your account.
        </Text>

        {authError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.unlockBtn}
          onPress={() => promptBiometricAuth(biometricType)}
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
    flexShrink: 1,
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
