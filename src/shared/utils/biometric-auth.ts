import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";
import API_CONFIG from "@/src/api/config";
import { getRememberMeCredentials } from "@/src/shared/utils/auth-utils";

const BIOMETRIC_ENABLED_KEY = "biometric_login_enabled";
const BIOMETRIC_EMAIL_KEY = "bio_auth_email";
const BIOMETRIC_SECRET_KEY = "bio_auth_credentials";

export type BiometricTypeLabel = "Face ID" | "Touch ID" | "Fingerprint" | "Face Unlock" | "Biometrics";

export interface BiometricCapability {
  hasHardware: boolean;
  /** true when the device has biometrics OR at least a device passcode to fall back to */
  canAuthenticate?: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  biometricTypeLabel: BiometricTypeLabel;
}

/**
 * Check device biometric hardware and enrollment status
 */
export async function getBiometricCapability(): Promise<BiometricCapability> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    console.log("[Biometric] hasHardware:", hasHardware);
    if (!hasHardware) {
      return {
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
        biometricTypeLabel: "Biometrics",
      };
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    let hasPasscode = false;
    try {
      const level = await LocalAuthentication.getEnrolledLevelAsync();
      hasPasscode = level !== LocalAuthentication.SecurityLevel.NONE;
    } catch {}
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    console.log("[Biometric] isEnrolled:", isEnrolled, "hasPasscode:", hasPasscode, "types:", supportedTypes);

    let biometricTypeLabel: BiometricTypeLabel = "Biometrics";
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometricTypeLabel = Platform.OS === "ios" ? "Face ID" : "Face Unlock";
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometricTypeLabel = Platform.OS === "ios" ? "Touch ID" : "Fingerprint";
    }

    return {
      hasHardware,
      canAuthenticate: isEnrolled || hasPasscode,
      isEnrolled,
      supportedTypes,
      biometricTypeLabel: biometricTypeLabel as any,
    };
  } catch (error) {
    console.warn("[Biometric] Error checking capabilities:", error);
    return {
      hasHardware: false,
      isEnrolled: false,
      supportedTypes: [],
      biometricTypeLabel: "Biometrics",
    };
  }
}

// ---------------------------------------------------------------------------
// Prompt bookkeeping. The native Face ID sheet (and Alert.prompt) makes iOS emit
// AppState "inactive" -> "active". Anything listening to AppState (the lock shield)
// must be able to tell that this was OUR prompt and not the user leaving the app.
// ---------------------------------------------------------------------------
let promptInFlight = false;
let lastPromptEndedAt = 0;

/** true while a biometric prompt is on screen, or for a short cooldown right after it closes */
export function isBiometricPromptActive(): boolean {
  return promptInFlight || Date.now() - lastPromptEndedAt < 1500;
}

// A session that was RESTORED at cold start (stored JWT / Remember-Me renew) must be
// protected by the lock shield. A session created by the user just now (password /
// Face ID / Google / Apple login) must not be locked again straight after.
let sessionRestored = false;
export function markSessionRestored(): void {
  sessionRestored = true;
}
export function clearSessionRestored(): void {
  sessionRestored = false;
}
export function consumeSessionRestored(): boolean {
  const v = sessionRestored;
  sessionRestored = false;
  return v;
}

export interface BiometricAuthResult {
  success: boolean;
  /** user-facing message (never shown for cancellations - check `cancelled`) */
  error?: string;
  /** raw expo-local-authentication error code */
  code?: string;
  /** user (or OS) dismissed the prompt - not a failure, do not log out / show scary errors */
  cancelled?: boolean;
}

function friendlyError(code: string | undefined, label: string): string {
  switch (code) {
    case 'not_enrolled':
      return `No ${label} is set up on this device. Set it up in Settings and try again.`;
    case 'passcode_not_set':
      return 'Set a device passcode in Settings to use biometric sign-in.';
    case 'not_available':
      return `${label} is not available for MyToDoo. Check Settings > MyToDoo > Face ID, or use your passcode.`;
    case 'lockout':
      return `${label} is temporarily locked after too many attempts. Lock and unlock your phone with your passcode, then try again.`;
    case 'authentication_failed':
      return `${label} did not recognise you. Please try again.`;
    case 'timeout':
      return 'The request timed out. Please try again.';
    default:
      return `${label} authentication failed${code ? ` (${code})` : ''}. Please try again.`;
  }
}

const CANCEL_CODES = ['user_cancel', 'system_cancel', 'app_cancel', 'user_fallback'];

/**
 * Trigger native biometric prompt (Face ID / Fingerprint)
 */
