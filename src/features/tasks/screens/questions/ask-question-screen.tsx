import { AttachmentItem, AttachmentPicker } from '@/src/shared/components/AttachmentPicker';
import { useGetTaskById, usePostTaskQuestion } from '@/src/shared/hooks/useTaskApi';
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
    View,
} from 'react-native';

export default function AskQuestionScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  
  const [question, setQuestion] = useState('');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: taskData, isLoading } = useGetTaskById(taskId || '', !!taskId);
  const postQuestionMutation = usePostTaskQuestion();

  const task = taskData?.data;

  const handleSubmitQuestion = async () => {
    try {
      // Validate input
      if (!question.trim()) {
        Alert.alert('Missing Question', 'Please enter your question.');
        return;
      }

      if (question.trim().length < 10) {
        Alert.alert('Question Too Short', 'Please provide more details in your question.');
        return;
      }

      setIsSubmitting(true);

      console.log('❓ Posting question with attachments:', {
        question: question.trim(),
        attachments: attachments.length
      });

      // TODO: Update API to support attachments
      // For now, we'll include attachment info in the question text if there are any
      let finalQuestion = question.trim();
      if (attachments.length > 0) {
        const attachmentInfo = attachments.map(att => 
          `📎 ${att.type === 'image' ? '🖼️' : '📄'} ${att.name}`
        ).join('\n');
        finalQuestion += `\n\nAttached files:\n${attachmentInfo}`;
      }

      const result = await postQuestionMutation.mutateAsync({
        taskId: taskId!,
        question: finalQuestion,
      });

      console.log('✅ Question posted successfully:', result);

      Alert.alert(
        'Question Posted!',
        'Your question has been sent to the task creator. You\'ll be notified when they respond.',
        [
          {
            text: 'View Questions',
            onPress: () => router.push(`./task-questions?taskId=${taskId}`)
          },
          {
            text: 'Back to Task',
            onPress: () => router.push(`./task-detail?taskId=${taskId}`)
          }
        ]
      );

    } catch (error: any) {
      console.error('❌ Failed to post question:', error);
      Alert.alert(
        'Failed to Post Question',
        error?.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSuggestions = () => {
    const suggestions = [
      'What tools or equipment should I bring?',
      'How long do you expect this task to take?',
      'Are there any specific skills required?',
      'Is parking available at the location?',
      'What is the preferred time of day?',
      'Are materials included in the budget?',
      'Do you have a deadline for completion?',
      'Is this a one-time task or ongoing?'
    ];
    return suggestions;
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
        <Text style={styles.headerTitle}>Ask a Question</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Summary */}
        <View style={styles.taskSummary}>
          <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
          <Text style={styles.taskCreator}>
            Posted by {task.createdBy?.firstName} {task.createdBy?.lastName}
          </Text>
          <Text style={styles.taskLocation}>
            {task.location?.address || 'Location not specified'}
          </Text>
        </View>

        {/* Question Form */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Your Question</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.questionInput}
              value={question}
              onChangeText={setQuestion}
              placeholder="Type your question here... Be specific to get the best answer."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor="#999"
              maxLength={500}
            />
            <Text style={styles.characterCount}>
              {question.length}/500 characters
            </Text>
          </View>

          {/* Attachment Picker */}
          <AttachmentPicker
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            maxAttachments={3}
            allowImages={true}
            allowDocuments={true}
          />

          {/* Question Suggestions */}
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>💡 Common Questions:</Text>
            {getSuggestions().map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => setQuestion(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Guidelines */}
          <View style={styles.guidelinesContainer}>
            <Text style={styles.guidelinesTitle}>📋 Question Guidelines:</Text>
            <Text style={styles.guideline}>• Be specific and clear in your question</Text>
            <Text style={styles.guideline}>• Include images if they help explain what you need</Text>
            <Text style={styles.guideline}>• Attach relevant documents if helpful</Text>
            <Text style={styles.guideline}>• Ask about task details, requirements, or timeline</Text>
            <Text style={styles.guideline}>• Avoid personal or irrelevant questions</Text>
            <Text style={styles.guideline}>• Check existing Q&A first to avoid duplicates</Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submittingButton]}
          onPress={handleSubmitQuestion}
          disabled={isSubmitting || question.trim().length < 10}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="help-circle" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Post Question</Text>
            </>
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
  taskCreator: {
    fontSize: 14,
    color: '#666',
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
  questionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000',
    minHeight: 120,
    backgroundColor: '#fff',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  suggestionsContainer: {
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  suggestionItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  suggestionText: {
    fontSize: 14,
    color: '#495057',
  },
  guidelinesContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 16,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  guideline: {
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
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