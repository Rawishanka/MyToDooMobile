import { CreateOfferRequest } from '@/api/types/tasks';
import { useCreateOffer, useGetTaskById } from '@/hooks/useTaskApi';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function MakeOfferScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: taskData, isLoading } = useGetTaskById(taskId || '', !!taskId);
  const createOfferMutation = useCreateOffer();

  const task = taskData?.data;

  const handleSubmitOffer = async () => {
    try {
      // Validate inputs
      if (!offerAmount.trim()) {
        Alert.alert('Missing Amount', 'Please enter your offer amount.');
        return;
      }

      if (!offerMessage.trim()) {
        Alert.alert('Missing Message', 'Please add a message to your offer.');
        return;
      }

      const amount = parseFloat(offerAmount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid amount.');
        return;
      }

      setIsSubmitting(true);

      const offerData: CreateOfferRequest = {
        amount: amount,
        message: offerMessage.trim(),
      };

      console.log('🤝 Creating offer:', offerData);

      const result = await createOfferMutation.mutateAsync({
        taskId: taskId!,
        offerData,
      });

      console.log('✅ Offer created successfully:', result);

      Alert.alert(
        'Offer Submitted!',
        'Your offer has been sent to the task creator. You\'ll be notified when they respond.',
        [
          {
            text: 'View Task',
            onPress: () => router.push(`/task-detail?taskId=${taskId}`)
          },
          {
            text: 'Go to Browse',
            onPress: () => router.push('/(tabs)/browse-screen')
          }
        ]
      );

    } catch (error: any) {
      console.error('❌ Failed to create offer:', error);
      Alert.alert(
        'Failed to Submit Offer',
        error?.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading task details...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
        <Text style={styles.errorTitle}>Task Not Found</Text>
        <Text style={styles.errorSubtitle}>Could not load task details.</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Make an Offer</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Summary */}
        <View style={styles.taskSummary}>
          <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
          <Text style={styles.taskBudget}>
            Budget: {task.formattedBudget || `${task.currency || 'A$'}${task.budget}`}
          </Text>
          <Text style={styles.taskLocation}>
            {task.location?.address || 'Location not specified'}
          </Text>
        </View>

        {/* Offer Form */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Your Offer</Text>
          
          {/* Amount Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Offer Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>{task.currency || 'A$'}</Text>
              <TextInput
                style={styles.amountInput}
                value={offerAmount}
                onChangeText={setOfferAmount}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            <Text style={styles.inputHint}>
              Task budget: {task.formattedBudget || `${task.currency || 'A$'}${task.budget}`}
            </Text>
          </View>

          {/* Message Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Message to Task Creator</Text>
            <TextInput
              style={styles.messageInput}
              value={offerMessage}
              onChangeText={setOfferMessage}
              placeholder="Introduce yourself and explain why you're the right person for this task..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
            <Text style={styles.inputHint}>
              Be specific about your experience and availability
            </Text>
          </View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Tips for a great offer:</Text>
            <Text style={styles.tip}>• Be clear about what's included in your price</Text>
            <Text style={styles.tip}>• Mention your relevant experience</Text>
            <Text style={styles.tip}>• Include your availability</Text>
            <Text style={styles.tip}>• Ask questions if anything is unclear</Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submittingButton]}
          onPress={handleSubmitOffer}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Offer</Text>
          )}
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
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
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
  backIcon: {
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
  taskSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  taskBudget: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
    marginBottom: 4,
  },
  taskLocation: {
    fontSize: 14,
    color: '#666',
  },
  formContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  currencySymbol: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#666',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  amountInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000',
    minHeight: 100,
    backgroundColor: '#fff',
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tipsContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  tip: {
    fontSize: 12,
    color: '#1976d2',
    marginBottom: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submittingButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});