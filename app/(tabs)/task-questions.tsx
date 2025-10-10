import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGetTaskQuestions } from '@/hooks/useTaskApi';

interface QuestionItem {
  _id: string;
  question: string;
  answer?: string;
  askedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    verified?: boolean;
  };
  answeredBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    verified?: boolean;
  };
  createdAt: string;
  answeredAt?: string;
  status: 'pending' | 'answered';
}

export default function TaskQuestionsScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [newQuestion, setNewQuestion] = useState('');
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  const {
    data: questionsData,
    isLoading,
    error,
    refetch
  } = useGetTaskQuestions(taskId || '');

  const questions: QuestionItem[] = questionsData?.data || [];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
        <Text style={styles.errorTitle}>Failed to load questions</Text>
        <Text style={styles.errorSubtitle}>
          Could not load Q&A information. Please check your connection and try again.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmitQuestion = () => {
    if (newQuestion.trim().length < 10) {
      Alert.alert('Invalid Question', 'Please enter a question with at least 10 characters.');
      return;
    }

    Alert.alert(
      'Question Submitted',
      'Your question has been submitted and will be answered by the task creator soon.',
      [
        {
          text: 'OK',
          onPress: () => {
            setNewQuestion('');
            setShowAddQuestion(false);
            // Refresh questions list
            refetch();
          }
        }
      ]
    );
  };

  const renderQuestionItem = ({ item }: { item: QuestionItem }) => (
    <View style={styles.questionCard}>
      {/* Question */}
      <View style={styles.questionSection}>
        <View style={styles.questionHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {item.askedBy.firstName} {item.askedBy.lastName}
            </Text>
            {item.askedBy.verified && (
              <Ionicons name="checkmark-circle" size={16} color="#007bff" />
            )}
          </View>
          <Text style={styles.questionDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text style={styles.questionText}>{item.question}</Text>
      </View>

      {/* Answer */}
      {item.answer ? (
        <View style={styles.answerSection}>
          <View style={styles.answerHeader}>
            <View style={styles.userInfo}>
              <MaterialIcons name="reply" size={16} color="#28a745" />
              <Text style={styles.answeredBy}>
                {item.answeredBy?.firstName} {item.answeredBy?.lastName}
              </Text>
              {item.answeredBy?.verified && (
                <Ionicons name="checkmark-circle" size={16} color="#007bff" />
              )}
            </View>
            <Text style={styles.answerDate}>
              {item.answeredAt && formatDate(item.answeredAt)}
            </Text>
          </View>
          <Text style={styles.answerText}>{item.answer}</Text>
        </View>
      ) : (
        <View style={styles.pendingAnswer}>
          <MaterialIcons name="hourglass-empty" size={16} color="#ffc107" />
          <Text style={styles.pendingText}>Waiting for answer...</Text>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Questions & Answers</Text>
        <TouchableOpacity 
          style={styles.addIcon}
          onPress={() => setShowAddQuestion(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#007bff" />
        </TouchableOpacity>
      </View>

      {/* Questions List */}
      {questions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="quiz" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No questions yet</Text>
          <Text style={styles.emptySubtitle}>
            Be the first to ask a question about this task. Get clarity on requirements, timeline, or any other details.
          </Text>
          <TouchableOpacity 
            style={styles.askButton} 
            onPress={() => setShowAddQuestion(true)}
          >
            <Text style={styles.askButtonText}>Ask First Question</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{questions.length}</Text>
              <Text style={styles.statLabel}>Total Questions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {questions.filter(q => q.status === 'answered').length}
              </Text>
              <Text style={styles.statLabel}>Answered</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {questions.filter(q => q.status === 'pending').length}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          <FlatList
            data={questions}
            keyExtractor={(item) => item._id}
            renderItem={renderQuestionItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshing={isLoading}
            onRefresh={refetch}
          />
        </>
      )}

      {/* Add Question Modal */}
      {showAddQuestion && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ask a Question</Text>
              <TouchableOpacity onPress={() => setShowAddQuestion(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.questionInput}
              placeholder="What would you like to know about this task?"
              placeholderTextColor="#999"
              value={newQuestion}
              onChangeText={setNewQuestion}
              multiline={true}
              textAlignVertical="top"
              maxLength={500}
            />
            
            <View style={styles.characterCount}>
              <Text style={styles.characterText}>
                {newQuestion.length}/500 characters
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddQuestion(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  { opacity: newQuestion.trim().length < 10 ? 0.5 : 1 }
                ]}
                onPress={handleSubmitQuestion}
                disabled={newQuestion.trim().length < 10}
              >
                <Text style={styles.submitButtonText}>Submit Question</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  addIcon: {
    padding: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007bff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  askButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  askButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  questionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionSection: {
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  questionDate: {
    fontSize: 12,
    color: '#999',
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  answerSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  answeredBy: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
  },
  answerDate: {
    fontSize: 12,
    color: '#999',
  },
  answerText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  pendingAnswer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  pendingText: {
    fontSize: 14,
    color: '#ffc107',
    fontStyle: 'italic',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  questionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 20,
  },
  characterText: {
    fontSize: 12,
    color: '#999',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});