import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuthStore } from '@/src/store/auth-task-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnswerQuestionModal } from './AnswerQuestionModal';

interface QuestionsListProps {
  questions: any[];
  isLoading: boolean;
  onAskQuestion: () => void;
  taskId?: string;
  currentUserId?: string;
  taskCreatorId?: string;
  onRefreshQuestions?: () => void;
}

export const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  isLoading,
  onAskQuestion,
  taskId,
  currentUserId,
  taskCreatorId,
  onRefreshQuestions,
}) => {
  const insets = useSafeAreaInsets();
  const currentUser = useAuthStore((state) => state.user);
  const [failedImages, setFailedImages] = React.useState<Set<string>>(new Set());

  // Helper function to get user profile picture
  const getUserAvatar = (question: any) => {
    const user = question.askedBy || question.user || question.questioner;
    
    // If no user data in question, use current user's avatar
    if (!user && currentUser) {
      return currentUser.profilePicture || currentUser.avatar;
    }
    
    if (!user) return null;
    
    return user.profilePicture || user.avatar || user.profile_picture || user.image;
  };
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  
  // Debug logging - simplified
  React.useEffect(() => {
    console.log('🔍 QuestionsList Debug Info:', {
      totalQuestions: questions.length,
      currentUserId: currentUserId,
      taskCreatorId: taskCreatorId,
      isTaskCreator: currentUserId === taskCreatorId,
      pendingQuestions: questions.filter(q => !q.answer || q.status === 'pending').length
    });
  }, [questions, currentUserId, taskCreatorId]);
  
  const handleAnswerQuestion = (question: any) => {
    console.log('🔘 Answer button pressed for question:', question._id);
    const questionTaskId = question.taskId || taskId;
    console.log('🔘 Using taskId for API call:', questionTaskId);
    setSelectedQuestion({
      ...question,
      taskIdToUse: questionTaskId // Add this for the modal to use
    });
    setShowAnswerModal(true);
  };

  // Helper function to check if user can answer a specific question
  const canUserAnswerQuestion = (question: any): boolean => {
    // Only task creators can answer questions
    if (!currentUserId || !taskCreatorId) {
      console.log('❌ Missing user IDs - currentUserId:', currentUserId, 'taskCreatorId:', taskCreatorId);
      return false;
    }
    
    // Check if current user is the task creator
    const isTaskCreator = currentUserId === taskCreatorId;
    console.log('✅ Permission check - isTaskCreator:', isTaskCreator, 'for question:', question._id);
    
    return isTaskCreator;
  };

  // Helper function to check if question has an answer
  const hasValidAnswer = (question: any): boolean => {
    if (!question.answer) return false;
    
    // Handle both string and object answer formats
    if (typeof question.answer === 'string') {
      return question.answer.trim().length > 0;
    }
    
    if (typeof question.answer === 'object' && question.answer.text) {
      return question.answer.text.trim().length > 0;
    }
    
    return false;
  };

  return (
    <View style={styles.container}>
      <View style={styles.questionsHeader}>
        <View style={styles.questionsCount}>
          <Ionicons name="chatbubble-outline" size={16} color="#666" />
          <Text style={styles.questionsCountText}>
            Questions about this task ({questions.length})
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={styles.loadingStateText}>Loading questions...</Text>
        </View>
      ) : questions.length === 0 ? (
        <View style={[styles.emptyState, { marginBottom: 100 }]}>
          <Ionicons name="help-circle-outline" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>No questions yet</Text>
          <Text style={styles.emptyStateSubtext}>Be the first to ask a question!</Text>
        </View>
      ) : (
        <FlatList
          data={questions}
          scrollEnabled={false}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item: question }: { item: any }) => (
            <View style={styles.questionCard}>
              {/* DEBUG: Let's check what's in the question data */}
              {(() => {
                if (__DEV__) {
                  console.log('🐛 Question data debug:', {
                    id: question._id,
                    askedBy: question.askedBy,
                    user: question.user,
                    questioner: question.questioner,
                    isAnonymous: question.isAnonymous,
                    type: typeof question.askedBy,
                    keys: question.askedBy ? Object.keys(question.askedBy) : 'no askedBy'
                  });
                }
                return null;
              })()}
              
              {/* PRIVACY: Removed task context header since we only show questions for current task */}
              
              <View style={styles.questionHeader}>
                <View style={styles.questionUserSection}>
                  <View style={styles.questionAvatar}>
                    <Ionicons name="person" size={20} color="#666" />
                  </View>
                  <View style={styles.questionUserInfo}>
                    <Text style={styles.questionUserName}>
                      {question.isAnonymous
                        ? 'Anonymous User'
                        : (() => {
                            // Handle different possible user data structures
                            const user = question.askedBy || question.user || question.questioner;
                            
                            // If no user data in question, check if it might be current user's question
                            if (!user && currentUser) {
                              const currentUserFullName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
                              return currentUserFullName || currentUser.email?.split('@')[0] || 'You';
                            }
                            
                            if (!user) return 'Unknown User';
                            
                            const firstName = user.firstName || user.first_name || '';
                            const lastName = user.lastName || user.last_name || '';
                            const fullName = `${firstName} ${lastName}`.trim();
                            
                            // If we have a full name, use it
                            if (fullName) return fullName;
                            
                            // Fallback to email or username if available
                            if (user.email) return user.email.split('@')[0];
                            if (user.username) return user.username;
                            if (user.name) return user.name;
                            
                            return 'Unknown User';
                          })()}
                    </Text>
                    <Text style={styles.questionTime}>
                      {new Date(question.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
                
                {/* Question Status Badge */}
                <View style={[
                  styles.statusBadge, 
                  question.status === 'answered' ? styles.statusAnswered : styles.statusPending
                ]}>
                  <Text style={[
                    styles.statusText,
                    question.status === 'answered' ? styles.statusAnsweredText : styles.statusPendingText
                  ]}>
                    {question.status === 'answered' ? 'Answered' : 'Pending'}
                  </Text>
                </View>
              </View>

              <Text style={styles.questionText}>
                {typeof question.question === 'string'
                  ? question.question
                  : question.question?.text || 'No question text'}
              </Text>

              {/* Answer Section or Action Button */}
              {hasValidAnswer(question) ? (
                <View style={styles.answerSection}>
                  <Text style={styles.answerLabel}>
                    Answer from {(() => {
                      const answerer = question.answeredBy || question.posterId;
                      if (!answerer) return 'poster';
                      
                      const firstName = answerer.firstName || answerer.first_name || '';
                      const lastName = answerer.lastName || answerer.last_name || '';
                      const fullName = `${firstName} ${lastName}`.trim();
                      
                      return fullName || answerer.email?.split('@')[0] || answerer.username || 'poster';
                    })()}:
                  </Text>
                  <Text style={styles.answerText}>
                    {typeof question.answer === 'string'
                      ? question.answer
                      : question.answer?.text || 'No answer text'}
                  </Text>
                  {question.answeredAt && (
                    <Text style={styles.answerTime}>
                      Answered on {new Date(question.answeredAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              ) : (
                // Question has no answer yet - show appropriate button/message
                (() => {
                  const canAnswer = canUserAnswerQuestion(question);
                  
                  console.log('🎯 Final render decision for question', question._id, ':', {
                    canAnswer,
                    hasAnswer: hasValidAnswer(question),
                    shouldShowButton: canAnswer && !hasValidAnswer(question)
                  });

                  if (canAnswer) {
                    return (
                      <TouchableOpacity 
                        style={styles.answerButton} 
                        onPress={() => handleAnswerQuestion(question)}
                      >
                        <Ionicons name="chatbubble-ellipses-outline" size={16} color="#007AFF" />
                        <Text style={styles.answerButtonText}>Answer this question</Text>
                      </TouchableOpacity>
                    );
                  } else {
                    return (
                      <View style={styles.noAnswerYet}>
                        <Text style={styles.noAnswerText}>Waiting for answer from task creator...</Text>
                      </View>
                    );
                  }
                })()
              )}
            </View>
          )}
        />
      )}

      {/* Ask Question Button with Safe Area */}
      <TouchableOpacity 
        style={[
          styles.askQuestionButton, 
          { marginBottom: Math.max(insets.bottom, 20) }
        ]} 
        onPress={onAskQuestion}
      >
        <Ionicons name="add-circle" size={24} color="#4CAF50" />
        <Text style={styles.askQuestionButtonText}>ASK QUESTION</Text>
      </TouchableOpacity>

      {/* Answer Question Modal */}
      {selectedQuestion && (
        <AnswerQuestionModal
          visible={showAnswerModal}
          onClose={() => {
            setShowAnswerModal(false);
            setSelectedQuestion(null);
          }}
          question={selectedQuestion}
          taskId={taskId || ''}
          onAnswerSubmitted={() => {
            // Refresh questions list after answer is submitted
            console.log('🔄 Refreshing questions after answer submission...');
            if (onRefreshQuestions) {
              onRefreshQuestions();
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 0, // Removed since button is now fixed
  },
  questionsHeader: {
    marginBottom: 16,
  },
  questionsCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionsCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  loadingState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingStateText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  questionCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  questionHeader: {
    marginBottom: 12,
  },
  questionUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  questionUserInfo: {
    flex: 1,
  },
  questionUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  questionTime: {
    fontSize: 12,
    color: '#999',
  },
  questionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  answerSection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 6,
  },
  answerText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  askQuestionButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 0,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  askQuestionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusAnswered: {
    backgroundColor: '#E8F5E8',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusAnsweredText: {
    color: '#4CAF50',
  },
  statusPendingText: {
    color: '#FF9800',
  },
  answerTime: {
    fontSize: 11,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  answerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F8FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginTop: 8,
  },
  answerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 6,
  },
  noAnswerYet: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
  },
  noAnswerText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  taskContextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  taskContextText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default QuestionsList;
