import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  
  // Debug logging
  React.useEffect(() => {
    console.log('🔍 QuestionsList Debug:', {
      questionsCount: questions.length,
      taskId,
      currentUserId,
      taskCreatorId,
      canAnswer: currentUserId === taskCreatorId,
      questions: questions.map(q => ({ id: q._id, hasAnswer: !!q.answer, status: q.status }))
    });
  }, [questions, taskId, currentUserId, taskCreatorId]);
  
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
        <View style={styles.emptyState}>
          <Ionicons name="help-circle-outline" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>No questions yet</Text>
          <Text style={styles.emptyStateSubtext}>Be the first to ask a question!</Text>
        </View>
      ) : (
        <FlatList
          data={questions}
          scrollEnabled={false}
          keyExtractor={(item: any) => item._id}
          renderItem={({ item: question }: { item: any }) => (
            <View style={styles.questionCard}>
              {/* Show task context for public questions */}
              {question.isPublic && question.taskId !== taskId && (
                <View style={styles.taskContextHeader}>
                  <Ionicons name="link-outline" size={14} color="#007AFF" />
                  <Text style={styles.taskContextText}>
                    From task: {question.taskTitle || 'Other task'}
                  </Text>
                </View>
              )}
              
              <View style={styles.questionHeader}>
                <View style={styles.questionUserSection}>
                  <View style={styles.questionAvatar}>
                    <Ionicons name="person" size={20} color="#666" />
                  </View>
                  <View style={styles.questionUserInfo}>
                    <Text style={styles.questionUserName}>
                      {question.isAnonymous
                        ? 'Anonymous User'
                        : `${question.askedBy?.firstName || question.userId?.firstName} ${question.askedBy?.lastName || question.userId?.lastName}`}
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

              {question.answer ? (
                <View style={styles.answerSection}>
                  <Text style={styles.answerLabel}>
                    Answer from {question.answeredBy?.firstName || question.posterId?.firstName || 'poster'}:
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
              ) : (() => {
                // For current task questions: allow task creator to answer
                // For public questions: allow the original task creator to answer
                const questionTaskId = question.taskId || taskId;
                const isCurrentTaskQuestion = !question.taskId || question.taskId === taskId;
                const canAnswer = isCurrentTaskQuestion 
                  ? (currentUserId === taskCreatorId)
                  : (currentUserId === question.taskCreatedBy?._id || currentUserId === question.createdBy?._id);
                
                // Check if question already has an answer
                const hasAnswer = question.answer && 
                  (typeof question.answer === 'string' ? question.answer.trim() !== '' : 
                   question.answer.text && question.answer.text.trim() !== '');
                
                console.log('🔍 Answer permission check:', {
                  questionId: question._id,
                  questionTaskId,
                  isCurrentTaskQuestion,
                  currentUserId,
                  taskCreatorId,
                  questionTaskCreatedBy: question.taskCreatedBy?._id,
                  questionCreatedBy: question.createdBy?._id,
                  canAnswer,
                  hasAnswer,
                  questionStatus: question.status,
                  answerData: question.answer,
                  showButton: canAnswer && !hasAnswer
                });
                
                // Show answer button only if user can answer AND question doesn't have an answer yet
                return canAnswer && !hasAnswer ? (
                  <TouchableOpacity 
                    style={styles.answerButton} 
                    onPress={() => {
                      console.log('🔘 Answer button pressed for question:', question._id);
                      console.log('🔘 Using taskId:', questionTaskId);
                      handleAnswerQuestion(question);
                    }}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color="#007AFF" />
                    <Text style={styles.answerButtonText}>Answer this question</Text>
                  </TouchableOpacity>
                ) : hasAnswer ? (
                  // Question already has an answer, don't show anything
                  null
                ) : canAnswer ? (
                  // User can answer but question already has answer - shouldn't happen with above logic
                  null
                ) : (
                  // User cannot answer this question
                  <View style={styles.noAnswerYet}>
                    <Text style={styles.noAnswerText}>Waiting for answer from task creator...</Text>
                  </View>
                );
              })()}
            </View>
          )}
        />
      )}

      {/* Fixed Ask Question Button */}
      <View style={styles.fixedButtonContainer}>
        <View style={styles.askQuestionButtonContainer}>
          <TouchableOpacity style={styles.askQuestionButton} onPress={onAskQuestion}>
            <Ionicons name="add-circle" size={24} color="#4CAF50" />
            <Text style={styles.askQuestionButtonText}>ASK QUESTION</Text>
          </TouchableOpacity>
        </View>
      </View>

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
    paddingBottom: 80, // Add space for the fixed button
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    marginTop: 16,
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
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  askQuestionButtonContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  taskContextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  taskContextText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
});
