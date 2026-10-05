import TaskerDashboard from '@/src/features/dashboard/screens/dashboard';
import PrivacyPolicyScreen from '@/src/features/legal/screens/PrivacyPolicyScreen';
import { formatUserName, formatAvatarName } from '@/src/utils/formatUserName';
import TermsConditionsScreen from '@/src/features/legal/screens/TermsConditionsScreen';
import CommunityGuidelinesScreen from '@/src/features/legal/screens/CommunityGuidelinesScreen';
import ContactUs from '@/src/shared/components/custom_components/contact-us';
import EditProfileScreen from '@/src/shared/components/custom_components/editprofilescreen';
import FAQScreen from '@/src/shared/components/custom_components/faq-screen';
import LegalScreen from '@/src/shared/components/custom_components/legal-screen';
import Logout from '@/src/shared/components/custom_components/Logout';
import { useGetUserProfile, useGetUserRatingStats, useGetUserReviews, useUploadUserAvatar } from '@/src/shared/hooks/useUserProfileApi';
import { useGetMyTasks, useSubmitReview } from '@/src/shared/hooks/useTaskApi';
import { RatingReviewModal } from '@/src/features/tasks/components/RatingReviewModal';
import { useGetStripeAccountStatus, useUpdateStripeAccount } from '@/src/shared/hooks/useStripeConnectApi';
import { autoLoginForDevelopment } from '@/src/shared/utils/dev-auth';
import { isNetworkError } from '@/src/shared/utils/networkErrorHandler';
import { OCRAPI } from '@/src/api/ocr-api';
import { useAuthStore } from '@/src/store/auth-task-store';
import { Entypo, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useNetworkStatus } from '@/src/shared/hooks/useNetworkStatus';
import { NetworkAlert } from '@/src/shared/components/NetworkAlert';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppAlert } from '@/src/shared/components/AppAlert';
import { Alert, Image, Linking, Modal, Platform, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppLoader from '@/src/shared/components/AppLoader';

// Import rating components
import { GetMoreReviewsSection } from './user-profile/components/GetMoreReviewsSection';
import { OverallRatingSection } from './user-profile/components/OverallRatingSection';
import { ReviewsList } from './user-profile/components/ReviewsList';


import AccountInformation from './accountinformation';
import CreditsScreen from './credits-screen';
import CreateServiceScreen from './create-service-screen';
import IDVerificationScreen from './id-verification-screen';
import InviteFriendsScreen from './invite-friends-screen';
import InsuranceProtection from './isuranceprotection';
import MyServicesScreen from './my-services-screen';
import NotificationPreferences from './notificationpreferences';
import PaymentScreensApp from './paymentscreens';
import TaskAlerts from './taskalerts';
import { RFValue, TAB_BAR_CLEARANCE } from '@/src/shared/utils/responsive';
import { consumePendingAccountNavigation } from '@/src/shared/utils/pending-account-navigation';
import { useTheme } from '@/src/shared/theme';
import type { BiometricTypeLabel } from "@/src/shared/utils/biometric-auth";
import { getBiometricCapability, isBiometricLoginEnabled, setBiometricLoginEnabled, authenticateWithBiometrics, hasBiometricCredentialsFor, verifyAndSaveBiometricCredentials } from '@/src/shared/utils/biometric-auth';

export default function AccountScreen() {
  const { isDarkMode, toggleDarkMode, colors: themeColors } = useTheme();
  const { screen: screenParam, focus: focusParam } = useLocalSearchParams<{
    screen?: string;
    focus?: string;
    reviewId?: string;
    taskId?: string;
  }>();
  const [currentScreen, setCurrentScreen] = useState('account');
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricTypeLabel, setBiometricTypeLabel] = useState<BiometricTypeLabel>("Biometrics");
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const biometricBusyRef = useRef(false);

  // Re-read on every focus: the flag/credentials can change elsewhere (login screen, logout,
  // another account) while this tab stays mounted.
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      (async () => {
        try {
          const [cap, enabled] = await Promise.all([getBiometricCapability(), isBiometricLoginEnabled()]);
          console.log('[Biometric] profile focus: canAuthenticate =', cap.canAuthenticate, 'enabled =', enabled);
          if (!isMounted) return;
          setBiometricSupported(!!cap.canAuthenticate);
          setBiometricTypeLabel(cap.biometricTypeLabel);
          setBiometricEnabled(enabled);
        } catch (e) {
          console.warn('[Biometric] profile focus check failed:', e);
        }
      })();
      return () => { isMounted = false; };
    }, [])
  );

  // iOS-only native password prompt (Alert.prompt does not exist on Android)
  const askForPassword = (label: string) =>
    new Promise<string | null>((resolve) => {
      Alert.prompt(
        `Enable ${label} Login`,
        'Enter your MyToDoo password once. It is stored only in this device\'s secure Keychain and used to sign you in after you scan.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
          { text: 'Enable', onPress: (value?: string) => resolve(value ? value : null) },
        ],
        'secure-text',
        '',
        'default'
      );
    });

  const handleToggleBiometrics = async (newVal: boolean) => {
    if (biometricBusyRef.current) return;
    biometricBusyRef.current = true;
    try {
      if (!newVal) {
        await setBiometricLoginEnabled(false);
        setBiometricEnabled(false);
        return;
      }

      console.log('[Biometric] toggle ON requested');
      const authResult = await authenticateWithBiometrics('Verify your ' + biometricTypeLabel + ' to enable fast login');
      if (!authResult.success) {
        console.log('[Biometric] toggle ON aborted:', authResult.code);
        if (!authResult.cancelled) {
          AppAlert.alert(biometricTypeLabel + ' Not Enabled', authResult.error || 'Authentication failed.');
        }
        setBiometricEnabled(false);
        return;
      }

      // Face ID sign-in on the login screen needs email + password in the Keychain. A session
      // restored from a token, or created by Google/Apple, has no password - ask for it once.
      const email = useAuthStore.getState().user?.email;
      let haveCreds = false;
      if (email) {
        haveCreds = await hasBiometricCredentialsFor(email);
      }
      if (!haveCreds) {
        if (Platform.OS === 'ios' && email) {
          const pw = await askForPassword(biometricTypeLabel);
          if (!pw) {
            console.log('[Biometric] toggle ON aborted: no password entered');
            setBiometricEnabled(false);
            return;
          }
          const saved = await verifyAndSaveBiometricCredentials(email, pw);
          if (!saved.ok) {
            AppAlert.alert(biometricTypeLabel + ' Not Enabled', saved.message || 'Could not save your credentials.');
            setBiometricEnabled(false);
            return;
          }
        } else {
          // Cannot prompt here: credentials get stored automatically at the next password login.
          AppAlert.alert(
            biometricTypeLabel + ' Login',
            'Log out and sign in once with your email and password. ' + biometricTypeLabel + ' sign-in will be set up automatically.'
          );
        }
      }

      const ok = await setBiometricLoginEnabled(true);
      setBiometricEnabled(ok);
      if (!ok) AppAlert.alert('Error', 'Could not save this setting. Please try again.');
    } catch (e: any) {
      console.warn('[Biometric] toggle error:', e);
      AppAlert.alert('Error', e?.message || 'Something went wrong enabling ' + biometricTypeLabel + '.');
      setBiometricEnabled(false);
    } finally {
      biometricBusyRef.current = false;
    }
  };
  const [isPendingReviewsExpanded, setIsPendingReviewsExpanded] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const ratingSectionOffsetRef = useRef(0);
  const [editAccessStatus, setEditAccessStatus] = useState<'locked' | 'pending' | 'approved'>('locked');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  
  // ID Verification request flow states
  const [idVerificationStatus, setIdVerificationStatus] = useState<'locked' | 'pending' | 'approved'>('locked');
  const [showIdRequestModal, setShowIdRequestModal] = useState(false);
  const [showIdPendingModal, setShowIdPendingModal] = useState(false);
  
  // Bank account details modal
  const [showBankAccountModal, setShowBankAccountModal] = useState(false);
  const [reviewModalTask, setReviewModalTask] = useState<any | null>(null);
  const submitReviewMutation = useSubmitReview();

  // Local state for profile picture preview
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState<boolean>(false);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const openScreenFromParam = useCallback((screen?: string) => {
    if (!screen) return;
    const allowed = new Set([
      'payment',
      'credits',
      'invite-friends',
      'create-service',
      'my-services',
      'account-info',
      'notifications',
    ]);
    if (allowed.has(screen)) {
      setCurrentScreen(screen);
    }
  }, []);

  // Deep-link from notifications → open payment/ABN screen directly
  const openPaymentFromNotification = useCallback(() => {
    setCurrentScreen('payment');
  }, []);

  const scrollToRatingsSection = useCallback(() => {
    setCurrentScreen('account');
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(ratingSectionOffsetRef.current - 24, 0),
        animated: true,
      });
    }, 350);
  }, []);

  useEffect(() => {
    if (screenParam === 'payment') {
      openPaymentFromNotification();
    } else {
      openScreenFromParam(screenParam);
    }
  }, [screenParam, focusParam, openPaymentFromNotification, openScreenFromParam]);

  useEffect(() => {
    if (focusParam === 'ratings' && currentScreen === 'account') {
      scrollToRatingsSection();
    }
  }, [focusParam, currentScreen, scrollToRatingsSection]);

  useFocusEffect(
    useCallback(() => {
      const pending = consumePendingAccountNavigation();
      if (pending?.screen === 'payment') {
        openPaymentFromNotification();
        return;
      }
      if (
        pending?.screen === 'credits' ||
        pending?.screen === 'invite-friends' ||
        pending?.screen === 'create-service' ||
        pending?.screen === 'my-services' ||
        pending?.screen === 'account-info' ||
        pending?.screen === 'notifications'
      ) {
        setCurrentScreen(pending.screen);
        return;
      }
      if (pending?.focus === 'ratings' || pending?.screen === 'account') {
        scrollToRatingsSection();
        return;
      }
      if (screenParam === 'payment') {
        openPaymentFromNotification();
      } else if (screenParam) {
        openScreenFromParam(screenParam);
      } else if (focusParam === 'ratings') {
        scrollToRatingsSection();
      }
    }, [screenParam, focusParam, openPaymentFromNotification, openScreenFromParam, scrollToRatingsSection])
  );

  // � **AUTO-LOGIN for development**
  React.useEffect(() => {
    autoLoginForDevelopment();
  }, []);

  //  **NEW: Get real user data from API**
  const [showNetworkAlert, setShowNetworkAlert] = useState(false);
  const { isConnected } = useNetworkStatus();
  const prevConnectedRef = useRef(true);
  useEffect(() => {
    if (prevConnectedRef.current && !isConnected) {
      setShowNetworkAlert(true);
    }
    prevConnectedRef.current = isConnected;
  }, [isConnected]);

  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useUploadUserAvatar();
  const { data: myTasksForReviews } = useGetMyTasks({ section: 'all-tasks' });
  const { data: taskerTasksForReviews } = useGetMyTasks({
    role: 'tasker',
    section: 'all-tasks',
  });
  const { pendingReviewCount, pendingReviewTasks, targetReviewRole } = React.useMemo(() => {
    const posterList = (myTasksForReviews as any)?.data || (myTasksForReviews as any)?.tasks || [];
    const taskerList =
      (taskerTasksForReviews as any)?.data || (taskerTasksForReviews as any)?.tasks || [];
    const seen = new Set<string>();
    const tasks: any[] = [];
    let posterCount = 0;
    let taskerCount = 0;

    for (const task of posterList) {
      if (task?.status !== 'completed') continue;
      const rs = task.reviewStatus;
      if (rs && rs !== 'review_required' && rs !== 'none') continue;
      const id = String(task._id || task.id || '');
      if (id && !seen.has(id)) {
        seen.add(id);
        tasks.push({ ...task, targetRole: 'Poster' });
        posterCount++;
      }
    }

    for (const task of taskerList) {
      if (task?.status !== 'completed') continue;
      const rs = task.reviewStatus;
      if (rs && rs !== 'review_required' && rs !== 'none') continue;
      const id = String(task._id || task.id || '');
      if (id && !seen.has(id)) {
        seen.add(id);
        tasks.push({ ...task, targetRole: 'Tasker' });
        taskerCount++;
      }
    }

    const targetRole: 'Tasker' | 'Poster' = taskerCount > 0 && taskerCount >= posterCount ? 'Tasker' : 'Poster';

    return { 
      pendingReviewCount: seen.size, 
      pendingReviewTasks: tasks, 
      targetReviewRole: targetRole,
      posterReviewCount: posterCount,
      taskerReviewCount: taskerCount 
    };
  }, [myTasksForReviews, taskerTasksForReviews]);
  const { user: authUser, isAuthenticated, token, clearAuth } = useAuthStore();

  // **Get real user profile data from API**
  const {
    data: userProfileData,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch,
  } = useGetUserProfile();

  // **Get Stripe Connect account status**
  const { data: stripeAccountStatus, isLoading: isLoadingStripe, refetch: refetchStripeStatus } = useGetStripeAccountStatus(true);
  const updateStripeAccountMutation = useUpdateStripeAccount();
  const [isUpdatingBank, setIsUpdatingBank] = useState(false);

  const handleUpdateBankAccount = async () => {
    try {
      setIsUpdatingBank(true);
      const result = await updateStripeAccountMutation.mutateAsync({
        returnUrl: 'https://mytodoo.com/stripe-onboarding/return',
        refreshUrl: 'https://mytodoo.com/stripe-onboarding/refresh',
      });
      setShowBankAccountModal(false);
      await Linking.openURL(result.url);
      // Refetch status after user returns
      setTimeout(() => { refetchStripeStatus(); }, 2000);
    } catch (error: any) {
      const msg = error?.message || 'Failed to open bank account update page. Please try again.';
      AppAlert.alert('Update Failed', msg);
    } finally {
      setIsUpdatingBank(false);
    }
  };

  // **Get rating data for the current user**
  const userId = authUser?._id || authUser?.id || '';
  const {
    data: ratingData,
    isLoading: ratingLoading,
    error: ratingError,
  } = useGetUserRatingStats(userId, !!userId);

  // **Debug: Log rating data to understand the issue**
  React.useEffect(() => {
    if (ratingData) {
      console.log('📊 ===== RATING DATA DEBUG =====');
      console.log('📊 Average Rating:', ratingData.averageRating);
      console.log('📊 Total Reviews:', ratingData.totalReviews);
      console.log('📊 Rating Distribution:', ratingData.ratingDistribution);
      console.log('📊 As Poster:', ratingData.asPoster);
      console.log('📊 As Tasker:', ratingData.asTasker);
      console.log('📊 ===========================');
      
      // Calculate total reviews from asPoster + asTasker
      const totalFromRoles = (ratingData.asPoster?.totalReviews || 0) + (ratingData.asTasker?.totalReviews || 0);
      console.log('📊 Total from Roles (poster + tasker):', totalFromRoles);
    }
  }, [ratingData]);

  // **Get reviews for the current user**
  const [reviewsPage, setReviewsPage] = useState(1);
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
  } = useGetUserReviews(userId, reviewsPage, 10, undefined, !!userId);

  // 🔄 **Force profile refetch when user changes**
  React.useEffect(() => {
    if (isAuthenticated && token) {
      console.log("🔄 Auth state changed - triggering profile refetch");
      refetch();
    }
  }, [isAuthenticated, token, authUser?.email, authUser?._id, refetch]);

  // 🔄 **CRITICAL: Clear ALL user data when auth user changes to prevent cache persistence**
  React.useEffect(() => {
    console.log("🔄 User ID changed - clearing all cached data to prevent persistence", {
      userId: authUser?._id,
      userEmail: authUser?.email
    });
    
    // Clear any local state that might hold user data
    setSelectedImageUri(null);
    
    // Force refetch if authenticated
    if (isAuthenticated && token && authUser) {
      console.log("🔄 Forcing fresh profile fetch for new user");
      refetch();
    }
  }, [authUser?._id]); // Trigger only when user ID actually changes

  // 🔄 **Force profile refetch when component mounts**
  React.useEffect(() => {
    console.log("🔄 Profile screen mounted - forcing fresh data fetch");
    if (isAuthenticated && token) {
      refetch();
    }
  }, []);

  // 🔄 **Clear selected image when profile data updates with new avatar**
  React.useEffect(() => {
    if (userProfileData?.avatar && selectedImageUri) {
      // Only clear preview if we have fresh avatar data from API
      console.log("✅ Avatar updated in profile data, clearing preview");
      setSelectedImageUri(null);
      setAvatarLoadFailed(false); // Reset avatar load state when new data arrives
    }
  }, [userProfileData?.avatar, userProfileData?._id]); // Also depend on user ID to prevent cross-user issues

  // 🔄 **Clear selected image when user changes - prevents cache persistence**
  React.useEffect(() => {
    console.log("🔄 User changed - clearing selected image preview and resetting avatar state");
    setSelectedImageUri(null);
    setAvatarLoadFailed(false); // Reset avatar load state for new user
  }, [authUser?._id, authUser?.email]);

  // 🔧 **CRITICAL FIX: Only use fresh API data, NO MOCK DATA to prevent cache persistence**
  let userData: any = userProfileData;

  // 🚨 **PREVENT CACHE PERSISTENCE: Multiple validation layers**
  // Check if we have authentication error (401, token expired, etc.)
  const isAuthError = profileError && (
    (profileError as any)?.response?.status === 401 ||
    (profileError as any)?.isAuthError ||
    (profileError as any)?.message?.includes('Not authenticated') ||
    (profileError as any)?.message?.includes('token')
  );

  // If auth error detected, clear auth and redirect
  React.useEffect(() => {
    if (isAuthError) {
      console.log("❌ Authentication error detected - clearing auth and redirecting to login");
      clearAuth().then(() => {
        router.replace('/(auth)/login');
      });
    }
  }, [isAuthError]);

  // Handle missing authentication - use useEffect to avoid setState during render
  React.useEffect(() => {
    if (!isAuthenticated || !token) {
      console.log("⚠️ Not authenticated - redirecting to login");
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, token]);

  // Handle missing user data - use useEffect to avoid setState during render
  React.useEffect(() => {
    if (isAuthenticated && token && !authUser?._id && !isLoadingProfile) {
      console.log("⚠️ No user data in auth store - clearing auth");
      clearAuth().then(() => {
        router.replace('/(auth)/login');
      });
    }
  }, [isAuthenticated, token, authUser?._id, isLoadingProfile]);

  // 1. No authentication = no data
  // 2. API error = no data  
  // 3. Mismatched user = no data
  if (!isAuthenticated || !token) {
    return null; // useEffect will handle redirect
  } else if (!authUser?._id && !isLoadingProfile) {
    return null; // useEffect will handle clearing auth and redirect
  } else if (profileError && !userData) {
    console.log("⚠️ Profile API error - no profile data to prevent cache persistence");
    userData = null;
  } else if (userData && authUser?._id && userData._id && userData._id !== authUser._id) {
    console.log("⚠️ User ID mismatch - clearing cached data", {
      cachedUserId: userData._id,
      currentUserId: authUser._id
    });
    userData = null; // Clear mismatched user data
    refetch(); // Force fresh fetch for correct user
  }

  // 🚨 **DEBUG: Log authentication state**
  console.log("🔍 Profile Screen Debug:", {
    hasToken: !!token,
    hasUserData: !!userData,
    isAuthenticated,
    isVerified: userData?.isVerified,
    profileError: profileError?.message,
    tokenPreview: token?.substring(0, 20) + "...",
    authUserDetails: authUser ? {
      id: authUser.id || authUser._id,
      email: authUser.email,
      firstName: authUser.firstName
    } : undefined,
    userDataDetails: userData ? {
      id: userData.id || userData._id,
      email: userData.email,
      firstName: userData.firstName
    } : undefined
  });

  // 🚨 **Show loading while fetching profile data**
  if (isLoadingProfile) {
    console.log("⏳ Loading profile data...");
    return (
      <View style={styles.loadingContainer}>
        <AppLoader size={32} color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Handle avatar change
  const handleChangeAvatar = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      AppAlert.alert('Permission Denied', 'We need permission to access your photos to change your profile picture.');
      return;
    }
    
    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      
      // Set selected image for immediate preview
      setSelectedImageUri(imageUri);

      // 🔍 OCR validation — check for sensitive data before uploading
      try {
        const validation = await OCRAPI.validateImageForUpload(imageUri);
        if (!validation.isValid) {
          setSelectedImageUri(null);
          AppAlert.alert(
            'Sensitive Data Detected',
            `This image contains sensitive information and cannot be uploaded:\n\n${validation.reason}\n\nPlease use a photo without personal contact details.`,
            [{ text: 'OK' }]
          );
          return;
        }
      } catch (ocrError) {
        // OCR service unavailable — allow upload to proceed
        if (!isNetworkError(ocrError) && __DEV__) {
          console.warn('⚠️ OCR validation error (allowing upload):', ocrError);
        }
      }
      
      // Upload avatar via CDN (pass URI directly, CDN upload handled inside)
      uploadAvatar(imageUri, {
        onSuccess: (response) => {
          console.log("✅ Avatar upload successful, response:", response);
          AppAlert.alert('Success', 'Profile picture updated successfully!');
          
          // Reset avatar load state since we have a new upload
          setAvatarLoadFailed(false); // New upload means we should try the new avatar
          
          // Try to refetch profile data, but don't clear preview yet
          if (isAuthenticated && token) {
            refetch().then(() => {
              console.log("✅ Profile refetch successful, clearing preview");
              // Give a small delay before clearing preview to ensure new image loads
              setTimeout(() => {
                setSelectedImageUri(null);
              }, 1500); // 1.5 second delay to allow new S3 image to be accessible
            }).catch((error: unknown) => {
              console.warn("⚠️ Profile refetch failed after upload, keeping preview:", error);
              // Don't clear selectedImageUri so the uploaded image stays visible
              // The preview will serve as the current avatar until next successful fetch
            });
          } else {
            console.warn("⚠️ Not authenticated for refetch, keeping uploaded image preview");
            // Keep the preview showing since we can't refetch
          }
        },
        onError: (error: any) => {
          if (!isNetworkError(error) && __DEV__) {
            console.warn('⚠️ Avatar upload error:', error?.message);
          }
          setSelectedImageUri(null); // Reset preview on error
          AppAlert.alert(
            'Upload Failed', 
            error?.message || 'Failed to upload profile picture. Please try again.',
            [{ text: 'OK' }]
          );
        }
      });
    }
  };

  // Handle loading state - but only if we're authenticated
  if (isLoadingProfile && !userData && isAuthenticated && token) {
    return (
      <View style={styles.loadingContainer}>
        <AppLoader size={32} color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Handle error state - but only if we're authenticated and have an error
  if (profileError && !userData && isAuthenticated && token) {
    // Check if this is an authentication error (401 or token expired)
    const isAuthError = (profileError as any)?.isAuthError || 
                        (profileError as any)?.isTokenExpired ||
                        (profileError as any)?.status === 401 ||
                        (profileError as any)?.response?.status === 401;
    
    // If it's an auth error, show loading state while API interceptor handles auto-logout
    if (isAuthError) {
      console.log("⏳ Auth error detected - waiting for auto-logout redirect...");
      return (
        <View style={styles.loadingContainer}>
          <AppLoader size={32} color="#FFFFFF" />
          <Text style={styles.loadingText}>Signing out...</Text>
        </View>
      );
    }
    
    // For non-auth errors, show the error UI
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FCA5A5" />
        <Text style={styles.errorTitle}>Failed to load profile</Text>
        <Text style={styles.errorSubtitle}>
          Could not load your profile. Please check your connection and try again.
        </Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const navigateToPayment = () => {
    setCurrentScreen('payment');
  };

  const navigateToAccount = () => {
    setCurrentScreen('account');
    // Refresh user profile when returning to account screen
    refetch();
  };

  const navigateToCredits = () => {
    setCurrentScreen('credits');
  };

  const navigateToInviteFriends = () => {
    setCurrentScreen('invite-friends');
  };

  const navigateToCreateService = () => {
    setCurrentScreen('create-service');
  };

  const navigateToMyServices = () => {
    setCurrentScreen('my-services');
  };

  const navigateToEditService = (listingId: string) => {
    setEditingServiceId(listingId);
    setCurrentScreen('edit-service');
  };

  const navigateToAccountInfo = () => {
    setCurrentScreen('account-info');
  };

  const navigateToNotifications = () => {
    setCurrentScreen('notifications');
  };

  const navigateToTaskAlerts = () => {
    setCurrentScreen('task-alerts');
  };

  const navigateToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const navigateToInsuranceProtection = () => {
    setCurrentScreen('insurance-protection');
  };

  const navigateToProfileUpdate = () => {
    // Always allow navigation to edit screen
    // Status check happens when user clicks Save button
    setCurrentScreen('profile-update');
  };

  const handleSendRequest = async () => {
    setIsSendingRequest(true);
    setRequestError(null);
    
    try {
      // TODO: Replace with actual backend API call when endpoint is ready
      // Example:
      // const response = await fetch(`${API_CONFIG.BASE_URL}/users/request-edit-access`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     userId: userId,
      //     requestType: 'profile_edit',
      //     requestedAt: new Date().toISOString()
      //   })
      // });
      // const data = await response.json();
      // 
      // if (!data.success) {
      //   throw new Error(data.message || 'Failed to send request');
      // }
      
      console.log('📤 Sending profile edit access request to admin...');
      console.log('User ID:', userId);
      console.log('User Email:', authUser?.email);
      
      // Simulate API call for now (remove this when backend is ready)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update status to pending after successful request
      setEditAccessStatus('pending');
      setShowRequestModal(false);
      
      // Show success/pending modal
      setTimeout(() => {
        setShowPendingModal(true);
      }, 300);
      
      console.log('✅ Profile edit access request sent successfully');
    } catch (error: any) {
      console.error('❌ Failed to send edit access request:', error);
      setRequestError(error.message || 'Failed to send request. Please try again.');
    } finally {
      setIsSendingRequest(false);
    }
  };

  const navigateToFAQ = () => {
    setCurrentScreen('faq');
  };

  const navigateToCommunityGuidelines = () => {
    setCurrentScreen('community-guidelines');
  };

  const navigateToPrivacyPolicy = () => {
    setCurrentScreen('privacy-policy');
  };

  const navigateToTermsConditions = () => {
    setCurrentScreen('terms-conditions');
  };

  const navigateToLegalScreen = () => {
    setCurrentScreen('legal');
  };

  const navigateToLogoutScreen = () => {
    setCurrentScreen('logout');
  }

  const navigateToContactUs = () => {
    setCurrentScreen('contact-us');
  };

  const navigateToIDVerification = () => {
    setCurrentScreen('id-verification');
  };

  const handleSendIdVerificationRequest = async () => {
    setIsSendingRequest(true);
    setRequestError(null);
    
    try {
      // TODO: Replace with actual backend API call when endpoint is ready
      console.log('📤 Sending ID verification access request to admin...');
      console.log('User ID:', userId);
      
      // Simulate API call for now (remove this when backend is ready)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIdVerificationStatus('pending');
      setShowIdRequestModal(false);
      
      setTimeout(() => {
        setShowIdPendingModal(true);
      }, 300);
      
      console.log('✅ ID verification access request sent successfully');
    } catch (error: any) {
      console.error('❌ Failed to send ID verification request:', error);
      setRequestError(error.message || 'Failed to send request. Please try again.');
    } finally {
      setIsSendingRequest(false);
    }
  };

  // If profile update screen is selected, show edit profile (use EditProfileScreen with all location fields)
  if (currentScreen === 'profile-update') {
    return <EditProfileScreen 
      onBack={navigateToAccount} 
      onSave={undefined}
      userData={userData}
      onNavigateToIDVerification={navigateToIDVerification}
    />;
  }

  // If edit profile screen is selected, show edit profile
  if (currentScreen === 'edit-profile') {
    return <EditProfileScreen 
      onBack={navigateToAccount} 
      onSave={undefined}
      userData={userData}
      onNavigateToIDVerification={navigateToIDVerification}
    />;
  }

  // If payment screen is selected, show payment screens
  if (currentScreen === 'payment') {
    return <PaymentScreensApp onBackToAccount={navigateToAccount} focusAbn={focusParam === 'abn'} />;
  }

  if (currentScreen === 'credits') {
    return (
      <CreditsScreen
        onBack={navigateToAccount}
        onNavigateToInvite={navigateToInviteFriends}
      />
    );
  }

  if (currentScreen === 'invite-friends') {
    return <InviteFriendsScreen onBack={navigateToAccount} />;
  }

  if (currentScreen === 'create-service') {
    return (
      <CreateServiceScreen
        onBack={navigateToAccount}
        onCreated={() => setCurrentScreen('my-services')}
        onNeedAbn={() => setCurrentScreen('payment')}
      />
    );
  }

  if (currentScreen === 'my-services') {
    return (
      <MyServicesScreen
        onBack={navigateToAccount}
        onCreate={navigateToCreateService}
        onEdit={navigateToEditService}
      />
    );
  }

  if (currentScreen === 'edit-service' && editingServiceId) {
    return (
      <CreateServiceScreen
        listingId={editingServiceId}
        onBack={() => setCurrentScreen('my-services')}
        onCreated={() => setCurrentScreen('my-services')}
        onNeedAbn={() => setCurrentScreen('payment')}
      />
    );
  }

  // If account info screen is selected, show account information
  if (currentScreen === 'account-info') {
    return <AccountInformation onBack={navigateToAccount} />;
  }

  // If notifications screen is selected, show notification preferences
  if (currentScreen === 'notifications') {
    return <NotificationPreferences onBack={navigateToAccount} userData={userData} />;
  }

  // If task alerts screen is selected, show task alerts
  if (currentScreen === 'task-alerts') {
    return <TaskAlerts onBack={navigateToAccount} />;
  }

  // If dashboard screen is selected, show tasker dashboard
  if (currentScreen === 'dashboard') {
    return <TaskerDashboard onBack={navigateToAccount} />;
  }

  if (currentScreen === 'insurance-protection') {
    return <InsuranceProtection onBack={navigateToAccount} />;
  }

  if (currentScreen === 'faq') {
    return <FAQScreen visible={true} onClose={navigateToAccount} onContactSupport={navigateToContactUs} />;
  }

  if (currentScreen === 'community-guidelines') {
    return <CommunityGuidelinesScreen onBack={navigateToAccount} />;
  }

  if (currentScreen === 'privacy-policy') {
    return <PrivacyPolicyScreen onBack={navigateToAccount} />;
  }

  if (currentScreen === 'terms-conditions') {
    return <TermsConditionsScreen onBack={navigateToAccount} />;
  }

  if (currentScreen === 'legal') {
    return <LegalScreen onBack={navigateToAccount} />;
  }

  if (currentScreen === 'logout') {
    return <Logout onBack={navigateToAccount} />;
  } 

  if (currentScreen === 'contact-us') {
    return <ContactUs onBack={navigateToAccount} />;
  }

  if (currentScreen === 'id-verification') {
    return <IDVerificationScreen onBack={navigateToAccount} userData={userData} />;
  }

  // Otherwise show account screen
  return (
    <View style={[styles.root, isDarkMode && { backgroundColor: '#0B1120' }]}>
    <StatusBar barStyle="light-content" />
    {!isDarkMode && (
      <LinearGradient
        colors={['#003399', '#00287A']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    )}
    <ScrollView keyboardShouldPersistTaps="handled" 
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: TAB_BAR_CLEARANCE }}
      showsVerticalScrollIndicator={false}
    >
      {/* Network Alert */}
      <NetworkAlert
        visible={showNetworkAlert}
        onClose={() => setShowNetworkAlert(false)}
        title="No Internet Connection"
        message="Please check your Wi-Fi or mobile data. Your profile data may not load correctly."
        actionText="OK"
      />
      {/* Header Section */}
      <View style={[styles.header, isDarkMode && styles.headerDark, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
        <TouchableOpacity onPress={handleChangeAvatar} disabled={isUploadingAvatar}>
          <View>
            <Image
              source={{ 
                uri: selectedImageUri || // Show selected image first (highest priority)
                     (!avatarLoadFailed && (userData?.avatar || userData?.profilePicture)) || // Only try S3 if not failed
                     `https://ui-avatars.com/api/?name=${formatAvatarName(userData?.firstName, userData?.lastName)}&background=003399&color=fff&size=120`
              }}
              style={styles.profileImage}
              onError={(error) => {
                console.log("🖼️ Image load error:", error.nativeEvent.error);
                const currentUri = userData?.avatar || userData?.profilePicture;
                console.log("🖼️ Failed to load avatar URL:", currentUri);
                
                // If it's an S3 URL that failed, mark avatar as failed
                if (currentUri && !selectedImageUri && !avatarLoadFailed) { // Only mark failed once
                  console.log("🚫 Marking avatar as failed, will show initials");
                  setAvatarLoadFailed(true);
                }
              }}
              onLoad={() => {
                // Only log success for S3 images, don't change state for initials avatar
                const currentUri = userData?.avatar || userData?.profilePicture;
                if (currentUri && !selectedImageUri && avatarLoadFailed) {
                  console.log("🖼️ Avatar loaded successfully after previous failure");
                  setAvatarLoadFailed(false); // S3 image loaded successfully
                }
              }}
            />
            {isUploadingAvatar && (
              <View style={styles.uploadingOverlay}>
                <AppLoader size={32} color="#fff" />
              </View>
            )}
            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>

        <Text style={[styles.name, isDarkMode && { color: '#F8FAFC' }]}>
          {formatUserName(userData?.firstName, userData?.lastName)}
        </Text>
        <Text style={[styles.location, isDarkMode && { color: '#94A3B8' }]}>
          {(() => {
            if (!userData?.location) return 'Location not set';
            
            const loc = userData.location;
            
            // Handle string location
            if (typeof loc === 'string') {
              return loc.trim() || 'Location not set';
            }
            
            // Handle object location
            if (typeof loc === 'object') {
              // Build location string - show only suburb to avoid duplication
              // Filter out empty, null, undefined, and "Not specified" values
              
              const isValidValue = (value: any) => {
                return value && 
                       value !== 'Not specified' && 
                       value !== 'not specified' && 
                       value.trim().length > 0;
              };
              
              // Priority: Show suburb only (cleanest display)
              if (isValidValue((loc as any).suburb)) {
                return (loc as any).suburb;
              }
              
              // Fallback: Show city if no suburb
              if (isValidValue((loc as any).city)) {
                return (loc as any).city;
              }
              
              // Fallback: Show region/state if no city
              if (isValidValue((loc as any).region)) {
                return (loc as any).region;
              }
              if (isValidValue((loc as any).state)) {
                return (loc as any).state;
              }
              
              // Last resort: Show country
              if (isValidValue((loc as any).country)) {
                return (loc as any).country;
              }
              
              // Try nested address format
              const nested = (loc as any).address;
              if (nested && typeof nested === 'object') {
                if (nested.suburb) return nested.suburb;
                if (nested.city) return nested.city;
                if (nested.state) return nested.state;
                if (nested.country) return nested.country;
              }
              
              // Try address string
              if ((loc as any).address && typeof (loc as any).address === 'string') {
                return (loc as any).address.trim() || 'Location not set';
              }
            }
            
            return 'Location not set';
          })()}
        </Text>

        {userData?.badges && (
          <View style={styles.badgeRow}>
            {[
              { key: 'mobile', label: 'Mobile', on: !!userData.badges.mobile },
              { key: 'email', label: 'Email', on: !!userData.badges.email },
              { key: 'abn', label: 'ABN', on: !!userData.badges.abn },
              { key: 'stripe', label: 'Stripe', on: !!userData.badges.stripe },
              { key: 'id', label: 'ID Verified', on: !!userData.badges.id },
            ].map((badge) => (
              <View
                key={badge.key}
                style={[
                  styles.profileBadge,
                  badge.on ? styles.profileBadgeVerified : styles.profileBadgeUnverified,
                ]}
              >
                <Ionicons
                  name={badge.on ? 'shield-checkmark' : 'shield-outline'}
                  size={13}
                  color={badge.on ? '#4ADE80' : 'rgba(255,255,255,0.65)'}
                />
                <Text
                  style={[
                    styles.profileBadgeText,
                    badge.on ? styles.profileBadgeTextVerified : styles.profileBadgeTextUnverified,
                  ]}
                >
                  {badge.label}{badge.on ? ' ✓' : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Bio / Description */}
        {userData?.bio ? (
          <Text style={styles.bioHeaderText} numberOfLines={3}>
            {userData.bio}
          </Text>
        ) : null}
        
        {/* Member since (month + year) */}
        {(() => {
          const created = userData?.createdAt ? new Date(userData.createdAt) : null;
          if (!created || isNaN(created.getTime())) return null;
          return (
            <Text style={styles.memberSinceText}>
              Member since {created.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
          );
        })()}

        {/* Rating and Stats */}
        {userData && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#FBBF24" />
              <Text style={styles.statText}>
                {(() => {
                  // Use ratingData (from /rating-stats API) as the source of truth
                  // userData.rating from /auth/profile can have a default value even with 0 reviews
                  const actualRating = ratingData?.averageRating ?? 0;
                  const actualReviews = ratingData?.totalReviews ?? 0;
                  // If no reviews exist, show 0.0/5 regardless of what userData.rating says
                  if (actualReviews === 0 && (!ratingData || ratingData.averageRating === 0)) {
                    return '0.0/5';
                  }
                  return `${Number(actualRating).toFixed(1)}/5`;
                })()}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statText}>{userData.completedTasks || 0} tasks completed</Text>
            </View>
          </View>
        )}
        
        {/* Edit Icon */}
        <TouchableOpacity 
          style={styles.editIconButton} 
          onPress={navigateToProfileUpdate}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Skills Section */}
      {(() => {
        const skills = userData?.skills;
        if (!skills || typeof skills !== 'object' || Array.isArray(skills)) return null;
        
        const typedSkills = skills as {
          goodAt?: string[];
          transport?: string[];
          languages?: string[];
          qualifications?: string[];
          experience?: string[];
        };
        
        return (
          <View style={[styles.skillsSection, isDarkMode && { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' }]}>
            <Text style={[styles.skillsSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>Skills</Text>
            
            {/* What are you good at? */}
            {typedSkills.goodAt && typedSkills.goodAt.length > 0 && (
              <View style={styles.skillCategory}>
                <Text style={[styles.skillCategoryTitle, isDarkMode && { color: '#94A3B8' }]}>What are you good at?</Text>
                <View style={styles.skillTagsContainer}>
                  {typedSkills.goodAt.map((skill, index) => (
                    <View key={index} style={[styles.skillTagDisplay, isDarkMode && { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' }]}>
                      <Text style={[styles.skillTagDisplayText, isDarkMode && { color: '#38BDF8' }]}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* How do you get around? */}
            {typedSkills.transport && typedSkills.transport.length > 0 && (
              <View style={styles.skillCategory}>
                <Text style={[styles.skillCategoryTitle, isDarkMode && { color: '#94A3B8' }]}>How do you get around?</Text>
                <View style={styles.skillTagsContainer}>
                  {typedSkills.transport.map((trans, index) => (
                    <View key={index} style={[styles.skillTagDisplay, isDarkMode && { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' }]}>
                      <Text style={[styles.skillTagDisplayText, isDarkMode && { color: '#38BDF8' }]}>{trans}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* Languages */}
            {typedSkills.languages && typedSkills.languages.length > 0 && (
              <View style={styles.skillCategory}>
                <Text style={[styles.skillCategoryTitle, isDarkMode && { color: '#94A3B8' }]}>Languages</Text>
                <View style={styles.skillTagsContainer}>
                  {typedSkills.languages.map((lang, index) => (
                    <View key={index} style={[styles.skillTagDisplay, isDarkMode && { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' }]}>
                      <Text style={[styles.skillTagDisplayText, isDarkMode && { color: '#38BDF8' }]}>{lang}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* Qualifications */}
            {typedSkills.qualifications && typedSkills.qualifications.length > 0 && (
              <View style={styles.skillCategory}>
                <Text style={[styles.skillCategoryTitle, isDarkMode && { color: '#94A3B8' }]}>Qualifications</Text>
                <View style={styles.skillTagsContainer}>
                  {typedSkills.qualifications.map((qual, index) => (
                    <View key={index} style={[styles.skillTagDisplay, isDarkMode && { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' }]}>
                      <Text style={[styles.skillTagDisplayText, isDarkMode && { color: '#38BDF8' }]}>{qual}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* Work Experience */}
            {typedSkills.experience && typedSkills.experience.length > 0 && (
              <View style={styles.skillCategory}>
                <Text style={[styles.skillCategoryTitle, isDarkMode && { color: '#94A3B8' }]}>Work Experience</Text>
                <View style={styles.skillTagsContainer}>
                  {typedSkills.experience.map((exp, index) => (
                    <View key={index} style={[styles.skillTagDisplay, isDarkMode && { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' }]}>
                      <Text style={[styles.skillTagDisplayText, isDarkMode && { color: '#38BDF8' }]}>{exp}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        );
      })()}

      {/* Rating and Reviews Section */}
      {userId && (
        <View
          style={styles.ratingSection}
          onLayout={(event) => {
            ratingSectionOffsetRef.current = event.nativeEvent.layout.y;
          }}
        >
          {ratingLoading && !ratingData ? (
            <View style={styles.ratingLoadingContainer}>
              <AppLoader size={22} color="#FFFFFF" />
              <Text style={styles.ratingLoadingText}>Loading ratings...</Text>
            </View>
          ) : ratingData ? (
            <>
              {(() => {
                // Calculate actual total reviews (use asPoster + asTasker if main totalReviews is 0)
                const actualTotalReviews = ratingData.totalReviews > 0 
                  ? ratingData.totalReviews 
                  : (ratingData.asPoster?.totalReviews || 0) + (ratingData.asTasker?.totalReviews || 0);
                
                console.log('📊 Displaying Total Reviews:', actualTotalReviews);
                console.log('📊 Rating Distribution:', JSON.stringify(ratingData?.ratingDistribution));
                
                return (
                  <OverallRatingSection
                    averageRating={ratingData?.averageRating ?? 0}
                    totalReviews={actualTotalReviews}
                    ratingDistribution={ratingData?.ratingDistribution || {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}}
                    completionRate={
                      // If we have both completed tasks and reviews, calculate review rate
                      // Otherwise fall back to API completion_rate field, or 0
                      userData?.completedTasks && userData.completedTasks > 0
                        ? actualTotalReviews > 0
                          ? Math.min(Math.round((actualTotalReviews / userData.completedTasks) * 100), 100)
                          : (userData?.completionRate ?? userData?.completion_rate ?? 0)
                        : 0
                    }
                    totalTasks={userData?.completedTasks ?? 0}
                  />
                );
              })()}
              
              {/* Hidden: Get More Reviews Section - kept for future use */}
              {false && (
                <GetMoreReviewsSection 
                  userId={userId}
                  userName={userData?.firstName || 'User'}
                />
              )}
              
              <ReviewsList userId={userId} />
            </>
          ) : userData ? (
            <>
              <OverallRatingSection
                averageRating={0}
                totalReviews={0}
                ratingDistribution={{"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}}
                completionRate={userData?.completionRate ?? userData?.completion_rate ?? 0}
                totalTasks={userData.completedTasks ?? 0}
              />
              <View style={styles.noRatingContainer}>
                <Ionicons name="chatbox-outline" size={48} color="rgba(255,255,255,0.5)" />
                <Text style={styles.noRatingText}>No reviews yet</Text>
                <Text style={styles.noRatingSubtext}>Complete tasks to receive reviews from clients</Text>
              </View>
            </>
          ) : (
            <View style={styles.noRatingContainer}>
              <Ionicons name="star-outline" size={48} color="rgba(255,255,255,0.5)" />
              <Text style={styles.noRatingText}>No ratings yet</Text>
              <Text style={styles.noRatingSubtext}>Complete tasks to start building your reputation</Text>
            </View>
          )}
        </View>
      )}

      {/* Settings List */}
      <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155', shadowColor: '#000', shadowOpacity: 0.3 }]}>
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#94A3B8' }]}>PROFILE</Text>
        <MenuItem 
          icon={<Ionicons name="person-outline" size={20} color="#003399" />}
          text="Edit Profile"
          onPress={navigateToProfileUpdate} 
          subtext={editAccessStatus === 'pending' 
            ? "Pending admin approval - changes won't save yet" 
            : "Update your personal information"}
          disabled={false}
        />
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#94A3B8' }]}>ACCOUNT SETTINGS</Text>
        
        {/* Stripe Connect Account Status Card */}
        {stripeAccountStatus && !isLoadingStripe && (
          <View style={[styles.stripeAccountCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <View style={styles.stripeAccountHeader}>
              <View style={styles.stripeAccountTitleRow}>
                <MaterialIcons name="account-balance" size={20} color={isDarkMode ? '#38BDF8' : '#FFFFFF'} />
                <Text style={[styles.stripeAccountTitle, isDarkMode && { color: '#F8FAFC' }]}>Payment Account</Text>
              </View>
              <View style={[
                styles.statusBadge,
                stripeAccountStatus.status === 'active' && styles.statusBadgeActive,
                stripeAccountStatus.status === 'pending' && styles.statusBadgePending,
                stripeAccountStatus.status === 'restricted' && styles.statusBadgeRestricted
              ]}>
                <Text style={[
                  styles.statusBadgeText,
                  stripeAccountStatus.status === 'active' && styles.statusBadgeTextActive,
                  stripeAccountStatus.status === 'pending' && styles.statusBadgeTextPending,
                  stripeAccountStatus.status === 'restricted' && styles.statusBadgeTextRestricted
                ]}>
                  {stripeAccountStatus.status === 'active' ? '● Active' : 
                   stripeAccountStatus.status === 'pending' ? '● Pending' : 
                   '● Restricted'}
                </Text>
              </View>
            </View>
            
            {/* Bank Account Details - Airtasker Style */}
            {stripeAccountStatus.bankAccount && (
              <TouchableOpacity 
                style={styles.bankAccountSection}
                onPress={() => setShowBankAccountModal(true)}
                activeOpacity={0.7}
              >
                <View style={[styles.bankAccountItem, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                  <View style={[styles.bankIconContainer, isDarkMode && { backgroundColor: '#1E293B' }]}>
                    <MaterialIcons name="account-balance" size={20} color={isDarkMode ? '#38BDF8' : '#FFFFFF'} />
                  </View>
                  <View style={styles.bankAccountInfo}>
                    <Text style={[styles.bankAccountLabel, isDarkMode && { color: '#F8FAFC' }]}>
                      {stripeAccountStatus.bankAccount.bankName || 'Bank Account'}
                    </Text>
                    <Text style={[styles.bankAccountNumber, isDarkMode && { color: '#94A3B8' }]}>
                      BSB {stripeAccountStatus.bankAccount.routingNumber} • **** {stripeAccountStatus.bankAccount.last4}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={isDarkMode ? '#94A3B8' : 'rgba(255,255,255,0.6)'} />
                </View>
              </TouchableOpacity>
            )}
            
            <View style={styles.stripeAccountDetails}>
              <View style={styles.stripeAccountRow}>
                <Text style={[styles.stripeAccountLabel, isDarkMode && { color: '#94A3B8' }]}>Account ID:</Text>
                <Text style={[styles.stripeAccountValue, isDarkMode && { color: '#F8FAFC' }]}>
                  {stripeAccountStatus.accountId?.slice(-6) || 'N/A'}
                </Text>
              </View>
              
              <View style={styles.stripeAccountCapabilities}>
                <View style={[styles.capabilityBadge, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                  {stripeAccountStatus.chargesEnabled ? (
                    <Ionicons name="checkmark-circle" size={14} color="#4ADE80" />
                  ) : (
                    <Ionicons name="close-circle" size={14} color="#FCA5A5" />
                  )}
                  <Text style={[styles.capabilityText, isDarkMode && { color: '#F8FAFC' }]}>Charges</Text>
                </View>
                
                <View style={[styles.capabilityBadge, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                  {stripeAccountStatus.payoutsEnabled ? (
                    <Ionicons name="checkmark-circle" size={14} color="#4ADE80" />
                  ) : (
                    <Ionicons name="close-circle" size={14} color="#FCA5A5" />
                  )}
                  <Text style={[styles.capabilityText, isDarkMode && { color: '#F8FAFC' }]}>Payouts</Text>
                </View>
                
                <View style={[styles.capabilityBadge, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                  {stripeAccountStatus.detailsSubmitted ? (
                    <Ionicons name="checkmark-circle" size={14} color="#4ADE80" />
                  ) : (
                    <Ionicons name="close-circle" size={14} color="#FCA5A5" />
                  )}
                  <Text style={[styles.capabilityText, isDarkMode && { color: '#F8FAFC' }]}>Details</Text>
                </View>
              </View>
            </View>
          </View>
        )}
        
        {/* Modern 2026 Pending Reviews Accordion */}
        <View style={[styles.pendingReviewsContainer, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <TouchableOpacity
            style={styles.pendingReviewsHeader}
            activeOpacity={0.8}
            onPress={() => {
              if (pendingReviewCount > 0) {
                setIsPendingReviewsExpanded(!isPendingReviewsExpanded);
              } else {
                router.push({
                  pathname: '/(tabs)/my-tasks' as any,
                  params: { tab: 'review_required', role: targetReviewRole },
                });
              }
            }}
          >
            <View style={[styles.pendingReviewsIconWrap, isDarkMode && { backgroundColor: 'rgba(234, 88, 12, 0.2)' }]}>
              <Ionicons name="star" size={18} color={isDarkMode ? '#EA580C' : '#FBBF24'} />
            </View>
            <View style={styles.pendingReviewsTextCol}>
              <View style={styles.pendingReviewsTitleRow}>
                <Text style={[styles.pendingReviewsTitle, isDarkMode && { color: '#F8FAFC' }]}>Pending reviews</Text>
                {pendingReviewCount > 0 && (
                  <View style={styles.pendingReviewsBadge}>
                    <Text style={styles.pendingReviewsBadgeText}>{pendingReviewCount}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.pendingReviewsSubtext, isDarkMode && { color: '#94A3B8' }]}>
                {pendingReviewCount > 0
                  ? `${pendingReviewCount} task${pendingReviewCount === 1 ? "" : "s"} waiting for your review`
                  : "No reviews waiting"}
              </Text>
            </View>
            <Ionicons
              name={
                pendingReviewCount === 0
                  ? "chevron-forward"
                  : isPendingReviewsExpanded
                  ? "chevron-up"
                  : "chevron-down"
              }
              size={18}
              color={isDarkMode ? '#64748B' : 'rgba(255,255,255,0.6)'}
            />
          </TouchableOpacity>

          {/* Expanded Preview Cards (Top 4) */}
          {isPendingReviewsExpanded && pendingReviewCount > 0 && (
            <View style={[styles.expandedReviewsContent, isDarkMode && { backgroundColor: '#0F172A', borderTopColor: '#334155' }]}>
              {pendingReviewTasks.slice(0, 4).map((task: any) => (
                <View key={task._id || task.id} style={[styles.reviewTaskItem, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                  <View style={styles.reviewTaskInfo}>
                    <Text style={[styles.reviewTaskTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>
                      {task.title}
                    </Text>
                    <Text style={[styles.reviewTaskMeta, isDarkMode && { color: '#94A3B8' }]}>
                      ${task.budget || task.price || 0} AUD · Completed
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.reviewNowBtn}
                    activeOpacity={0.85}
                    onPress={() => {
                      setReviewModalTask(task);
                    }}
                  >
                    <Text style={styles.reviewNowBtnText}>Review</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {pendingReviewCount > 4 && (
                <TouchableOpacity
                  style={[styles.seeAllReviewsBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1 }]}
                  activeOpacity={0.85}
                  onPress={() => {
                    router.push({
                      pathname: '/(tabs)/my-tasks' as any,
                      params: { tab: 'review_required', role: targetReviewRole },
                    });
                  }}
                >
                  <Text style={[styles.seeAllReviewsBtnText, isDarkMode && { color: '#38BDF8' }]}>
                    See All {pendingReviewCount} Pending Reviews →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        <MenuItem 
          icon={<MaterialIcons name="payment" size={20} color="#003399" />}
          text="Payment options"
          onPress={navigateToPayment} 
          subtext={stripeAccountStatus?.status === 'active' 
            ? 'Manage payment methods and bank account' 
            : stripeAccountStatus 
            ? 'Setup bank account to receive payments' 
            : 'Connect your bank account'}        
        />
        <MenuItem
          icon={<Ionicons name="wallet-outline" size={20} color="#003399" />}
          text="Credits"
          onPress={navigateToCredits}
          subtext={
            userData?.creditsBalance != null
              ? `Balance: ${Number(userData.creditsBalance).toFixed(0)} promo credits`
              : 'View promo credits balance and activity'
          }
        />
        <MenuItem
          icon={<Ionicons name="people-outline" size={20} color="#003399" />}
          text="Invite friends"
          onPress={navigateToInviteFriends}
          subtext={
            userData?.referralCode
              ? `Your code: ${userData.referralCode}`
              : 'Share your invite code and earn credits'
          }
        />
        <MenuItem
          icon={<Ionicons name="construct-outline" size={20} color="#003399" />}
          text="My services"
          onPress={navigateToMyServices}
          subtext="Manage service offerings you list"
        />
        <MenuItem
          icon={<Ionicons name="add-circle-outline" size={20} color="#003399" />}
          text="Create service"
          onPress={navigateToCreateService}
          subtext="Offer a service near you (ABN required)"
        />
        <MenuItem 
          icon={<Feather name="lock" size={20} color="#003399" />}
          text="Account Information"
          onPress={navigateToAccountInfo} 
          subtext={undefined}        
        />
        <MenuItem
          icon={<MaterialIcons name="verified-user" size={20} color={userData?.verification?.faceMatch?.status === "verified" ? "#16A34A" : "#003399"} />}
          text="ID Verification (AI Face Match)"
          onPress={navigateToIDVerification}
          subtext={
            userData?.verification?.faceMatch?.status === "verified"
              ? "ID & 3-Point Face Biometrics Verified"
              : "Verify government ID and 3-point live face scan"
          }
        />

        <Text style={[styles.sectionTitle, isDarkMode && { color: '#94A3B8' }]}>APP PREFERENCES</Text>
        {(biometricSupported || biometricEnabled) && (
          <View style={[styles.menuItem, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
            <View style={[styles.iconWrapper, isDarkMode && { backgroundColor: 'rgba(56,189,248,0.14)' }]}>
              <Ionicons
                name={biometricTypeLabel === 'Face ID' ? 'scan-outline' : 'finger-print-outline'}
                size={20}
                color={isDarkMode ? "#38BDF8" : "#FFFFFF"}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuText, isDarkMode && { color: '#F8FAFC' }]}>
                {biometricTypeLabel} Login
              </Text>
              <Text style={[styles.subtext, isDarkMode && { color: '#94A3B8' }]}>
                {biometricEnabled
                  ? 'Quick sign-in with ' + biometricTypeLabel + ' enabled'
                  : 'Enable ' + biometricTypeLabel + ' for fast, secure login'}
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: isDarkMode ? '#475569' : 'rgba(255,255,255,0.3)', true: '#ff6b35' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={isDarkMode ? '#475569' : 'rgba(255,255,255,0.3)'}
            />
          </View>
        )}
        <View style={[styles.menuItem, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
          <View style={[styles.iconWrapper, isDarkMode && { backgroundColor: 'rgba(56,189,248,0.14)' }]}>
            <Ionicons name={isDarkMode ? "moon" : "moon-outline"} size={20} color={isDarkMode ? "#38BDF8" : "#FFFFFF"} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.menuText, isDarkMode && { color: '#F8FAFC' }]}>Dark Mode</Text>
            <Text style={[styles.subtext, isDarkMode && { color: '#94A3B8' }]}>
              {isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: isDarkMode ? '#475569' : 'rgba(255,255,255,0.3)', true: '#ff6b35' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={isDarkMode ? '#475569' : 'rgba(255,255,255,0.3)'}
          />
        </View>

        <Text style={[styles.sectionTitle, isDarkMode && { color: '#94A3B8' }]}>NOTIFICATION SETTINGS</Text>
        <MenuItem 
          icon={<Ionicons name="notifications-outline" size={20} color="#003399" />}
          text="Tasker Preferences" 
          subtext="Manage task notification settings" 
          onPress={navigateToNotifications}        
        />

        <Text style={[styles.sectionTitle, isDarkMode && { color: '#94A3B8' }]}>HELP AND SUPPORT</Text>
        <MenuItem 
          icon={<Ionicons name="help-circle-outline" size={20} color="#003399" />}
          text="Frequently asked questions" 
          subtext={undefined} 
          onPress={navigateToFAQ}        
        />

        <MenuItem 
          icon={<Ionicons name="mail-outline" size={20} color="#003399" />}
          text="Contact us" 
          subtext={undefined} 
          onPress={navigateToContactUs}        
        />

        <Text style={[styles.sectionTitle, isDarkMode && { color: '#94A3B8' }]}>LEGAL & SAFETY</Text>
        <MenuItem 
          icon={<Ionicons name="shield-outline" size={20} color="#003399" />}
          text="Insurance protection" 
          subtext="Learn about coverage and terms" 
          onPress={navigateToInsuranceProtection}        
        />
        <MenuItem 
          icon={<Ionicons name="document-text-outline" size={20} color="#003399" />}
          text="Privacy policy" 
          subtext="How we handle your data" 
          onPress={navigateToPrivacyPolicy}        
        />
        <MenuItem 
          icon={<Ionicons name="shield-checkmark-outline" size={20} color="#003399" />}
          text="Terms & conditions" 
          subtext="Platform usage agreement" 
          onPress={navigateToTermsConditions}        
        />
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#94A3B8' }]}>ACCOUNT</Text>
        <MenuItem 
          icon={<Ionicons name="log-out-outline" size={20} color="#DC2626" />}
          text="Logout" 
          subtext={undefined} 
          danger
          onPress={navigateToLogoutScreen}
        />
      </View>

      {/* Request Edit Access Modal */}
      <Modal
        visible={showRequestModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRequestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Edit Access</Text>
            <Text style={styles.modalMessage}>
              Your profile is locked. Send a request to admin to enable editing?
            </Text>
            <Text style={styles.modalSubMessage}>
              Admin will review your request.
            </Text>
            
            {requestError && (
              <View style={styles.modalErrorContainer}>
                <Ionicons name="alert-circle" size={16} color="#FCA5A5" />
                <Text style={styles.modalErrorText}>{requestError}</Text>
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowRequestModal(false);
                  setRequestError(null);
                }}
                disabled={isSendingRequest}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalSendButton, isSendingRequest && styles.modalButtonDisabled]}
                onPress={handleSendRequest}
                disabled={isSendingRequest}
              >
                {isSendingRequest ? (
                  <AppLoader size={22} color="#fff" />
                ) : (
                  <Text style={styles.modalSendText}>Send Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pending Approval Modal */}
      <Modal
        visible={showPendingModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPendingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.pendingIconContainer}>
              <Ionicons name="hourglass-outline" size={48} color="#FFFFFF" />
            </View>
            
            <Text style={styles.modalTitle}>Request Sent!</Text>
            <Text style={styles.modalMessage}>
              Waiting for admin approval to unlock your profile.
            </Text>
            
            <View style={styles.pendingBadge}>
              <View style={styles.pendingDot} />
              <Text style={styles.pendingText}>Pending Approval</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.backToProfileButton}
              onPress={() => setShowPendingModal(false)}
            >
              <Text style={styles.backToProfileText}>Back to Profile</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalFooterText}>
              Usually takes 24-48 hours
            </Text>
          </View>
        </View>
      </Modal>

      {/* ID Verification Request Access Modal */}
      <Modal
        visible={showIdRequestModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowIdRequestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request ID Verification Access</Text>
            <Text style={styles.modalMessage}>
              ID Verification requires admin approval. Send a request to admin to enable ID verification?
            </Text>
            <Text style={styles.modalSubMessage}>
              Admin will review your request and grant access.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowIdRequestModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalSendButton, isSendingRequest && styles.modalButtonDisabled]}
                onPress={handleSendIdVerificationRequest}
                disabled={isSendingRequest}
              >
                {isSendingRequest ? (
                  <AppLoader size={22} color="#fff" />
                ) : (
                  <Text style={styles.modalSendText}>Send Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ID Verification Pending Approval Modal */}
      <Modal
        visible={showIdPendingModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowIdPendingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.pendingIconContainer}>
              <Ionicons name="shield-checkmark" size={48} color="#FFFFFF" />
            </View>
            
            <Text style={styles.modalTitle}>Verification Request Sent!</Text>
            <Text style={styles.modalMessage}>
              Waiting for admin approval to proceed with ID verification.
            </Text>
            
            <View style={styles.pendingBadge}>
              <View style={styles.pendingDot} />
              <Text style={styles.pendingText}>Pending Admin Approval</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.backToProfileButton}
              onPress={() => setShowIdPendingModal(false)}
            >
              <Text style={styles.backToProfileText}>Back to Profile</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalFooterText}>
              You'll be notified when approved (Usually 24-48 hours)
            </Text>
          </View>
        </View>
      </Modal>

      {/* Bank Account Details Modal */}
      <Modal
        visible={showBankAccountModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBankAccountModal(false)}
      >
        <View style={[styles.modalOverlay, { justifyContent: 'flex-end', padding: 0, paddingHorizontal: 0 }]}>
          <View style={[styles.bankDetailsModalContent, isDarkMode && { backgroundColor: '#1E293B' }]}>
            {/* Header */}
            <View style={[styles.bankDetailsHeader, isDarkMode && { borderBottomColor: '#334155' }]}>
              <View style={styles.bankDetailsHeaderLeft}>
                <View style={[styles.bankDetailsIconLarge, isDarkMode && { backgroundColor: '#0F172A' }]}>
                  <MaterialIcons name="account-balance" size={32} color={isDarkMode ? '#38BDF8' : '#FFFFFF'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bankDetailsTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>
                    {stripeAccountStatus?.bankAccount?.bankName || 'Bank Account'}
                  </Text>
                  <Text style={[styles.bankDetailsSubtitle, isDarkMode && { color: '#94A3B8' }]}>Payment Account Details</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => setShowBankAccountModal(false)}
                style={styles.bankDetailsCloseButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={isDarkMode ? '#F8FAFC' : '#FFFFFF'} />
              </TouchableOpacity>
            </View>

            {/* Account Details — Scrollable */}
            <ScrollView keyboardShouldPersistTaps="handled"
              style={{ flexShrink: 1 }}
              contentContainerStyle={{ paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {stripeAccountStatus?.bankAccount && (
                <View style={styles.bankDetailsBody}>
                  <View style={styles.bankDetailsRow}>
                    <Text style={[styles.bankDetailsLabel, isDarkMode && { color: "#94A3B8" }]}>Account Type</Text>
                    <Text style={[styles.bankDetailsValue, isDarkMode && { color: "#F8FAFC" }]}>
                      {stripeAccountStatus.bankAccount.accountHolderType || 'Individual'}
                    </Text>
                  </View>

                  <View style={[styles.bankDetailsDivider, isDarkMode && { backgroundColor: "#334155" }]} />

                  <View style={styles.bankDetailsRow}>
                    <Text style={[styles.bankDetailsLabel, isDarkMode && { color: "#94A3B8" }]}>Bank Name</Text>
                    <Text style={[styles.bankDetailsValue, isDarkMode && { color: "#F8FAFC" }]}>
                      {stripeAccountStatus.bankAccount.bankName}
                    </Text>
                  </View>

                  <View style={styles.bankDetailsRow}>
                    <Text style={[styles.bankDetailsLabel, isDarkMode && { color: "#94A3B8" }]}>BSB (Routing Number)</Text>
                    <Text style={[styles.bankDetailsValueMono, isDarkMode && { color: "#F8FAFC" }]}>
                      {stripeAccountStatus.bankAccount.routingNumber}
                    </Text>
                  </View>

                  <View style={styles.bankDetailsRow}>
                    <Text style={[styles.bankDetailsLabel, isDarkMode && { color: "#94A3B8" }]}>Account Number</Text>
                    <Text style={[styles.bankDetailsValueMono, isDarkMode && { color: "#F8FAFC" }]}>
                      •••• •••• {stripeAccountStatus.bankAccount.last4}
                    </Text>
                  </View>

                  <View style={[styles.bankDetailsDivider, isDarkMode && { backgroundColor: "#334155" }]} />

                  <View style={styles.bankDetailsRow}>
                    <Text style={[styles.bankDetailsLabel, isDarkMode && { color: "#94A3B8" }]}>Currency</Text>
                    <Text style={[styles.bankDetailsValue, isDarkMode && { color: "#F8FAFC" }]}>
                      {stripeAccountStatus.bankAccount.currency?.toUpperCase() || 'AUD'}
                    </Text>
                  </View>

                  <View style={styles.bankDetailsRow}>
                    <Text style={[styles.bankDetailsLabel, isDarkMode && { color: "#94A3B8" }]}>Country</Text>
                    <Text style={[styles.bankDetailsValue, isDarkMode && { color: "#F8FAFC" }]}>
                      {stripeAccountStatus.bankAccount.country === 'AU' ? '🇦🇺 Australia' : stripeAccountStatus.bankAccount.country}
                    </Text>
                  </View>

                  <View style={[styles.bankDetailsDivider, isDarkMode && { backgroundColor: "#334155" }]} />

                  <View style={styles.bankDetailsInfoBox}>
                    <Ionicons name="information-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={[styles.bankDetailsInfoText, isDarkMode && { color: "#94A3B8" }]}>
                      This is your payout account. Payments will be transferred to this bank account.
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Footer Buttons — Fixed at bottom */}
            <View style={[styles.bankDetailsFooter, isDarkMode && { borderTopColor: "#334155", backgroundColor: "#1E293B" }]}>
              <TouchableOpacity
                style={[styles.bankDetailsButton, { backgroundColor: '#ff6b35' }, isUpdatingBank && { opacity: 0.7 }]}
                onPress={handleUpdateBankAccount}
                disabled={isUpdatingBank}
              >
                {isUpdatingBank ? (
                  <AppLoader color="#fff" size={22} />
                ) : (
                  <Text style={[styles.bankDetailsButtonText, { color: '#fff' }]}>Update Bank Account</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.bankDetailsButton, { backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' }]}
                onPress={() => setShowBankAccountModal(false)}
              >
                <Text style={[styles.bankDetailsButtonText, { color: '#FFFFFF' }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Direct Rating & Review Modal from Pending Reviews */}
      {reviewModalTask && (
        <RatingReviewModal
          visible={!!reviewModalTask}
          onClose={() => setReviewModalTask(null)}
          onSubmit={async (reviewData) => {
            try {
              if (reviewData.rating === 0) {
                setReviewModalTask(null);
                return;
              }
              await submitReviewMutation.mutateAsync({
                taskId: reviewModalTask._id || reviewModalTask.id,
                rating: reviewData.rating,
                reviewText: reviewData.reviewText,
                attachments: reviewData.attachments,
              });
              setReviewModalTask(null);
              AppAlert.alert('Review Submitted', 'Thank you! Your review has been submitted successfully.');
            } catch (err: any) {
              const msg = err?.response?.data?.message || err?.message || 'Failed to submit review';
              AppAlert.alert('Error', msg);
            }
          }}
          taskTitle={reviewModalTask.title || 'Task'}
          userRole={
            reviewModalTask.taskerId === (authUser?.id || authUser?._id) ||
            reviewModalTask.assignedTo === (authUser?.id || authUser?._id)
              ? 'tasker'
              : 'poster'
          }
        />
      )}

    </ScrollView>
    </View>
  );
}

type MenuItemProps = {
  icon: React.ReactNode;
  text: string;
  subtext?: string;
  onPress?: () => void;
  disabled?: boolean;
  badge?: number;
  danger?: boolean;
};

const MenuItem: React.FC<MenuItemProps> = ({ icon, text, subtext, onPress, disabled, badge, danger }) => {
  const { isDarkMode } = useTheme();
  return (
    <TouchableOpacity 
      style={[styles.menuItem, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }, disabled && styles.menuItemDisabled]} 
      onPress={onPress}
      disabled={disabled && !onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrapper, isDarkMode && { backgroundColor: 'rgba(56,189,248,0.14)' }, danger && { backgroundColor: isDarkMode ? 'rgba(220,38,38,0.18)' : 'rgba(252,165,165,0.18)' }]}>
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<any>, {
              color: danger
                ? (isDarkMode ? '#DC2626' : '#FCA5A5')
                : isDarkMode
                ? '#38BDF8'
                : (icon.props as any).color === '#16A34A'
                ? '#4ADE80'
                : '#FFFFFF',
            })
          : icon}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.menuText, isDarkMode && { color: '#F8FAFC' }, danger && { color: isDarkMode ? '#F87171' : '#FCA5A5' }, disabled && styles.menuTextDisabled]}>{text}</Text>
        {subtext && <Text style={[styles.subtext, isDarkMode && { color: '#94A3B8' }, disabled && styles.subtextDisabled]}>{subtext}</Text>}
      </View>
      {badge && badge > 0 ? (
        <View style={styles.pendingReviewBadge}>
          <Text style={styles.pendingReviewBadgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
      {disabled ? (
        <Ionicons name="lock-closed" size={18} color={isDarkMode ? '#64748B' : 'rgba(255,255,255,0.5)'} />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={isDarkMode ? '#94A3B8' : 'rgba(255,255,255,0.6)'} />
      )}
    </TouchableOpacity>
  );
};


const GLASS_BG = 'rgba(255,255,255,0.10)';
const GLASS_BORDER = 'rgba(255,255,255,0.18)';
const GLASS_SHADOW = {
  shadowColor: '#00114D',
  shadowOpacity: 0.25,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
} as const;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#003399',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#003399',
  },
  loadingText: {
    marginTop: 12,
    fontSize: RFValue(16),
    color: 'rgba(255,255,255,0.85)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#003399',
  },
  errorTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: RFValue(16),
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 28,
    height: 52,
    justifyContent: 'center',
    borderRadius: 14,
    shadowColor: '#ff6b35',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  retryButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '700',
  },
  header: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingBottom: 24,
    position: 'relative',
  },
  headerDark: {
    backgroundColor: '#003399',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 12,
    right: 0,
    backgroundColor: '#ff6b35',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: RFValue(22),
    color: '#fff',
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 16,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  profileBadgeOn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  profileBadgeOff: {
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  profileBadgeText: {
    fontSize: RFValue(11),
    color: '#fff',
    fontWeight: '600',
  },
  profileBadgeTextOff: {
    color: 'rgba(255,255,255,0.7)',
  },
  location: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    marginBottom: 6,
  },
  memberSinceText: {
    fontSize: RFValue(12),
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '500',
  },
  bioHeaderText: {
    fontSize: RFValue(13),
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginHorizontal: 30,
    marginBottom: 4,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: RFValue(13),
    color: '#fff',
    textDecorationLine: 'underline',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 2,
  },
  statText: {
    fontSize: RFValue(12),
    color: '#fff',
    marginLeft: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  verifiedText: {
    fontSize: RFValue(10),
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
  },
  editText: {
    fontSize: RFValue(13),
    color: '#fff',
  },
  editIconButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 8,
  },
  ratingSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  ratingLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  ratingLoadingText: {
    marginLeft: 12,
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
  },
  noRatingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noRatingText: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  noRatingSubtext: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Stripe Connect Account Status Card
  stripeAccountCard: {
    backgroundColor: GLASS_BG,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    ...GLASS_SHADOW,
  },
  stripeAccountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stripeAccountTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stripeAccountTitle: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(74,222,128,0.18)',
  },
  statusBadgePending: {
    backgroundColor: 'rgba(251,191,36,0.18)',
  },
  statusBadgeRestricted: {
    backgroundColor: 'rgba(252,165,165,0.18)',
  },
  statusBadgeText: {
    fontSize: RFValue(12),
    fontWeight: '600',
  },
  statusBadgeTextActive: {
    color: '#4ADE80',
  },
  statusBadgeTextPending: {
    color: '#FBBF24',
  },
  statusBadgeTextRestricted: {
    color: '#FCA5A5',
  },
  stripeAccountDetails: {
    gap: 8,
  },
  stripeAccountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stripeAccountLabel: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
  },
  stripeAccountValue: {
    fontSize: RFValue(14),
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  bankAccountSection: {
    marginTop: 12,
    marginBottom: 8,
  },
  bankAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  bankIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankAccountInfo: {
    flex: 1,
  },
  bankAccountLabel: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bankAccountNumber: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  stripeAccountCapabilities: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  capabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  capabilityText: {
    fontSize: RFValue(12),
    color: 'rgba(255,255,255,0.85)',
  },
  // Bank Account Details Modal
  bankDetailsModalContent: {
    backgroundColor: '#003399',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  bankDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.18)',
  },
  bankDetailsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  bankDetailsIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankDetailsTitle: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bankDetailsSubtitle: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.72)',
  },
  bankDetailsCloseButton: {
    padding: 4,
  },
  bankDetailsBody: {
    padding: 20,
  },
  bankDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  bankDetailsLabel: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.72)',
    flex: 1,
  },
  bankDetailsValue: {
    fontSize: RFValue(15),
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'right',
  },
  bankDetailsValueMono: {
    fontSize: RFValue(15),
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  bankDetailsDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginVertical: 12,
  },
  bankDetailsInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  bankDetailsInfoText: {
    flex: 1,
    fontSize: RFValue(13),
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  bankDetailsFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
    gap: 10,
  },
  bankDetailsButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bankDetailsButtonText: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#fff',
  },
  card: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 22,
    marginBottom: 10,
    marginLeft: 4,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  pendingReviewBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ff6b35',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginRight: 8,
  },
  pendingReviewBadgeText: {
    color: '#FFFFFF',
    fontSize: RFValue(11),
    fontWeight: '700',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 14,
    backgroundColor: GLASS_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    ...GLASS_SHADOW,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  menuText: {
    fontSize: RFValue(15),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subtext: {
    fontSize: RFValue(13),
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  menuItemDisabled: {
    opacity: 0.6,
  },
  menuTextDisabled: {
    color: 'rgba(255,255,255,0.55)',
  },
  subtextDisabled: {
    color: 'rgba(255,255,255,0.45)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 12, 48, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#003399',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: RFValue(15),
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  modalSubMessage: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: RFValue(16),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalSendButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#ff6b35',
    alignItems: 'center',
  },
  modalSendText: {
    fontSize: RFValue(16),
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pendingIconContainer: {
    marginBottom: 16,
  },
  // Skills Section Styles
  skillsSection: {
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    ...GLASS_SHADOW,
  },
  skillsSectionTitle: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  skillCategory: {
    marginBottom: 20,
  },
  skillCategoryTitle: {
    fontSize: RFValue(15),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 10,
  },
  skillTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTagDisplay: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  skillTagDisplayText: {
    fontSize: RFValue(14),
    color: '#FFFFFF',
    fontWeight: '500',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FCD34D',
    marginRight: 8,
  },
  pendingText: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  backToProfileButton: {
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 32,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    marginBottom: 12,
  },
  backToProfileText: {
    fontSize: RFValue(16),
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalFooterText: {
    fontSize: RFValue(13),
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.22)',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    marginTop: 8,
  },
  modalErrorText: {
    fontSize: RFValue(14),
    color: '#FECACA',
    marginLeft: 8,
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 'auto',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navText: {
    fontSize: RFValue(10),
    color: '#003399',
    marginTop: 2,
  },
  profileBadgeVerified: {
    backgroundColor: "rgba(74, 222, 128, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.5)",
  },
  profileBadgeUnverified: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  profileBadgeTextVerified: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  profileBadgeTextUnverified: {
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  pendingReviewsContainer: {
    backgroundColor: GLASS_BG,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    overflow: "hidden",
    ...GLASS_SHADOW,
  },
  pendingReviewsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  pendingReviewsIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(251,191,36,0.16)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  pendingReviewsTextCol: {
    flex: 1,
  },
  pendingReviewsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pendingReviewsTitle: {
    fontSize: RFValue(15),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  pendingReviewsBadge: {
    backgroundColor: "#EA580C",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  pendingReviewsBadgeText: {
    color: "#FFFFFF",
    fontSize: RFValue(11),
    fontWeight: "800",
  },
  pendingReviewsSubtext: {
    fontSize: RFValue(12.5),
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  expandedReviewsContent: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.14)",
    paddingTop: 10,
    paddingHorizontal: 14,
    paddingBottom: 14,
    backgroundColor: "rgba(0,17,77,0.25)",
  },
  reviewTaskItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  reviewTaskInfo: {
    flex: 1,
    marginRight: 10,
  },
  reviewTaskTitle: {
    fontSize: RFValue(13.5),
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  reviewTaskMeta: {
    fontSize: RFValue(11.5),
    color: "rgba(255,255,255,0.75)",
  },
  reviewNowBtn: {
    backgroundColor: "#ff6b35",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  reviewNowBtnText: {
    color: "#FFFFFF",
    fontSize: RFValue(12),
    fontWeight: "700",
  },
  seeAllReviewsBtn: {
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 12,
    marginTop: 4,
  },
  seeAllReviewsBtnText: {
    color: "#FFFFFF",
    fontSize: RFValue(13),
    fontWeight: "700",
  },
});