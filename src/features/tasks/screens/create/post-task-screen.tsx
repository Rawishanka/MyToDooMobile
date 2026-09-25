import { BRAND_BLUE } from '@/src/shared/theme/brandColors';
import { FLOW, FlowBackground, flowCard, primaryShadow } from './flowTheme';
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
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';

export default function PostTaskScreen() {
  const router = useRouter();
  const { myTask, resetTask } = useCreateTaskStore();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
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
        setUploadProgress(`Uploading ${imageUris.length} image(s) to CDN...`);
        console.log('🚀 Using CDN upload-safe for task images (OCR validated)');
        console.log('📸 imageUris count:', imageUris.length);
        
        // Images will be uploaded via CDN upload-safe inside postTaskDirect
        // The function handles: CDN upload → get URLs → POST /tasks with image_urls
        taskData.images = imageUris;
        
        console.log('📤 Posting task with images via CDN upload-safe...');
        result = await postTaskDirectMutation.mutateAsync(taskData);
        console.log('✅ Task posted with CDN images - Response:', result);
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
      } else if (error?.message?.includes('content policy')) {
        errorMessage = 'One or more images were rejected due to content policy. Please use appropriate images.';
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
      <View style={[styles.loadingContainer, isDarkMode && { backgroundColor: '#0B1120' }]}>
        <StatusBar barStyle="light-content" backgroundColor={isDarkMode ? '#0B1120' : FLOW.blue} />
        <FlowBackground isDarkMode={isDarkMode} />
        <ActivityIndicator size="large" color={isDarkMode ? '#FFFFFF' : FLOW.blue} />
        <Text style={[styles.loadingText, isDarkMode && { color: '#FFFFFF' }]}>
          {uploadProgress || 'Posting your task...'}
        </Text>
        {uploadProgress.includes('Converting') && (
          <Text style={[styles.subLoadingText, isDarkMode && { color: 'rgba(255,255,255,0.75)' }]}>
            This may take a moment for multiple images
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <StatusBar barStyle="light-content" backgroundColor={isDarkMode ? "#0B1120" : FLOW.blue} />
      <FlowBackground isDarkMode={isDarkMode} />
      
      {/* Header */}
      <View style={[styles.header, isDarkMode && { backgroundColor: BRAND_BLUE, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review & Post Task</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
        {/* Task Summary Card */}
        <View style={[styles.summaryCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1 }]}>
          <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>Task Summary</Text>
          
          {/* Title */}
          <View style={styles.summaryItem}>
            <Text style={[styles.label, isDarkMode && { color: '#94A3B8' }]}>Title</Text>
            <Text style={[styles.value, isDarkMode && { color: '#F8FAFC' }]}>{myTask.title || 'Not set'}</Text>
          </View>

          {/* Description */}
          <View style={styles.summaryItem}>
            <Text style={[styles.label, isDarkMode && { color: '#94A3B8' }]}>Description</Text>
            <Text style={[styles.value, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={3}>
              {myTask.description || 'Not set'}
            </Text>
          </View>

          {/* Categories */}
          <View style={styles.summaryItem}>
            <Text style={[styles.label, isDarkMode && { color: '#94A3B8' }]}>Categories</Text>
            <Text style={[styles.value, isDarkMode && { color: '#F8FAFC' }]}>{formatCategories()}</Text>
          </View>

          {/* Location */}
          <View style={styles.summaryItem}>
            <Text style={[styles.label, isDarkMode && { color: '#94A3B8' }]}>Location</Text>
            <Text style={[styles.value, isDarkMode && { color: '#F8FAFC' }]}>{myTask.description || 'Not set'}</Text>
          </View>

          {/* Budget */}
          <View style={styles.summaryItem}>
            <Text style={[styles.label, isDarkMode && { color: '#94A3B8' }]}>Budget</Text>
            <Text style={[styles.value, styles.budgetValue, isDarkMode && { color: '#FFFFFF' }]}>{formatBudget()}</Text>
          </View>

          {/* Date & Time */}
          <View style={styles.summaryItem}>
            <Text style={[styles.label, isDarkMode && { color: '#94A3B8' }]}>Date Type</Text>
            <Text style={[styles.value, isDarkMode && { color: '#F8FAFC' }]}>Easy</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={[styles.label, isDarkMode && { color: '#94A3B8' }]}>Time</Text>
            <Text style={[styles.value, isDarkMode && { color: '#F8FAFC' }]}>{myTask.time || 'Anytime'}</Text>
          </View>

          {/* Images */}
          {(myTask.photos && myTask.photos.length > 0) && (
            <View style={styles.summaryItem}>
              <Text style={[styles.label, isDarkMode && { color: '#94A3B8' }]}>Images ({myTask.photos.length})</Text>
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
        <View style={[styles.infoBox, isDarkMode && { backgroundColor: 'rgba(255,255,255,0.10)', borderColor: 'rgba(255,255,255,0.18)' }]}>
          <Ionicons name="information-circle" size={20} color={isDarkMode ? '#FFFFFF' : FLOW.blue} />
          <Text style={[styles.infoText, isDarkMode && { color: 'rgba(255,255,255,0.75)' }]}>
            Once posted, your task will be visible to all users. You'll receive notifications when users make offers.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, isDarkMode && { backgroundColor: '#0B1120', borderTopColor: '#1E293B' }, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity 
          style={[styles.editButton, isDarkMode && { borderColor: '#FFFFFF', backgroundColor: 'transparent' }]}
          onPress={() => router.push('/(welcome-screen)/title-screen')}
        >
          <Ionicons name="create-outline" size={20} color={isDarkMode ? '#FFFFFF' : FLOW.blue} />
          <Text style={[styles.editButtonText, isDarkMode && { color: '#FFFFFF' }]}>Edit Task</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.postButton, isSubmitting && styles.postButtonDisabled]}
          onPress={handlePostTask}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          <Ionicons name="send" size={20} color="#fff" />
          <Text style={[styles.postButtonText, isSubmitting && { color: FLOW.disabledText }]}>
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
    backgroundColor: FLOW.page,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: FLOW.page,
  },
  loadingText: {
    marginTop: 12,
    fontSize: RFValue(16),
    color: FLOW.navy,
  },
  subLoadingText: {
    marginTop: 8,
    fontSize: RFValue(14),
    color: FLOW.muted,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 22,
    backgroundColor: FLOW.blue,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentInner: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  summaryCard: {
    ...flowCard,
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: FLOW.navy,
    marginBottom: 16,
  },
  summaryItem: {
    marginBottom: 16,
  },
  label: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: FLOW.muted,
    marginBottom: 4,
  },
  value: {
    fontSize: RFValue(16),
    color: FLOW.navy,
    lineHeight: 22,
  },
  budgetValue: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: FLOW.blue,
  },
  imageContainer: {
    marginTop: 8,
  },
  taskImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: FLOW.tint,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: FLOW.tint,
    borderWidth: 1,
    borderColor: FLOW.tintBorder,
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: RFValue(14),
    color: FLOW.text,
    marginLeft: 8,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: FLOW.line,
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: FLOW.blue,
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  editButtonText: {
    color: FLOW.blue,
    fontSize: RFValue(16),
    fontWeight: '600',
  },
  postButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    backgroundColor: FLOW.orange,
    gap: 6,
    ...primaryShadow,
  },
  postButtonDisabled: {
    backgroundColor: FLOW.disabledFill,
    shadowOpacity: 0,
    elevation: 0,
  },
  postButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '700',
  },
});