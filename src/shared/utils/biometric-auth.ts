import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const BIOMETRIC_ENABLED_KEY = "biometric_login_enabled";
const BIOMETRIC_EMAIL_KEY = "bio_auth_email";
const BIOMETRIC_SECRET_KEY = "bio_auth_credentials";

export type BiometricTypeLabel = "Face ID" | "Touch ID" | "Fingerprint" | "Face Unlock" | "Biometrics";

export interface BiometricCapability {
  hasHardware: boolean;
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
    if (!hasHardware) {
      return {
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
        biometricTypeLabel: "Biometrics",
      };
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    let biometricTypeLabel: BiometricTypeLabel = "Biometrics";
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometricTypeLabel = Platform.OS === "ios" ? "Face ID" : "Face Unlock";
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometricTypeLabel = Platform.OS === "ios" ? "Touch ID" : "Fingerprint";
    }

    return {
      hasHardware,
      isEnrolled,
      supportedTypes,
      biometricTypeLabel: biometricTypeLabel as any,
    };
  } catch (error) {
    console.warn("⚠️ [BiometricAuth] Error checking capabilities:", error);
    return {
      hasHardware: false,
      isEnrolled: false,
      supportedTypes: [],
      biometricTypeLabel: "Biometrics",
    };
  }
}

/**
 * Trigger native biometric prompt (Face ID / Fingerprint)
 */
export async function authenticateWithBiometrics(
  promptMessage = "Authenticate to access MyToDoo"
): Promise<{ success: boolean; error?: string }> {
  try {
    const capability = await getBiometricCapability();
    if (!capability.hasHardware || !capability.isEnrolled) {
      return { success: false, error: "Biometric authentication is not available or enrolled on this device." };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: "Cancel",
      disableDeviceFallback: false,
      fallbackLabel: "Use Passcode",
    });

    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error === "user_cancel" ? "User cancelled" : (result.error || "Authentication failed"),
      };
    }
  } catch (error: any) {
    console.warn("⚠️ [BiometricAuth] Authentication error:", error);
    return { success: false, error: error?.message || "Biometric authentication failed" };
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
export async function setBiometricLoginEnabled(enabled: boolean): Promise<void> {
  try {
    if (enabled) {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, "true");
    } else {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, "false");
      await clearBiometricCredentials();
    }
  } catch (error) {
    console.error("❌ Error setting biometric login state:", error);
  }
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
    console.log("🔒 [BiometricAuth] Credentials securely saved for biometric login");
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
