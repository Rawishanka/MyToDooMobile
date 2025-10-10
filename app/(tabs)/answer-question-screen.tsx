import { useAnswerTaskQuestion, useGetTaskById, useGetTaskQuestions } from '@/hooks/useTaskApi';
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

export default function AnswerQuestionScreen() {
  const router = useRouter();
  const { taskId, questionId } = useLocalSearchParams<{ 
    taskId: string; 
    questionId: string;
  }>();
  
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: taskData, isLoading: isTaskLoading } = useGetTaskById(taskId || '', !!taskId);
  const { data: questionsData, isLoading: isQuestionsLoading } = useGetTaskQuestions(taskId || '', !!taskId);
  const answerQuestionMutation = useAnswerTaskQuestion();

  const task = taskData?.data;
  const questions = questionsData?.data || [];
  const question = questions.find(q => q._id === questionId);

  const isLoading = isTaskLoading || isQuestionsLoading;

  const handleSubmitAnswer = async () => {
    try {
      // Validate input
      if (!answer.trim()) {
        Alert.alert('Missing Answer', 'Please enter your answer.');
        return;
      }

      if (answer.trim().length < 10) {
        Alert.alert('Answer Too Short', 'Please provide more details in your answer.');
        return;
      }

      setIsSubmitting(true);

      console.log('💬 Posting answer:', answer.trim());

      const result = await answerQuestionMutation.mutateAsync({
        taskId: taskId!,
        questionId: questionId!,
        answer: answer.trim(),
      });

      console.log('✅ Answer posted successfully:', result);

      Alert.alert(
        'Answer Posted!',
        'Your answer has been sent to the person who asked the question.',
        [
          {
            text: 'View All Questions',
            onPress: () => router.push(`./task-questions?taskId=${taskId}`)
          },
          {
            text: 'Back to Task',
            onPress: () => router.push(`./task-detail?taskId=${taskId}`)
          }
        ]
      );

    } catch (error: any) {
      console.error('❌ Failed to post answer:', error);
      Alert.alert(
        'Failed to Post Answer',
        error?.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAnswerTips = () => {
    return [
      'Be specific and clear in your response',
      'Include relevant details or instructions',
      'Mention any materials or tools needed',
      'Provide timeline or schedule information',
      'Be helpful and professional'
    ];
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading question details...</Text>
      </View>
    );
  }

  if (!task || !question) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
        <Text style={styles.errorTitle}>Question Not Found</Text>
        <Text style={styles.errorSubtitle}>Could not load question details.</Text>
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
        <Text style={styles.headerTitle}>Answer Question</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Summary */}
        <View style={styles.taskSummary}>
          <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
          <Text style={styles.taskLocation}>
            {task.location?.address || 'Location not specified'}
          </Text>
        </View>

        {/* Original Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.sectionTitle}>❓ Question</Text>
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionAsker}>
                Asked by {question.askedBy?.firstName} {question.askedBy?.lastName}
              </Text>
              <Text style={styles.questionDate}>
                {new Date(question.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.questionText}>{question.question}</Text>
          </View>
        </View>

        {/* Answer Form */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Your Answer</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.answerInput}
              value={answer}
              onChangeText={setAnswer}
              placeholder="Type your answer here... Be helpful and specific."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor="#999"
              maxLength={1000}
            />
            <Text style={styles.characterCount}>
              {answer.length}/1000 characters
            </Text>
          </View>

          {/* Answer Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Tips for a Great Answer:</Text>
            {getAnswerTips().map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* Guidelines */}
          <View style={styles.guidelinesContainer}>
            <Text style={styles.guidelinesTitle}>📋 Answer Guidelines:</Text>
            <Text style={styles.guideline}>• Answer only the question that was asked</Text>
            <Text style={styles.guideline}>• Provide accurate and helpful information</Text>
            <Text style={styles.guideline}>• Be professional and respectful</Text>
            <Text style={styles.guideline}>• Include relevant details without being overwhelming</Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submittingButton]}
          onPress={handleSubmitAnswer}
          disabled={isSubmitting || answer.trim().length < 10}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="chatbubble" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Post Answer</Text>
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
  taskLocation: {
    fontSize: 14,
    color: '#666',
  },
  questionContainer: {
    marginTop: 24,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionAsker: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  questionDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  questionText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
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
  answerInput: {
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
  tipsContainer: {
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  tipBullet: {
    fontSize: 14,
    color: '#495057',
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  guidelinesContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 16,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 8,
  },
  guideline: {
    fontSize: 12,
    color: '#2e7d32',
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
    backgroundColor: '#28a745',
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