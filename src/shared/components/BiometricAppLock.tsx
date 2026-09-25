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
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/store/auth-task-store';
import { useTheme } from '@/src/shared/theme';
import { RFValue } from '@/src/shared/utils/responsive';
import {
  isBiometricLoginEnabled,
  getBiometricCapability,
  authenticateWithBiometrics,
  isBiometricPromptActive,
  consumeSessionRestored,
  BiometricTypeLabel,
} from '@/src/shared/utils/biometric-auth';

// QA guide: backgrounding the app for more than ~3 seconds must show the shield.
const LOCK_AFTER_MS = 3 * 1000;

interface BiometricAppLockProps {
  children?: React.ReactNode;
}

export const BiometricAppLock: React.FC<BiometricAppLockProps> = ({ children }) => {
  const { token, clearAuth } = useAuthStore();
  const { isDarkMode } = useTheme();
  const router = useRouter();

  const [isLocked, setIsLocked] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricTypeLabel>('Face ID');
  const [authError, setAuthError] = useState<string | null>(null);

  // Guards against infinite loops
  const isAuthenticatingRef = useRef<boolean>(false);
  const lastBackgroundTimeRef = useRef<number>(0);
  const hadTokenRef = useRef<boolean>(false);

  // 1. Cold-start lock. Only a session that was RESTORED from storage is locked. A session the
  //    user just created by logging in (password / Face ID / Google / Apple) already proved who
  //    they are - locking it would show a second, pointless Face ID prompt right after login.
  useEffect(() => {
    const restored = consumeSessionRestored();
    const hadToken = hadTokenRef.current;
    hadTokenRef.current = !!token;

    if (!token) {
      setIsLocked(false);
      setAuthError(null);
      return;
    }
    if (hadToken) return; // token refresh mid-session, not a new session

    console.log('[Biometric] lock: session appeared, restoredFromStorage =', restored);
    if (!restored) return;

    (async () => {
      try {
        const enabled = await isBiometricLoginEnabled();
        console.log('[Biometric] lock: enabled flag =', enabled);
        if (!enabled) return;

        const cap = await getBiometricCapability();
        if (!cap.canAuthenticate) {
          console.log('[Biometric] lock: device cannot authenticate - not locking');
          return;
        }

        setBiometricType(cap.biometricTypeLabel);
        setIsLocked(true);
        // Let the UI settle: iOS cancels the prompt (app_cancel) if shown while still becoming active
        setTimeout(() => promptBiometricAuth(cap.biometricTypeLabel), 400);
      } catch (err) {
        console.warn('[Biometric] lock: initial check error:', err);
        setIsLocked(false);
      }
    })();
  }, [token]);

  // 2. Listen STRICTLY to real background transitions (NOT 'inactive')
  useEffect(() => {
    const handleAppStateChange = async (nextState: AppStateStatus) => {
      // The native Face ID sheet (and Alert.prompt) temporarily sets state to 'inactive'/'active'.
      // NEVER treat that as leaving the app - neither our own prompt nor another screen's.
      if (isAuthenticatingRef.current || isBiometricPromptActive()) {
        return;
      }

      if (nextState === 'background') {
        lastBackgroundTimeRef.current = Date.now();
      } else if (nextState === 'active') {
        const timeInBackground = Date.now() - lastBackgroundTimeRef.current;
        const wasBackgrounded = lastBackgroundTimeRef.current > 0;
        lastBackgroundTimeRef.current = 0;

        if (wasBackgrounded && timeInBackground > LOCK_AFTER_MS) {
          if (!token) return;

          const enabled = await isBiometricLoginEnabled();
          const cap = enabled ? await getBiometricCapability() : null;
          console.log('[Biometric] resume after', timeInBackground, 'ms; enabled =', enabled, 'canAuthenticate =', cap?.canAuthenticate);
          if (enabled && cap?.canAuthenticate) {
            setBiometricType(cap.biometricTypeLabel);
            setIsLocked(true);
            setAuthError(null);
            setTimeout(() => promptBiometricAuth(cap.biometricTypeLabel), 400);
          }
        }
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      sub.remove();
    };
  }, [token]);

  const promptBiometricAuth = async (label: string = biometricType) => {
    // Prevent duplicate or parallel authentication dialogs
    if (isAuthenticatingRef.current) return;

    isAuthenticatingRef.current = true;
    setIsChecking(true);
    setAuthError(null);

    try {
      const message = `Scan your ${label} to unlock MyToDoo`;
      let result = await authenticateWithBiometrics(message);
      // iOS cancels the prompt if it is shown while the app is still becoming active - retry once.
      if (!result.success && (result.code === 'app_cancel' || result.code === 'system_cancel')) {
        console.log('[Biometric] lock: prompt auto-cancelled by system, retrying once');
        await new Promise(r => setTimeout(r, 700));
        result = await authenticateWithBiometrics(message);
      }
      console.log('[Biometric] lock: prompt outcome', JSON.stringify(result));
      if (result.success) {
        setIsLocked(false);
        setAuthError(null);
      } else if (result.cancelled) {
        // Cancel is not an error and must not log the user out. Keep the shield, wait for a tap.
        setAuthError(`Tap "Unlock with ${label}" to continue.`);
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

  const handleSignOut = async () => {
    // Design: an explicit log out keeps Face ID enabled + its Keychain credentials, so the
    // login screen still offers "Log in with Face ID" (per QA guide). Disabling is done in
    // Account > App Preferences.
    console.log('[Biometric] lock: user chose Log Out');
    setIsLocked(false);
    isAuthenticatingRef.current = false;
    try {
      useAuthStore.getState().disableAuth();
      await clearAuth();
    } finally {
      router.replace('/(auth)/login' as any);
    }
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
