import { CreateTaskRequest } from '@/api/types/tasks';
import { useStorageState } from '@/hooks/useStorageState';
import { usePostTask } from '@/hooks/useTaskApi';
import { debugAuthState, forceFreshLogin } from '@/utils/auth-utils';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
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
import { useCreateTaskStore } from '../../store/create-task-store';

type ListItemProps = {
  icon: React.ReactNode;
  text: string;
  value: string;
  onPress: () => void;
};

const ListItem = ({ icon, text, value, onPress }: ListItemProps) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <View style={styles.itemLeft}>
      {icon}
      <View style={styles.textContainer}>
        <Text style={styles.itemText}>{text}</Text>
        {value && <Text style={styles.valueText}>{value}</Text>}
      </View>
    </View>
    <ChevronRight size={20} color="#003366" />
  </TouchableOpacity>
);

export default function DetailScreen() {
  const { myTask, resetTask } = useCreateTaskStore();
  const [[isLoading, storedToken], setStoredToken] = useStorageState('token');
  
  // Use React Query mutation for posting task
  const postTaskMutation = usePostTask();

  // Helper function to get location text based on task type
  const getLocationText = () => {
    if ('isRemoval' in myTask && myTask.isRemoval) {
      if (myTask.pickupLocation && myTask.deliveryLocation) {
        return `${myTask.pickupLocation} → ${myTask.deliveryLocation}`;
      }
      return 'Set pickup & delivery locations';
    }
    
    // if ('isOnline' in myTask && myTask.isOnline) {
    //   return 'Online';
    // }
    
    // if ('inPerson' in myTask && myTask.inPerson && myTask.suburb) {
    //   return myTask.suburb;
    // }
    
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
    // if ('isOnline' in myTask && myTask.isOnline) {
    //   return "Remote/Online";
    // }
    // if ('inPerson' in myTask && myTask.inPerson) {
    //   return myTask.suburb || "Location not specified";
    // }
    return "Location not specified";
  };

  // Helper function to get coordinates from task
  const getCoordinatesFromTask = () => {
    // For now, return default Colombo coordinates
    // TODO: Implement proper geocoding based on location
    return { lat: 6.9271, lng: 79.8612 };
  };

  // Convert myTask to CreateTaskRequest format matching server expectations
  const convertToTaskRequest = (): CreateTaskRequest => {
    // Generate date range like existing successful tasks
    const today = new Date();
    const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    
    return {
      title: myTask.title || "Untitled Task",
      category: ["General"], // Use array with default category like existing tasks
      dateType: "Easy", // Use simple dateType like existing tasks 
      dateRange: {
        start: today.toISOString(),
        end: futureDate.toISOString()
      },
      time: myTask.time || "morning", // Use specific time like existing tasks
      location: getLocationFromTask(), // Keep as string like the logs show
      details: myTask.description || "",
      budget: myTask.budget || 0,
      currency: "LKR",
      images: [], // Empty array
      coordinates: getCoordinatesFromTask()
    };
  };

  // Handle task posting
  const handlePostTask = async () => {
    // Debug authentication state before posting
    await debugAuthState();
    
    // Check if user is logged in
    if (!storedToken) {
      console.log("❌ No stored token found, redirecting to login");
      router.push('/login-screen');
      return;
    }

    try {
      console.log("🚀 Starting task creation...");
      const taskData = convertToTaskRequest();
      console.log("📝 Task data to post:", taskData);
      
      // Use React Query mutation to post task
      const response = await postTaskMutation.mutateAsync(taskData);
      console.log("✅ Task posted successfully:", response);
      
      // Reset task store after successful posting
      resetTask();
      console.log("🔄 Task store reset after successful posting");
      
      // Show success message
      Alert.alert(
        "Success!", 
        "Your task has been posted successfully and will appear in My Tasks!",
        [
          {
            text: "View My Tasks",
            onPress: () => router.push('/(tabs)/mytasks-screen')
          }
        ]
      );
      
    } catch (error: any) {
      console.error('❌ Error posting task:', error);
      
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
              onPress: () => router.push('/login-screen')
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
            router.push('/login-screen');
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
        <ChevronLeft size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Ready to get offers?</Text>
      <Text style={styles.subtitle}>Post the task when you're ready</Text>

      <ScrollView contentContainerStyle={styles.list}>
        <ListItem
          icon={<MaterialIcons name="drive-file-rename-outline" size={20} color="#003366" />}
          text="Task Title"
          value={myTask.title || 'Move the car'}
          onPress={() => router.push('/title-screen')}
        />
        
        <ListItem
          icon={<MaterialIcons name="event-available" size={20} color="#003366" />}
          text="When"
          value={getDateTimeText()}
          onPress={() => router.push('/time-select-screen')}
        />
        
        <ListItem
          icon={<Ionicons name="location-outline" size={20} color="#003366" />}
          text="Location"
          value={getLocationText()}
          onPress={() => router.push('/location-screen')}
        />
        
        <ListItem
          icon={<MaterialIcons name="description" size={20} color="#003366" />}
          text="Description"
          value={myTask.description || 'Add task description'}
          onPress={() => router.push('/description-screen')}
        />
        
        <ListItem
          icon={<MaterialIcons name="attach-money" size={20} color="#003366" />}
          text="Budget"
          value={myTask.budget > 0 ? `A$${myTask.budget}` : 'A$200'}
          onPress={() => router.push('/budget-screen')}
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
        style={[styles.continueBtn, postTaskMutation.isPending && styles.continueButtonDisabled]} 
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
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0B1A33',
    marginBottom: 5,
    marginTop: 40,
  },
  subtitle: {
    color: '#667085',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  item: {
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    color: '#003366',
    fontWeight: '600',
  },
  valueText: {
    fontSize: 14,
    color: '#667085',
    marginTop: 2,
  },
  continueBtn: {
    backgroundColor: '#0052CC',
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 30,
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
  },
  debugBtn: {
    backgroundColor: '#ff6b35',
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});