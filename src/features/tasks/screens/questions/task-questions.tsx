import { useGetTaskQuestions } from '@/src/shared/hooks/useTaskApi';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState, LoadingState } from '../../components/shared';
import EmptyQuestionsState from './components/EmptyQuestionsState';
import QuestionCard from './components/QuestionCard';
import { RFValue } from '@/src/shared/utils/responsive';
import { BlueBackdrop } from '@/src/shared/components/custom_components/lightCard';
import { BS } from '@/src/shared/theme/blueSheet';

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
  const insets = useSafeAreaInsets();
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
    return <LoadingState message="Loading questions..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load questions"
        subtitle="Could not load Q&A information. Please check your connection and try again."
        onRetry={refetch}
        onGoBack={() => router.back()}
      />
    );
  }

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
    <QuestionCard question={item} />
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <BlueBackdrop />
      <StatusBar barStyle="light-content" backgroundColor="#003399" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Questions & Answers</Text>
        <TouchableOpacity 
          style={styles.addIcon}
          onPress={() => setShowAddQuestion(true)}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Questions List */}
      {questions.length === 0 ? (
        <EmptyQuestionsState onAskQuestion={() => setShowAddQuestion(true)} />
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

          <FlatList keyboardShouldPersistTaps="handled"
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
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 20}
            style={{ width: '100%', alignItems: 'center' }}
          >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ask a Question</Text>
              <TouchableOpacity onPress={() => setShowAddQuestion(false)}>
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.75)" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.questionInput}
              placeholder="What would you like to know about this task?"
              placeholderTextColor={BS.placeholder}
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
          </KeyboardAvoidingView>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003399',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: RFValue(16),
    color: 'rgba(255,255,255,0.75)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: RFValue(20),
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: RFValue(16),
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  backIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ff6b35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 18,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: RFValue(20),
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: RFValue(12),
    color: 'rgba(255,255,255,0.78)',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: RFValue(20),
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: RFValue(16),
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  askButton: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  askButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
  questionCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 20,
    padding: 16,
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
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  questionDate: {
    fontSize: RFValue(12),
    color: 'rgba(255,255,255,0.75)',
  },
  questionText: {
    fontSize: RFValue(16),
    color: '#FFFFFF',
    lineHeight: 22,
  },
  answerSection: {
    backgroundColor: 'rgba(255,255,255,0.10)',
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
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#7ED957',
  },
  answerDate: {
    fontSize: RFValue(12),
    color: 'rgba(255,255,255,0.75)',
  },
  answerText: {
    fontSize: RFValue(15),
    color: '#FFFFFF',
    lineHeight: 20,
  },
  pendingAnswer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  pendingText: {
    fontSize: RFValue(14),
    color: '#FCD34D',
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
    backgroundColor: '#003399',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
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
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  questionInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 12,
    color: '#0B1B4D',
    backgroundColor: '#FFFFFF',
    fontSize: RFValue(16),
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 20,
  },
  characterText: {
    fontSize: RFValue(12),
    color: 'rgba(255,255,255,0.75)',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    height: 48,
    justifyContent: 'center',
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#ff6b35',
    height: 48,
    justifyContent: 'center',
    borderRadius: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
});