export async function authenticateWithBiometrics(
  promptMessage = "Authenticate to access MyToDoo"
): Promise<BiometricAuthResult> {
  if (promptInFlight) {
    console.log("[Biometric] prompt already in flight - ignoring duplicate request");
    return { success: false, code: "in_progress", cancelled: true };
  }
  promptInFlight = true;
  try {
    const capability = await getBiometricCapability();
    console.log("[Biometric] capability:", JSON.stringify({
      hasHardware: capability.hasHardware,
      isEnrolled: capability.isEnrolled,
      canAuthenticate: capability.canAuthenticate,
      label: capability.biometricTypeLabel,
    }));
    if (!capability.canAuthenticate) {
      return {
        success: false,
        code: "not_enrolled",
        error: `${capability.biometricTypeLabel} is not set up on this device. Set it up (or a device passcode) in Settings and try again.`,
      };
    }

    // disableDeviceFallback:false => iOS uses LAPolicyDeviceOwnerAuthentication: Face ID first,
    // then the device passcode if Face ID is locked out / not recognised.
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: "Cancel",
      disableDeviceFallback: false,
      fallbackLabel: "Use Passcode",
    });
    console.log("[Biometric] prompt result:", JSON.stringify(result));

    if (result.success) {
      return { success: true };
    }
    const code = (result as any).error as string | undefined;
    if (code && CANCEL_CODES.includes(code)) {
      return { success: false, code, cancelled: true, error: "Authentication cancelled" };
    }
    return { success: false, code, error: friendlyError(code, capability.biometricTypeLabel) };
  } catch (error: any) {
    console.warn("[Biometric] authenticateAsync threw:", error);
    return { success: false, code: "exception", error: error?.message || "Biometric authentication failed" };
  } finally {
    promptInFlight = false;
    lastPromptEndedAt = Date.now();
  }
}

/**
 * Check if the user has opted-in to Biometric Login in Settings
 */
export async function isBiometricLoginEnabled(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return enabled === "true";
  } catch {
    return false;
  }
}

/**
 * Enable or disable Biometric Login
 */
export async function setBiometricLoginEnabled(enabled: boolean): Promise<boolean> {
  try {
    if (enabled) {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, "true");
    } else {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, "false");
      await clearBiometricCredentials();
    }
    console.log("[Biometric] enabled flag set to", enabled);
    return true;
  } catch (error) {
    console.error("[Biometric] Error setting biometric login state:", error);
    return false;
  }
}

/**
 * Verify an email/password against the backend WITHOUT touching the auth store, then
 * store it in the Keychain for Face ID sign-in. Used when Face ID is enabled from a
 * session that has no password at hand (restored token, Remember-Me renew, Google/Apple).
 */
export async function verifyAndSaveBiometricCredentials(
  email: string,
  password: string
): Promise<{ ok: boolean; message?: string }> {
  try {
    await axios.post(
      `${API_CONFIG.BASE_URL}/auth/login`,
      { email: email.trim().toLowerCase(), password: password.trim() },
      { headers: { "Content-Type": "application/json", Accept: "application/json" }, timeout: 30000 }
    );
  } catch (error: any) {
    const status = error?.response?.status;
    console.log("[Biometric] password verification failed, status:", status, error?.message);
    if (status === 400 || status === 401 || status === 404) {
      return { ok: false, message: "That password is incorrect. Face ID was not enabled." };
    }
    return { ok: false, message: "Could not verify your password (network or server problem). Please try again." };
  }
  const saved = await saveBiometricCredentials(email.trim().toLowerCase(), password.trim());
  return saved ? { ok: true } : { ok: false, message: "Could not save your credentials securely on this device." };
}

/** Do we already hold Keychain credentials for this account (or can we take them from Remember Me)? */
export async function hasBiometricCredentialsFor(email: string): Promise<boolean> {
  const existing = await getBiometricCredentials();
  if (existing && existing.email.toLowerCase() === email.trim().toLowerCase()) {
    console.log("[Biometric] Keychain credentials already present for this account");
    return true;
  }
  const remembered = await getRememberMeCredentials();
  if (remembered && remembered.email.toLowerCase() === email.trim().toLowerCase()) {
    console.log("[Biometric] adopting Remember-Me credentials for Face ID");
    return saveBiometricCredentials(remembered.email.toLowerCase(), remembered.password);
  }
  console.log("[Biometric] no stored credentials for this account - password needed");
  return false;
}

/**
 * Securely store credentials in iOS Keychain / Android Keystore for Biometric Login
 */
export async function saveBiometricCredentials(email: string, password: string): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(BIOMETRIC_EMAIL_KEY, email);
    await SecureStore.setItemAsync(BIOMETRIC_SECRET_KEY, password, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    console.log("[Biometric] credentials saved to Keychain");
    return true;
  } catch (error) {
    console.error("❌ Failed to save secure biometric credentials:", error);
    return false;
  }
}

/**
 * Retrieve securely stored credentials after successful biometric challenge
 */
export async function getBiometricCredentials(): Promise<{ email: string; password: string } | null> {
  try {
    const email = await SecureStore.getItemAsync(BIOMETRIC_EMAIL_KEY);
    const password = await SecureStore.getItemAsync(BIOMETRIC_SECRET_KEY);
    console.log("[Biometric] credentials present in Keychain:", !!(email && password));
    if (email && password) {
      return { email, password };
    }
    return null;
  } catch (error) {
    console.error("❌ Failed to retrieve secure biometric credentials:", error);
    return null;
  }
}

/**
 * Clear stored biometric credentials
 */
export async function clearBiometricCredentials(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_EMAIL_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_SECRET_KEY);
    console.log("🗑️ [BiometricAuth] Biometric credentials cleared");
  } catch (error) {
    console.warn("⚠️ Error clearing biometric credentials:", error);
  }
}
