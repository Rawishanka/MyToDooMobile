import TaskerDashboard from '@/src/features/dashboard/screens/dashboard';
import PrivacyPolicyScreen from '@/src/features/legal/screens/PrivacyPolicyScreen';
import TermsConditionsScreen from '@/src/features/legal/screens/TermsConditionsScreen';
import CommunityGuideLines from '@/src/shared/components/custom_components/community-guidelines';
import ContactUs from '@/src/shared/components/custom_components/contact-us';
import EditProfileScreen from '@/src/shared/components/custom_components/editprofilescreen';
import FAQ from '@/src/shared/components/custom_components/faq-screen';
import LegalScreen from '@/src/shared/components/custom_components/legal-screen';
import Logout from '@/src/shared/components/custom_components/Logout';
import ProfileUpdateForm from '@/src/shared/components/custom_components/profile-update-form';
import ZendeskHelp from '@/src/shared/components/custom_components/zendesk-help';
import { useGetUserProfile, useGetUserRatingStats, useGetUserReviews, useUploadUserAvatar } from '@/src/shared/hooks/useUserProfileApi';
import { autoLoginForDevelopment } from '@/src/shared/utils/dev-auth';
import { isNetworkError } from '@/src/shared/utils/networkErrorHandler';
import { useAuthStore } from '@/src/store/auth-task-store';
import { Entypo, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Import rating components
import { GetMoreReviewsSection } from './user-profile/components/GetMoreReviewsSection';
import { OverallRatingSection } from './user-profile/components/OverallRatingSection';
import { ReviewsList } from './user-profile/components/ReviewsList';


import AccountInformation from './accountinformation';
import IDVerificationScreen from './id-verification-screen';
import InsuranceProtection from './isuranceprotection';
import NotificationPreferences from './notificationpreferences';
import PaymentScreensApp from './paymentscreens';
import TaskAlerts from './taskalerts';

export default function AccountScreen() {
  const [currentScreen, setCurrentScreen] = useState('account');
  const [editAccessStatus, setEditAccessStatus] = useState<'locked' | 'pending' | 'approved'>('locked');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  
  // ID Verification request flow states
  const [idVerificationStatus, setIdVerificationStatus] = useState<'locked' | 'pending' | 'approved'>('locked');
  const [showIdRequestModal, setShowIdRequestModal] = useState(false);
  const [showIdPendingModal, setShowIdPendingModal] = useState(false);

  // Local state for profile picture preview
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState<boolean>(false);

  const router = useRouter();

  // � **AUTO-LOGIN for development**
  React.useEffect(() => {
    autoLoginForDevelopment();
  }, []);

  //  **NEW: Get real user data from API**
  const { data: userProfileData, isLoading: isLoadingProfile, error: profileError, refetch } = useGetUserProfile();
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useUploadUserAvatar();
  const { user: authUser, isAuthenticated, token, clearAuth } = useAuthStore();

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
        <ActivityIndicator size="large" color="#0052A2" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Handle avatar change
  const handleChangeAvatar = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need permission to access your photos to change your profile picture.');
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
      
      // Create FormData
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('avatar', {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);
      
      // Upload avatar
      uploadAvatar(formData, {
        onSuccess: (response) => {
          console.log("✅ Avatar upload successful, response:", response);
          Alert.alert('Success', 'Profile picture updated successfully!');
          
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
            }).catch((error) => {
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
          Alert.alert(
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
        <ActivityIndicator size="large" color="#0052A2" />
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
          <ActivityIndicator size="large" color="#0052A2" />
          <Text style={styles.loadingText}>Signing out...</Text>
        </View>
      );
    }
    
    // For non-auth errors, show the error UI
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
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
    setCurrentScreen('zendesk');
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
    // Check ID verification access status
    if (idVerificationStatus === 'locked') {
      // Show request modal if locked
      setShowIdRequestModal(true);
    } else if (idVerificationStatus === 'pending') {
      // Show pending modal if already requested
      setShowIdPendingModal(true);
    } else {
      // Only allow ID verification if approved
      setCurrentScreen('id-verification');
    }
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

  // If profile update screen is selected, show profile update form
  if (currentScreen === 'profile-update') {
    return <ProfileUpdateForm 
      onBack={navigateToAccount} 
      userData={userData}
    />;
  }

  // If edit profile screen is selected, show edit profile
  if (currentScreen === 'edit-profile') {
    return <EditProfileScreen 
      onBack={navigateToAccount} 
      onSave={undefined}
    />;
  }

  // If payment screen is selected, show payment screens
  if (currentScreen === 'payment') {
    return <PaymentScreensApp onBackToAccount={navigateToAccount} />;
  }

  // If account info screen is selected, show account information
  if (currentScreen === 'account-info') {
    return <AccountInformation onBack={navigateToAccount} />;
  }

  // If notifications screen is selected, show notification preferences
  if (currentScreen === 'notifications') {
    return <NotificationPreferences onBack={navigateToAccount} />;
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
    return <FAQ visible={true} onClose={navigateToAccount} />;
  } 

  if (currentScreen === 'zendesk') {
    return <ZendeskHelp visible={true} onClose={navigateToAccount} />;
  }

  if (currentScreen === 'community-guidelines') {
    return <CommunityGuideLines visible={true} onClose={navigateToAccount} />;
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
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleChangeAvatar} disabled={isUploadingAvatar}>
          <View>
            <Image
              source={{ 
                uri: selectedImageUri || // Show selected image first (highest priority)
                     (!avatarLoadFailed && (userData?.avatar || userData?.profilePicture)) || // Only try S3 if not failed
                     `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.firstName || 'U')}+${encodeURIComponent(userData?.lastName || 'U')}&background=0052A2&color=fff&size=120`
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
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.name}>
          {userData?.firstName} {userData?.lastName?.charAt(0)}.
        </Text>
        <Text style={styles.location}>
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
        
        {/* Rating and Stats */}
        {userData && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.statText}>
                {userData.rating != null ? `${Number(userData.rating).toFixed(1)}/5` : '0.0/5'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statText}>{userData.completedTasks || 0} tasks completed</Text>
            </View>
            {userData.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
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
          <View style={styles.skillsSection}>
            <Text style={styles.skillsSectionTitle}>Skills</Text>
            
            {/* What are you good at? */}
            {typedSkills.goodAt && typedSkills.goodAt.length > 0 && (
              <View style={styles.skillCategory}>
                <Text style={styles.skillCategoryTitle}>What are you good at?</Text>
                <View style={styles.skillTagsContainer}>
                  {typedSkills.goodAt.map((skill, index) => (
                    <View key={index} style={styles.skillTagDisplay}>
                      <Text style={styles.skillTagDisplayText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* How do you get around? */}
            {typedSkills.transport && typedSkills.transport.length > 0 && (
              <View style={styles.skillCategory}>
                <Text style={styles.skillCategoryTitle}>How do you get around?</Text>
                <View style={styles.skillTagsContainer}>
                  {typedSkills.transport.map((trans, index) => (
                    <View key={index} style={styles.skillTagDisplay}>
                      <Text style={styles.skillTagDisplayText}>{trans}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* Languages */}
            {typedSkills.languages && typedSkills.languages.length > 0 && (
              <View style={styles.skillCategory}>
                <Text style={styles.skillCategoryTitle}>Languages</Text>
                <View style={styles.skillTagsContainer}>
                  {typedSkills.languages.map((lang, index) => (
                    <View key={index} style={styles.skillTagDisplay}>
                      <Text style={styles.skillTagDisplayText}>{lang}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* Qualifications */}
            {typedSkills.qualifications && typedSkills.qualifications.length > 0 && (
              <View style={styles.skillCategory}>
                <Text style={styles.skillCategoryTitle}>Qualifications</Text>
                <View style={styles.skillTagsContainer}>
                  {typedSkills.qualifications.map((qual, index) => (
                    <View key={index} style={styles.skillTagDisplay}>
                      <Text style={styles.skillTagDisplayText}>{qual}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* Work Experience */}
            {typedSkills.experience && typedSkills.experience.length > 0 && (
              <View style={styles.skillCategory}>
                <Text style={styles.skillCategoryTitle}>Work Experience</Text>
                <View style={styles.skillTagsContainer}>
                  {typedSkills.experience.map((exp, index) => (
                    <View key={index} style={styles.skillTagDisplay}>
                      <Text style={styles.skillTagDisplayText}>{exp}</Text>
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
        <View style={styles.ratingSection}>
          {ratingLoading && !ratingData ? (
            <View style={styles.ratingLoadingContainer}>
              <ActivityIndicator size="small" color="#0052A2" />
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
                    averageRating={ratingData?.averageRating ?? userData?.rating ?? 0}
                    totalReviews={actualTotalReviews}
                    ratingDistribution={ratingData?.ratingDistribution || {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}}
                    completionRate={
                      // If we have both completed tasks and reviews, calculate review rate
                      // Otherwise, if we have completed tasks, assume high completion rate
                      userData?.completedTasks && userData.completedTasks > 0
                        ? actualTotalReviews > 0
                          ? Math.min(Math.round((actualTotalReviews / userData.completedTasks) * 100), 100)
                          : 95 // Default high completion rate if tasks exist but no reviews yet
                        : 0
                    }
                    totalTasks={userData?.completedTasks ?? 0}
                  />
                );
              })()}
              
              <GetMoreReviewsSection 
                userId={userId}
                userName={userData?.firstName || 'User'}
              />
              
              <ReviewsList userId={userId} />
            </>
          ) : userData ? (
            <>
              <OverallRatingSection
                averageRating={userData.rating ?? 0}
                totalReviews={0}
                ratingDistribution={{"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}}
                completionRate={userData.completedTasks ? 100 : 0}
                totalTasks={userData.completedTasks ?? 0}
              />
              <View style={styles.noRatingContainer}>
                <Ionicons name="chatbox-outline" size={48} color="#ccc" />
                <Text style={styles.noRatingText}>No reviews yet</Text>
                <Text style={styles.noRatingSubtext}>Complete tasks to receive reviews from clients</Text>
              </View>
            </>
          ) : (
            <View style={styles.noRatingContainer}>
              <Ionicons name="star-outline" size={48} color="#ccc" />
              <Text style={styles.noRatingText}>No ratings yet</Text>
              <Text style={styles.noRatingSubtext}>Complete tasks to start building your reputation</Text>
            </View>
          )}
        </View>
      )}

      {/* Settings List */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>PROFILE</Text>
        <MenuItem 
          icon={<Ionicons name="person-outline" size={20} color="#0052A2" />}
          text="Edit Profile"
          onPress={navigateToProfileUpdate} 
          subtext={editAccessStatus === 'pending' 
            ? "Pending admin approval - changes won't save yet" 
            : "Update your personal information"}
          disabled={false}
        />
        <MenuItem 
          icon={<Ionicons name="shield-checkmark-outline" size={20} color="#0052A2" />}
          text="ID Verification"
          onPress={navigateToIDVerification} 
          subtext={idVerificationStatus === 'locked'
            ? "Request access to verify"
            : idVerificationStatus === 'pending'
            ? "Pending admin approval"
            : userData?.isVerified ? "Identity verified" : "Verify your identity to build trust"}
          disabled={false}
        />
        
        <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>
        <MenuItem 
          icon={<MaterialIcons name="payment" size={20} color="#0052A2" />}
          text="Payment options"
          onPress={navigateToPayment} 
          subtext={undefined}        
        />
        <MenuItem 
          icon={<Feather name="lock" size={20} color="#0052A2" />}
          text="Account Information"
          onPress={navigateToAccountInfo} 
          subtext={undefined}        
        />

        <Text style={styles.sectionTitle}>NOTIFICATION SETTINGS</Text>
        <MenuItem 
          icon={<Ionicons name="notifications-outline" size={20} color="#0052A2" />}
          text="Notification preferences" 
          subtext={undefined} 
          onPress={navigateToNotifications}        
        />
        <MenuItem
          icon={<Entypo name="slideshare" size={20} color="#0052A2" />}
          text="Task alerts for Taskers"
          subtext="Be the first to know relevant tasks" 
          onPress={navigateToTaskAlerts}        
        />

        <Text style={styles.sectionTitle}>FOR TASKERS</Text>
        <MenuItem 
          icon={<Feather name="bar-chart-2" size={20} color="#0052A2" />}
          text="My dashboard" 
          subtext={undefined} 
          onPress={navigateToDashboard}        
        />
        <MenuItem 
          icon={<Feather name="list" size={20} color="#0052A2" />}
          text="List my services"
          subtext="Create listings for your services so customers come to you" 
          onPress={undefined}        
        />

        <Text style={styles.sectionTitle}>HELP AND SUPPORT</Text>
        <MenuItem 
          icon={<Ionicons name="help-circle-outline" size={20} color="#0052A2" />}
          text="Frequently asked questions" 
          subtext={undefined} 
          onPress={navigateToFAQ}        
        />

        <MenuItem 
          icon={<Ionicons name="people-outline" size={20} color="#0052A2" />}
          text="Community guidelines" 
          subtext={undefined} 
          onPress={navigateToCommunityGuidelines}        
        />
        <MenuItem 
          icon={<Ionicons name="mail-outline" size={20} color="#0052A2" />}
          text="Contact us" 
          subtext={undefined} 
          onPress={navigateToContactUs}        
        />

        <Text style={styles.sectionTitle}>LEGAL & SAFETY</Text>
        <MenuItem 
          icon={<Ionicons name="shield-outline" size={20} color="#0052A2" />}
          text="Insurance protection" 
          subtext="Learn about coverage and terms" 
          onPress={navigateToInsuranceProtection}        
        />
        <MenuItem 
          icon={<Ionicons name="document-text-outline" size={20} color="#0052A2" />}
          text="Privacy policy" 
          subtext="How we handle your data" 
          onPress={navigateToPrivacyPolicy}        
        />
        <MenuItem 
          icon={<Ionicons name="shield-checkmark-outline" size={20} color="#0052A2" />}
          text="Terms & conditions" 
          subtext="Platform usage agreement" 
          onPress={navigateToTermsConditions}        
        />
        
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <MenuItem 
          icon={<Ionicons name="log-out-outline" size={20} color="#0052A2" />}
          text="Logout" 
          subtext={undefined} 
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
                <Ionicons name="alert-circle" size={16} color="#dc3545" />
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
                  <ActivityIndicator size="small" color="#fff" />
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
              <Ionicons name="hourglass-outline" size={48} color="#9b59b6" />
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
                  <ActivityIndicator size="small" color="#fff" />
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
              <Ionicons name="shield-checkmark" size={48} color="#0052A2" />
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

    </ScrollView>
  );
}

type MenuItemProps = {
  icon: React.ReactNode;
  text: string;
  subtext?: string;
  onPress?: () => void;
  disabled?: boolean;
};

const MenuItem: React.FC<MenuItemProps> = ({ icon, text, subtext, onPress, disabled }) => (
  <TouchableOpacity 
    style={[styles.menuItem, disabled && styles.menuItemDisabled]} 
    onPress={onPress}
    disabled={disabled && !onPress}
  >
    <View style={styles.iconWrapper}>{icon}</View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.menuText, disabled && styles.menuTextDisabled]}>{text}</Text>
      {subtext && <Text style={[styles.subtext, disabled && styles.subtextDisabled]}>{subtext}</Text>}
    </View>
    {disabled ? (
      <Ionicons name="lock-closed" size={18} color="#999" />
    ) : (
      <Ionicons name="chevron-forward" size={18} color="#888" />
    )}
  </TouchableOpacity>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#0052A2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#0052A2',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: 'relative',
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
    backgroundColor: '#0052A2',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
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
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  location: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 13,
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
    fontSize: 12,
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
    fontSize: 10,
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
  },
  editText: {
    fontSize: 13,
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
    fontSize: 14,
    color: '#666',
  },
  noRatingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noRatingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  noRatingSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 25,
    marginBottom: 10,
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iconWrapper: {
    width: 26,
    marginRight: 14,
    marginTop: 4,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#003366',
  },
  subtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  menuItemDisabled: {
    opacity: 0.6,
  },
  menuTextDisabled: {
    color: '#999',
  },
  subtextDisabled: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  modalSubMessage: {
    fontSize: 14,
    color: '#3498db',
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
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  modalSendButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#3498db',
    alignItems: 'center',
  },
  modalSendText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  pendingIconContainer: {
    marginBottom: 16,
  },
  // Skills Section Styles
  skillsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  skillsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  skillCategory: {
    marginBottom: 20,
  },
  skillCategoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  skillTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTagDisplay: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  skillTagDisplayText: {
    fontSize: 14,
    color: '#0052A2',
    fontWeight: '500',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#3498db',
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
    marginRight: 8,
  },
  pendingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  backToProfileButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#3498db',
    marginBottom: 12,
  },
  backToProfileText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
  },
  modalFooterText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 8,
  },
  modalErrorText: {
    fontSize: 14,
    color: '#dc3545',
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
    fontSize: 10,
    color: '#0052A2',
    marginTop: 2,
  },
});