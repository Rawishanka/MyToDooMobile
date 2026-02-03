import { CreateTaskRequest } from '@/src/api/types/tasks';
import { useCreateTask, usePostTaskDirect, usePostTaskWithImages } from '@/src/shared/hooks/useTaskApi';
import { formatCurrency, getCurrencyFromLocation } from '@/src/shared/utils/currency';
import { isNetworkError } from '@/src/shared/utils/networkErrorHandler';
import { useCreateTaskStore } from '@/src/store/create-task-store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PostTaskScreen() {
  const router = useRouter();
  const { myTask, resetTask } = useCreateTaskStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  
  const createTaskMutation = useCreateTask();
  const postTaskWithImagesMutation = usePostTaskWithImages();
  const postTaskDirectMutation = usePostTaskDirect(); // ✅ NEW: Direct posting approach

  // Helper functions to extract data from myTask
  const getTaskCategory = (task: any): string => {
    if (!task.isRemoval && task.category) {
      // Ensure category is always a string, handle both array and string inputs
      const category = Array.isArray(task.category) ? (task.category[0] || 'General') : task.category;
      return String(category).trim() || 'General'; // Always return a valid string
    }
    return task.isRemoval ? 'Removalist' : 'General';
  };

  const getTaskLocation = (task: any): string => {
    if (!task.isRemoval && task.location) {
      return task.location;
    }
    if (task.isRemoval && task.pickupLocation && task.deliveryLocation) {
      return `From ${task.pickupLocation} to ${task.deliveryLocation}`;
    }
    return task.description || 'Location to be determined';
  };

  // ✅ NEW: Format location for backend (string format with separate coordinates)
  const formatLocationForBackend = (task: any): string => {
    if (task.isRemoval) {
      return `From ${task.pickupLocation || 'Unknown'} to ${task.deliveryLocation || 'Unknown'}`;
    }
    return task.location || 'Location not specified';
  };

  const getTaskCoordinates = (task: any): { lat: number; lng: number } | undefined => {
    // Only return coordinates if we have valid location data from the user
    if (!task.isRemoval && task.coordinates && task.coordinates.lat && task.coordinates.lng) {
      return {
        lat: task.coordinates.lat,
        lng: task.coordinates.lng
      };
    }
    // Don't send coordinates if we don't have real location data
    return undefined;
  };

  const handlePostTask = async () => {
    // Prevent double-clicks
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setUploadProgress('Validating task data...');
      
      // Validate required fields
      if (!myTask.title || !myTask.description || !myTask.budget) {
        setIsSubmitting(false);
        setUploadProgress('');
        Alert.alert('Missing Information', 'Please fill in all required fields.');
        return;
      }

      // Prepare task data for API with EXACT backend format from documentation
      const coordinates = getTaskCoordinates(myTask);
      const imageUris = myTask.photos || [];
      
      const taskData: CreateTaskRequest = {
        title: myTask.title,
        category: getTaskCategory(myTask), // API expects single category string
        details: myTask.description,
        dateType: 'DoneBy',
        date: myTask.date 
          ? new Date(myTask.date).toISOString().split('T')[0] 
          : undefined,
        time: myTask.time || 'Anytime',
        locationType: myTask.locationType || 'In-person',
        location: String(formatLocationForBackend(myTask)).trim() || 'Location not specified', // ✅ Ensure location is always a valid string
        budget: myTask.budget,
        currency: 'LKR',
        // Only include images if we have them - backend requires images if field is present
      };
      
      // Only add images if we have them (backend validates images if present)
      if (imageUris.length > 0) {
        taskData.images = imageUris;
      }

      // Only add coordinates if we have valid location data
      if (coordinates) {
        taskData.coordinates = coordinates;
      }

      console.log('📸 Task Posting - Image URIs from store:', imageUris.length);
      console.log('📋 API Compliance Check:');
      console.log('  ✅ title:', taskData.title);
      console.log('  ✅ category:', taskData.category);
      console.log('  ✅ details:', taskData.details);
      console.log('  ✅ budget:', taskData.budget);
      console.log('  ✅ currency:', taskData.currency);
      console.log('  ✅ dateType:', taskData.dateType);
      console.log('  ✅ locationType:', taskData.locationType);
      console.log('  ✅ files count (images):', imageUris.length);
      console.log('📸 Task Posting - myTask.photos raw:', JSON.stringify(myTask.photos, null, 2));
      console.log('📸 Task Posting - imageUris extracted:', JSON.stringify(imageUris, null, 2));
      console.log('📸 Task Posting - STORE STATE FULL myTask:', JSON.stringify(myTask, null, 2));
      console.log('📸 First image URI:', imageUris[0]?.substring(0, 100));
      console.log('📸 FINAL TASK DATA WITH IMAGES:', JSON.stringify(taskData, null, 2));

      let result;
      
      if (imageUris.length > 0) {
        setUploadProgress(`Processing ${imageUris.length} image(s)...`);
        console.log('🚀 Using FormData approach for task with images (like profile upload)');
        
        // Use image URIs directly (like profile upload)
        console.log('🔍 === IMAGE FORMDATA PREPARATION ===');
        console.log('🔍 imageUris count:', imageUris.length);
        console.log('🔍 imageUris:', imageUris);
        
        // Keep images as file URIs for FormData upload
        taskData.images = imageUris;
        
        console.log('🚨 === FINAL TASK DATA BEFORE FORMDATA POSTING ===');
        console.log('🚨 taskData.images count:', taskData.images?.length);
        console.log('🚨 taskData.images (URIs):', taskData.images?.map(uri => uri.substring(0, 50) + '...'));
        console.log('🚨 taskData structure:', Object.keys(taskData));
        console.log('🚨 === ABOUT TO SEND TO BACKEND WITH FORMDATA ===');
        
        console.log('📤 Posting with', imageUris.length, 'image URIs using FormData (multipart/form-data)');
        result = await postTaskDirectMutation.mutateAsync(taskData);
        console.log('✅ Task posted with images (DIRECT) - Response:', result);
        
        // CRITICAL: Log the response to see if backend saved images
        console.log('🔍 === BACKEND RESPONSE ANALYSIS ===');
        console.log('🔍 Response has data:', !!result?.data);
        console.log('🔍 Response data has images:', !!result?.data?.images);
        console.log('🔍 Response images count:', result?.data?.images?.length || 0);
        if (result?.data?.images && result.data.images.length > 0) {
          console.log('✅ Backend successfully saved images!');
          result.data.images.forEach((img: any, idx: number) => {
            console.log(`📸 Response image ${idx}:`, {
              type: typeof img,
              length: typeof img === 'string' ? img.length : 'N/A',
              isDataUri: typeof img === 'string' && img.startsWith('data:'),
              preview: typeof img === 'string' ? img.substring(0, 50) : JSON.stringify(img).substring(0, 50)
            });
          });
        } else {
          if (__DEV__) {
            console.warn('🚨 CRITICAL: Backend did NOT save any images!');
            console.warn('🚨 We sent', imageUris.length, 'images but got', result?.data?.images?.length || 0, 'back');
          }
        }
      } else {
        setUploadProgress('Creating task...');
        console.log('📤 Posting task WITHOUT images');
        result = await createTaskMutation.mutateAsync(taskData);
        console.log('✅ Task posted without images - Response:', result);
      }
      
      // Reset the task store immediately
      resetTask();
      
      // Hide loading state
      setIsSubmitting(false);
      setUploadProgress('');
      
      // Navigate to the welcome/dashboard screen (Get Done tab)
      // Use router.push to index which is the Get Done screen
      router.dismissAll();
      router.push('/' as any);
      
    } catch (error: any) {
      // Only log non-network errors in development
      if (!isNetworkError(error) && __DEV__) {
        console.warn('⚠️ Failed to create task:', error);
      }
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error?.message?.includes('Images are too large')) {
        errorMessage = 'The selected images are too large. Please choose smaller images and try again.';
      } else if (error?.message?.includes('Authentication expired')) {
        errorMessage = 'Your session has expired. Please login again.';
      } else if (error?.message?.includes('Validation Error')) {
        errorMessage = error.message;
      } else if (error?.message?.includes('Failed to read image')) {
        errorMessage = 'Failed to process one or more images. Please try selecting different images.';
      }
      
      Alert.alert(
        'Failed to Post Task',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  const formatBudget = () => {
    if (myTask.budget) {
      // Handle different task types for location
      let address = '';
      if (!myTask.isRemoval && myTask.location) {
        address = myTask.location;
      } else if (myTask.isRemoval && myTask.pickupLocation) {
        address = myTask.pickupLocation;
      }
      
      const currencyInfo = getCurrencyFromLocation({ address });
      return formatCurrency(myTask.budget, currencyInfo);
    }
    return 'Not set';
  };

  const formatCategories = () => {
    return 'No categories selected';
  };

  if (isSubmitting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>
          {uploadProgress || 'Posting your task...'}
        </Text>
        {uploadProgress.includes('Converting') && (
          <Text style={styles.subLoadingText}>
            This may take a moment for multiple images
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review & Post Task</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Task Summary</Text>
          
          {/* Title */}
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Title</Text>
            <Text style={styles.value}>{myTask.title || 'Not set'}</Text>
          </View>

          {/* Description */}
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value} numberOfLines={3}>
              {myTask.description || 'Not set'}
            </Text>
          </View>

          {/* Categories */}
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Categories</Text>
            <Text style={styles.value}>{formatCategories()}</Text>
          </View>

          {/* Location */}
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{myTask.description || 'Not set'}</Text>
          </View>

          {/* Budget */}
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Budget</Text>
            <Text style={[styles.value, styles.budgetValue]}>{formatBudget()}</Text>
          </View>

          {/* Date & Time */}
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Date Type</Text>
            <Text style={styles.value}>Easy</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>{myTask.time || 'Anytime'}</Text>
          </View>

          {/* Images */}
          {(myTask.photos && myTask.photos.length > 0) && (
            <View style={styles.summaryItem}>
              <Text style={styles.label}>Images ({myTask.photos.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
                {myTask.photos.map((uri, index) => (
                  <Image 
                    key={index} 
                    source={{ uri }} 
                    style={[styles.taskImage, index > 0 && { marginLeft: 8 }]} 
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#007bff" />
          <Text style={styles.infoText}>
            Once posted, your task will be visible to all users. You'll receive notifications when users make offers.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push('/(welcome-screen)/title-screen')}
        >
          <Ionicons name="create-outline" size={20} color="#007bff" />
          <Text style={styles.editButtonText}>Edit Task</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.postButton, isSubmitting && styles.postButtonDisabled]}
          onPress={handlePostTask}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          <Ionicons name="send" size={20} color="#fff" />
          <Text style={styles.postButtonText}>
            {isSubmitting ? 'Posting...' : 'Post Task'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  subLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  summaryItem: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
  },
  budgetValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007bff',
  },
  imageContainer: {
    marginTop: 8,
  },
  taskImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976d2',
    marginLeft: 8,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
    gap: 6,
  },
  editButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
  postButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#007bff',
    gap: 6,
  },
  postButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});