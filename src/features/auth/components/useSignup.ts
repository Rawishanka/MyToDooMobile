// Custom hook for signup form state and logic

import API_CONFIG from "@/src/api/config";
import { useCreateSignUpToken, useVerifyOTP } from "@/src/api/user-api";
import { useGoogleSignIn } from "@/src/shared/hooks/useApi";
import { useCreateTask } from "@/src/shared/hooks/useTaskApi";
import { useAuthStore } from "@/src/store/auth-task-store";
import { useCreateTaskStore } from "@/src/store/create-task-store";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, BackHandler, TextInput } from "react-native";
import {
  extractCityFromAddress,
  extractRegionFromAddress,
  formatDateForAPI,
  validateForm,
} from "./signup-helpers";
import type {
  CountryData,
  LocationData,
  VerificationStep,
} from "./signup-types";
import { COUNTRIES } from "./signup-types";

export const useSignup = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser, setAuthData } = useAuthStore();
  const { mutateAsync: googleSignIn } = useGoogleSignIn();

  // Google OAuth Configuration
  const googleClientId =
    Constants.expoConfig?.extra?.googleClientId ||
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  const owner = Constants.expoConfig?.owner || "janidu5678";
  const slug = Constants.expoConfig?.slug || "MyToDooMobile";

  // Always use Expo auth proxy for better compatibility
  const redirectUri = `https://auth.expo.io/@${owner}/${slug}`;

  const [googleRequest, googleResponse, promptGoogleAsync] =
    Google.useIdTokenAuthRequest({
      clientId: googleClientId,
      redirectUri: redirectUri,
      scopes: ["openid", "profile", "email"],
    });
  const { myTask, resetTask } = useCreateTaskStore();
  const postTaskMutation = useCreateTask();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Location state - Default to Sri Lanka
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(
    COUNTRIES[2]
  );
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null
  );
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Verification state
  const [verificationStep, setVerificationStep] =
    useState<VerificationStep>(null);
  const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
  const [smsOtp, setSmsOtp] = useState(["", "", "", "", "", ""]);
  const [emailVerified, setEmailVerified] = useState(false);
  const [smsVerified, setSmsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Timer state
  const [emailTimer, setEmailTimer] = useState(57);
  const [smsTimer, setSmsTimer] = useState(57);

  // Refs for OTP inputs
  const emailOtpRefs = useRef<Array<TextInput | null>>([]);
  const smsOtpRefs = useRef<Array<TextInput | null>>([]);

  // API hooks
  const { mutateAsync: signUp } = useCreateSignUpToken();
  const { mutateAsync: verifyOTP } = useVerifyOTP();

  // Google OAuth Response Handler
  useEffect(() => {
    if (!googleResponse) return;

    if (googleResponse?.type === "success") {
      const { id_token, authentication } = (googleResponse as any).params;
      const token = id_token || authentication?.idToken;

      if (token) {
        handleGoogleSignInSuccess(token);
      } else {
        Alert.alert(
          "Authentication Error",
          "Unable to retrieve authentication token. Please try again.",
          [{ text: "OK" }]
        );
        setGoogleLoading(false);
      }
    } else if (googleResponse?.type === "error") {
      Alert.alert(
        "Google Sign-In Error",
        "There was an error connecting to Google. Please try again.",
        [{ text: "OK" }]
      );
      setGoogleLoading(false);
    } else if (googleResponse?.type === "dismiss") {
      setGoogleLoading(false);
    }
  }, [googleResponse]);

  // Handle hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (verificationStep) {
          Alert.alert(
            "Verification Required",
            "Please complete verification to continue.",
            [{ text: "OK" }]
          );
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [verificationStep])
  );

  // Timer effects
  useEffect(() => {
    if (verificationStep === "email" && emailTimer > 0) {
      const interval = setInterval(() => {
        setEmailTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [verificationStep, emailTimer]);

  useEffect(() => {
    if (verificationStep === "sms" && smsTimer > 0) {
      const interval = setInterval(() => {
        setSmsTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [verificationStep, smsTimer]);

  // Helper function to check if there's a pending task to post
  const hasPendingTask = () => {
    return myTask && myTask.title && myTask.title.trim() !== "";
  };

  // Helper function to convert task store data to API format
  const convertTaskToAPIFormat = () => {
    const taskDate =
      myTask.date ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
    const category =
      !myTask.isRemoval && myTask.category ? myTask.category : "General";

    // Extract location string - API expects location as string
    let locationString = "";
    if (selectedLocation) {
      locationString = selectedLocation.address;
    }

    return {
      title: myTask.title || "Untitled Task",
      category: category,
      details: myTask.description || "",
      dateType: "DoneBy",
      date: taskDate,
      time: myTask.time || "Anytime",
      location: locationString,
      locationType: !myTask.isRemoval
        ? myTask.locationType || "In-person"
        : "In-person",
      budget: myTask.budget || 0,
      currency: "LKR",
      images: [],
    };
  };

  // Helper function to post pending task after signup
  const postPendingTask = async () => {
    if (!hasPendingTask()) {
      return false;
    }

    try {
      // Wait for authentication token to be properly set in API client

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const taskData = convertTaskToAPIFormat();

      const result = await postTaskMutation.mutateAsync(taskData);

      // Reset task store after successful posting
      resetTask();

      // Add a small delay to ensure the task is fully saved on the server
      await new Promise((resolve) => setTimeout(resolve, 500));

      return true;
    } catch (error) {
      return false;
    }
  };

  // Form submission
  const handleSignUp = async () => {
    const formData = {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone,
      dateOfBirth,
      selectedCountry,
      selectedLocation,
    };

    if (!validateForm(formData)) return;

    try {
      setLoading(true);

      const response = await signUp({
        firstName,
        lastName,
        email,
        password,
        phone: `${selectedCountry.phoneCode}${phone}`,
        dateOfBirth: dateOfBirth ? formatDateForAPI(dateOfBirth) : "",
        location: {
          country: selectedCountry.name,
          countryCode: selectedCountry.code,
          suburb: selectedLocation ? selectedLocation.address : "",
          region: selectedLocation
            ? extractRegionFromAddress(selectedLocation.address)
            : "",
          city: selectedLocation
            ? extractCityFromAddress(selectedLocation.address)
            : "",
        },
      });

      if (response?.userId) {
        setUserId(response.userId);
      }

      setVerificationStep("email");
      setEmailTimer(57);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create account. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // OTP handlers
  const handleEmailOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    if (value.length > 1) {
      value = value.slice(-1);
    }

    const newOtp = [...emailOtp];
    newOtp[index] = value;
    setEmailOtp(newOtp);

    if (value && index < 5 && emailOtpRefs.current[index + 1]) {
      emailOtpRefs.current[index + 1]?.focus();
    }

    if (!value && index > 0 && emailOtpRefs.current[index - 1]) {
      emailOtpRefs.current[index - 1]?.focus();
    }
  };

  const handleSmsOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    if (value.length > 1) {
      value = value.slice(-1);
    }

    const newOtp = [...smsOtp];
    newOtp[index] = value;
    setSmsOtp(newOtp);

    if (value && index < 5 && smsOtpRefs.current[index + 1]) {
      smsOtpRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyEmail = async () => {
    const otpCode = emailOtp.join("");

    if (otpCode.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6-digit code");
      return;
    }

    try {
      setVerifyLoading(true);

      const response = await verifyOTP({
        email,
        otp: otpCode,
      });

      setEmailVerified(true);
      setVerificationStep("sms");
      setSmsTimer(57);

      // Backend automatically sends SMS after email verification
    } catch (error: any) {
      // Extract the actual error message from the backend
      let errorMessage = "Invalid verification code. Please try again.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert("Verification Failed", errorMessage);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerifySms = async () => {
    const otpCode = smsOtp.join("");

    if (otpCode.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6-digit code");
      return;
    }

    try {
      setVerifyLoading(true);

      const fullPhone = `${selectedCountry.phoneCode}${phone}`;

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/two-factor-auth/sms-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            otp: otpCode,
          }),
        }
      );

      const data = await response.json();

      // Backend returns: { verified: true, token: "...", user: {...}, message: "..." }
      if (data.verified === true) {
        setSmsVerified(true);

        // Close modal first
        setVerificationStep(null);

        // Small delay to let modal close
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Clear the form data for security
        const userEmail = email; // Save email before clearing
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFirstName("");
        setLastName("");
        setPhone("");
        setDateOfBirth(null);
        setSelectedLocation(null);

        // Navigate to login immediately

        router.replace("/(auth)/login" as any);

        // Show success message after navigation
        setTimeout(() => {
          Alert.alert(
            "Account Created Successfully!",
            `Your account has been verified. Please login with ${userEmail} to continue.`,
            [{ text: "OK" }]
          );
        }, 500);
      } else {
        Alert.alert("Error", data.message || "Invalid SMS code.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to verify SMS code.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      await fetch(`${API_CONFIG.BASE_URL}/two-factor-auth/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userId }),
      });
      setEmailTimer(57);
      Alert.alert("Sent!", "Verification code resent to your email.");
    } catch (error) {
      Alert.alert("Error", "Failed to resend email code.");
    }
  };

  const sendSmsCode = async () => {
    // Backend automatically sends SMS after email verification
    // This function is kept for manual resend only
  };

  const handleResendSms = async () => {
    try {
      const fullPhone = `${selectedCountry.phoneCode}${phone}`;

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/two-factor-auth/send-sms`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: fullPhone, email }),
        }
      );

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (data.success || data.verified) {
          setSmsTimer(57);
          Alert.alert("Sent!", "Verification code resent to your phone.");
        } else {
          Alert.alert(
            "Info",
            "SMS code may have been sent. Please check your messages."
          );
        }
      } else {
        // HTML response (404 or error page)

        Alert.alert(
          "SMS Resend Unavailable",
          "The SMS code was already sent when you verified your email. Please check your messages.",
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Info",
        "The SMS code was already sent. Please check your messages or wait for the timer to try again.",
        [{ text: "OK" }]
      );
    }
  };

  // Google Sign-In Success Handler
  const handleGoogleSignInSuccess = async (idToken: string) => {
    try {
      // Send the ID token to backend
      const result = await googleSignIn({ credential: idToken });

      if (result.user?.isVerified) {
        // User is already verified - complete signup and go to welcome

        Alert.alert(
          "Welcome Back!",
          "Your Google account is already verified. Welcome to MyToDoo!",
          [
            {
              text: "Continue",
              onPress: () => {
                router.replace("/(tabs)" as any);
              },
            },
          ]
        );
      } else {
        // User is not verified - show verification needed and go to 2FA

        // Set form data from Google response
        if (result.user?.email) setEmail(result.user.email);
        if (result.user?.firstName) setFirstName(result.user.firstName);
        if (result.user?.lastName) setLastName(result.user.lastName);
        if (result.user?.phone)
          setPhone(result.user.phone.replace(/^\+\d+/, "")); // Remove country code

        Alert.alert(
          "Account Not Verified",
          "Your Google account needs verification. Please verify your email and phone number.",
          [
            {
              text: "Verify Account",
              onPress: () => {
                setVerificationStep("email");
                setEmailTimer(57);
                // Send email verification
                handleResendEmail();
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Authentication Error",
        error?.response?.data?.message ||
          "Failed to authenticate with Google. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);

      if (!googleClientId) {
        Alert.alert(
          "Configuration Error",
          "Google Sign-In is not configured. Please contact support.",
          [{ text: "OK" }]
        );
        return;
      }

      if (!googleRequest) {
        Alert.alert("Error", "Google Sign-In is not ready. Please try again.");
        return;
      }

      const result = await promptGoogleAsync();
    } catch (error) {
      Alert.alert("Error", "Failed to start Google Sign-In. Please try again.");
      setGoogleLoading(false);
    }
  };

  const handleCloseVerification = () => {
    setVerificationStep(null);
    // Clear OTP inputs
    setEmailOtp(["", "", "", "", "", ""]);
    setSmsOtp(["", "", "", "", "", ""]);
  };

  return {
    // Form state
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    phone,
    dateOfBirth,
    showDatePicker,
    showPassword,
    showConfirmPassword,
    setFirstName,
    setLastName,
    setEmail,
    setPassword,
    setConfirmPassword,
    setPhone,
    setDateOfBirth,
    setShowDatePicker,
    setShowPassword,
    setShowConfirmPassword,

    // Location state
    selectedCountry,
    selectedLocation,
    showCountryPicker,
    setSelectedCountry,
    setSelectedLocation,
    setShowCountryPicker,

    // Verification state
    verificationStep,
    emailOtp,
    smsOtp,
    emailVerified,
    smsVerified,
    loading,
    verifyLoading,
    googleLoading,
    emailTimer,
    smsTimer,
    emailOtpRefs,
    smsOtpRefs,

    // Handlers
    handleSignUp,
    handleEmailOtpChange,
    handleSmsOtpChange,
    handleVerifyEmail,
    handleVerifySms,
    handleResendEmail,
    handleResendSms,
    handleCloseVerification,
    handleGoogleSignIn,
  };
};
