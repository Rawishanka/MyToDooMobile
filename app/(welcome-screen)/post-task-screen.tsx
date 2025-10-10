import { CreateTaskRequest } from '@/api/types/tasks';
import { useCreateTask } from '@/hooks/useTaskApi';
import { useCreateTaskStore } from '@/store/create-task-store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
  
  const createTaskMutation = useCreateTask();

  const handlePostTask = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!myTask.title || !myTask.description || !myTask.budget) {
        Alert.alert('Missing Information', 'Please fill in all required fields.');
        return;
      }

      // Prepare task data for API
      const taskData: CreateTaskRequest = {
        title: myTask.title,
        category: [], // Will be populated from categories if available
        dateType: 'Easy', // Default value
        time: myTask.time || 'Anytime',
        location: myTask.description, // Using description as location for now
        details: myTask.description,
        budget: myTask.budget,
        currency: 'AUD', // Default currency
        images: [], // Will be populated from photo if available
        coordinates: undefined,
      };

      console.log('🚀 Posting task:', taskData);

      const result = await createTaskMutation.mutateAsync(taskData);
      
      console.log('✅ Task created successfully:', result);
      
      // Reset the task store
      resetTask();
      
      // Show success message
      Alert.alert(
        'Task Posted Successfully!',
        'Your task has been posted and is now visible to other users.',
        [
          {
            text: 'View Task',
            onPress: () => router.push(`/(tabs)/task-detail?taskId=${result.data._id}`)
          },
          {
            text: 'Go to My Tasks',
            onPress: () => router.push('/(tabs)/mytasks-screen')
          }
        ]
      );
      
    } catch (error: any) {
      console.error('❌ Failed to create task:', error);
      Alert.alert(
        'Failed to Post Task',
        error?.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBudget = () => {
    if (myTask.budget) {
      return `AUD${myTask.budget}`;
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
        <Text style={styles.loadingText}>Posting your task...</Text>
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
          {myTask.photo && (
            <View style={styles.summaryItem}>
              <Text style={styles.label}>Images</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
                <Image source={{ uri: myTask.photo }} style={styles.taskImage} />
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
          style={styles.postButton}
          onPress={handlePostTask}
          disabled={isSubmitting}
        >
          <Ionicons name="send" size={20} color="#fff" />
          <Text style={styles.postButtonText}>Post Task</Text>
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
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});