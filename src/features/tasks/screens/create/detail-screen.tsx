import { CreateTaskRequest } from '@/src/api/types/tasks';
import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { useStorageState } from '@/src/shared/hooks/useStorageState';
import { usePostTaskWithImages } from '@/src/shared/hooks/useTaskApi';
import { debugAuthState, forceFreshLogin } from '@/src/shared/utils/auth-utils';
import { getCurrencyFromLocation, getCurrencySymbol } from '@/src/shared/utils/currency';
import { isNetworkError } from '@/src/shared/utils/networkErrorHandler';
import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';
import { useCreateTaskStore } from '@/src/store/create-task-store';
import { usePendingActionStore } from '@/src/store/pending-action-store';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ListItemProps = {
  icon: React.ReactNode;
  text: string;
  value: string;
  onPress: () => void;
};

const ListItem = React.memo(({ icon, text, value, onPress }: ListItemProps) => (
  <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.itemLeft}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.itemText}>{text}</Text>
        {value && <Text style={styles.valueText}>{value}</Text>}
      </View>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#003366" strokeWidth={2} />
  </TouchableOpacity>
));
ListItem.displayName = 'ListItem';

export default function DetailScreen() {
  const { myTask, resetTask } = useCreateTaskStore();
  const [[isLoading, storedToken], setStoredToken] = useStorageState('token');
  const { setPendingAction } = usePendingActionStore();
  const insets = useSafeAreaInsets();
  
  // Use React Query mutation for posting task with images
  const postTaskMutation = usePostTaskWithImages();

  // Auto-detect country for currency if no location set yet
  const { countryInfo } = useLocationCountry();

  // Get currency info - prioritize saved currency from task, fallback to location-based detection
  const getCurrencyInfo = () => {
    // If currency is already saved in the task, use it
    if (myTask.currency) {
      return { code: myTask.currency, symbol: getCurrencySymbol(myTask.currency) };
    }
    
    // Otherwise, fallback to location-based detection
    const location = 'location' in myTask ? myTask.location : undefined;
    // Handle both string location and object location formats
    const locationForCurrency = typeof location === 'string' 
      ? { address: location }
      : location && typeof location === 'object' && 'address' in location 
      ? location 
      : undefined;
    
    // If no location set, use detected country's currency
    if (locationForCurrency) {
      return getCurrencyFromLocation(locationForCurrency);
    }
    return { code: countryInfo.currency, symbol: getCurrencySymbol(countryInfo.currency) };
  };

  const currencyInfo = getCurrencyInfo();

  // Helper function to get location text based on task type
  const getLocationText = () => {
    if ('isRemoval' in myTask && myTask.isRemoval) {
      if (myTask.pickupLocation && myTask.deliveryLocation) {
        return `${myTask.pickupLocation} → ${myTask.deliveryLocation}`;
      }
      return 'Set pickup & delivery locations';
    }
    
    // For category tasks
    if (!myTask.isRemoval && myTask.location) {
      return myTask.location;
    }
    
    return 'Set location';
  };

  // Helper function to get date/time text
  const getDateTimeText = () => {
    if (myTask.date && myTask.time) {
      return `${myTask.date} at ${myTask.time}`;
    }
    if (myTask.date) {
      return myTask.date;
    }
    return "I'm Flexible";
  };

  // Helper function to get location string from task
  const getLocationFromTask = () => {
    if ('isRemoval' in myTask && myTask.isRemoval) {
      const pickup = myTask.pickupLocation || "Pickup Location";
      const delivery = myTask.deliveryLocation || "Delivery Location";
      return `${pickup} to ${delivery}`;
    }
    // For category tasks
    if (!myTask.isRemoval && myTask.location) {
      return myTask.location;
    }
    return "Location not specified";
  };

  // Helper function to get coordinates from task
  const getCoordinatesFromTask = () => {
    // Return actual coordinates if available from location selection
    if (!myTask.isRemoval && myTask.coordinates && myTask.coordinates.lat && myTask.coordinates.lng) {
      console.log('📍 Using actual coordinates from myTask:', myTask.coordinates);
      return {
        lat: myTask.coordinates.lat,
        lng: myTask.coordinates.lng
      };
    }
    // Fallback: return undefined if no coordinates (backend will handle)
    console.log('⚠️ No coordinates available in myTask');
    return undefined;
  };

  // Convert myTask to CreateTaskRequest format matching server expectations
  const convertToTaskRequest = (): CreateTaskRequest => {
    // Use the actual date from the task or generate a future date
    const taskDate = myTask.date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Get the category from the task - IMPORTANT: Must be a STRING for backend!
    const categoryValue = !myTask.isRemoval && myTask.category ? myTask.category : "General";
    // Convert to string if it's an array, ensure it's always a string
    const categoryString = Array.isArray(categoryValue) ? (categoryValue[0] || "General") : String(categoryValue);
    
    const taskRequest: CreateTaskRequest = {
      title: myTask.title || "Untitled Task",
      category: categoryString, // ✅ FIXED: Category must be a STRING, not an array
      details: myTask.description || "",
      dateType: "DoneBy",
      date: taskDate,
      time: myTask.time || "Anytime",
      location: String(getLocationFromTask()).trim() || "Location not specified", // ✅ Ensure location is always a valid string
      locationType: !myTask.isRemoval ? (myTask.locationType || 'In-person') : 'In-person',
      budget: myTask.budget || 0,
      currency: myTask.currency || currencyInfo.code, // Include currency in task creation
      images: myTask.photos || [], // ✅ Include images from store
    };
    
    // ✅ Include coordinates if available from location selection
    const coordinates = getCoordinatesFromTask();
    if (coordinates) {
      taskRequest.coordinates = coordinates;
      console.log('📍 Including coordinates in task request:', coordinates);
    } else {
      console.log('⚠️ No coordinates to include in task request');
    }
    
    console.log('📸 Task request includes images:', taskRequest.images?.length || 0);
    console.log('📸 Image URIs:', taskRequest.images);
    
    return taskRequest;
  };

  // Handle task posting
  const handlePostTask = async () => {
    // Debug authentication state before posting
    await debugAuthState();
    
    // Check if user is logged in
    if (!storedToken) {
      console.log("❌ No stored token found, redirecting to login");
      console.log("📋 Task data will be saved and posted after login/signup");
      // Redirect to login - task data is already saved in Zustand store
      // After successful login/signup, the task will be automatically posted
      console.log("❌ No stored token found, setting pending action and redirecting to login");
      
      // Set pending action to continue task posting after login
      setPendingAction({
        type: 'post-task',
        data: convertToTaskRequest(),
        returnPath: '/(tabs)/my-tasks'
      });
      
      router.push('/(auth)/login');
      return;
    }

    try {
      console.log("🚀 Starting task creation...");
      const taskData = convertToTaskRequest();
      console.log("📝 Task data to post:", taskData);
      
      // Extract image URIs from task data
      const imageUris = taskData.images || [];
      console.log("📸 Extracted image URIs:", imageUris.length, "images");
      
      // Remove images from task data (will be passed separately)
      const taskDataWithoutImages = { ...taskData };
      delete taskDataWithoutImages.images;
      
      // Use React Query mutation to post task with images
      const response = await postTaskMutation.mutateAsync({ 
        taskData: taskDataWithoutImages, 
        imageUris 
      });
      console.log("✅ Task posted successfully:", response);
      
      // Only show success alert if response is valid and successful
      if (response && (response.success || response.data)) {
        // Reset task store after confirmed successful posting
        resetTask();
        console.log("🔄 Task store reset after successful posting");
        
        // Show success message only after confirmed success
        Alert.alert(
          "Posted Successfully!", 
          "Your task has been posted and is now live. You can view it in My Tasks.",
          [
            {
              text: "View My Tasks",
              onPress: () => {
                // Navigate to My Tasks with Poster role
                router.replace({
                  pathname: '/(tabs)/my-tasks',
                  params: { role: 'Poster', tab: 'posted' }
                } as any);
              }
            }
          ]
        );
      } else {
        // If response doesn't indicate success, show error
        throw new Error("Task posting failed - no success confirmation from server");
      }
      
    } catch (error: any) {
      // Only log non-network errors in development
      if (!isNetworkError(error) && __DEV__) {
        console.warn('⚠️ Error posting task:', error);
      }
      
      // Handle authentication errors specifically
      if (error?.message?.includes("Authentication expired") || 
          error?.message?.includes("Please login again") ||
          error?.message?.includes("Authentication required")) {
        Alert.alert(
          "Authentication Required", 
          "Your session has expired. Please login again to post your task.",
          [
            {
              text: "Login",
              onPress: () => router.push('/(auth)/login')
            },
            {
              text: "Cancel",
              style: "cancel"
            }
          ]
        );
      } else if (error?.message?.includes("Validation Error")) {
        Alert.alert(
          "Invalid Task Data", 
          error.message || "Please check your task details and try again.",
          [
            {
              text: "OK"
            }
          ]
        );
      } else {
        // For any other errors, offer to retry
        Alert.alert(
          "Error", 
          "Failed to post your task. Please try again.",
          [
            {
              text: "Retry",
              onPress: handlePostTask
            },
            {
              text: "Cancel",
              style: "cancel"
            }
          ]
        );
      }
    }
  };

  // Temporary debug function for testing
  const handleForceFreshLogin = async () => {
    Alert.alert(
      "Force Fresh Login", 
      "This will clear all authentication data and require a fresh login. Continue?",
      [
        {
          text: "Yes, Clear Auth",
          onPress: async () => {
            await forceFreshLogin();
            router.push('/(auth)/login');
          }
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* API Debug Panel */}
      {/* <ApiDebugPanel /> */}
      
      {/* Back Arrow Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Ready to get offers?</Text>
      <Text style={styles.subtitle}>Post the task when you&apos;re ready</Text>

      <ScrollView contentContainerStyle={styles.list} removeClippedSubviews={false}>
        <ListItem
          icon={<MaterialIcons name="drive-file-rename-outline" size={22} color="#003366" />}
          text="Task Title"
          value={myTask.title || 'Move the car'}
          onPress={() => router.push('/(welcome-screen)/title-screen?section=title' as any)}
        />
        
        <ListItem
          icon={<MaterialIcons name="event-available" size={22} color="#003366" />}
          text="When"
          value={getDateTimeText()}
          onPress={() => router.push('/(welcome-screen)/title-screen?section=when' as any)}
        />
        
        <ListItem
          icon={<Ionicons name="location-outline" size={22} color="#003366" />}
          text="Location"
          value={getLocationText()}
          onPress={() => router.push('/(welcome-screen)/title-screen?section=location' as any)}
        />
        
        <ListItem
          icon={<MaterialIcons name="description" size={22} color="#003366" />}
          text="Description"
          value={myTask.description || 'Add task description'}
          onPress={() => router.push('/(welcome-screen)/title-screen?section=description' as any)}
        />
        
        <ListItem
          icon={<MaterialIcons name="attach-money" size={22} color="#003366" />}
          text="Budget"
          value={myTask.budget > 0 ? `${currencyInfo.symbol}${myTask.budget}` : 'Set budget'}
          onPress={() => router.push('/(welcome-screen)/budget-screen' as any)}
        />
      </ScrollView>

      {/* Temporary Debug Button - Remove in production */}
      {/* <TouchableOpacity 
        style={[styles.debugBtn]} 
        onPress={handleForceFreshLogin}
      >
        <Text style={styles.debugText}>🔧 Debug: Force Fresh Login</Text>
      </TouchableOpacity> */}

      <TouchableOpacity 
        style={[
          styles.continueBtn, 
          postTaskMutation.isPending && styles.continueButtonDisabled,
          { marginBottom: Math.max(insets.bottom, 30) }
        ]} 
        onPress={handlePostTask}
        disabled={postTaskMutation.isPending}
      >
        {postTaskMutation.isPending ? (
          <View style={styles.postingContainer}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={[styles.continueText, { marginLeft: 8 }]}>Posting Task...</Text>
          </View>
        ) : (
          <Text style={styles.continueText}>Post Task</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: isTablet ? wp('12.5%') : wp('5%'),
    paddingTop: 60,
    maxWidth: isTablet ? 900 : undefined,
    alignSelf: isTablet ? 'center' : 'auto',
    width: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: isTablet ? wp('12.5%') : wp('5%'),
    zIndex: 1,
  },
  title: {
    fontSize: RFValue(isTablet ? 24 : 20),
    fontWeight: 'bold',
    color: '#0B1A33',
    marginBottom: hp('0.6%'),
    marginTop: hp('5%'),
    textAlign: 'center',
  },
  subtitle: {
    color: '#667085',
    marginBottom: hp('2.5%'),
    textAlign: 'center',
    fontSize: RFValue(isTablet ? 14 : 13),
  },
  list: {
    paddingBottom: hp('2.5%'),
  },
  item: {
    paddingVertical: isTablet ? hp('2%') : hp('1.8%'),
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: isTablet ? 28 : 24,
    height: isTablet ? 28 : 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: wp('4%'),
    flex: 1,
  },
  itemText: {
    fontSize: RFValue(isTablet ? 16 : 14),
    color: '#003366',
    fontWeight: '600',
  },
  valueText: {
    fontSize: RFValue(isTablet ? 14 : 12),
    color: '#667085',
    marginTop: hp('0.3%'),
  },
  continueBtn: {
    backgroundColor: '#0052CC',
    paddingVertical: hp('1.8%'),
    borderRadius: 30,
    marginBottom: hp('3%'),
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  postingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: RFValue(14),
  },
  debugBtn: {
    backgroundColor: '#ff6b35',
    paddingVertical: hp('1%'),
    borderRadius: 8,
    marginBottom: hp('1.2%'),
    alignItems: 'center',
  },
  debugText: {
    color: '#fff',
    fontSize: RFValue(11),
    fontWeight: '500',
  },
});