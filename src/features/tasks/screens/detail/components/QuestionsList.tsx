import { useAuthStore } from '@/src/store/auth-task-store';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface QuestionsListProps {
  questions: any[];
  isLoading: boolean;
  onAskQuestion: () => void;
}

export const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  isLoading,
  onAskQuestion,
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
          renderItem={({ item: question }: { item: any }) => {
            // Debug log to see the actual question structure
            console.log('🔍 Question data structure:', JSON.stringify(question, null, 2));
            return (
            <View style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <View style={styles.questionUserSection}>
                  <View style={styles.questionAvatar}>
                    {(() => {
                      const avatarUri = getUserAvatar(question);
                      if (avatarUri && typeof avatarUri === 'string' && avatarUri.trim() && !failedImages.has(avatarUri)) {
                        return (
                          <Image
                            source={{ uri: avatarUri }}
                            style={styles.avatarImage}
                            onError={(error) => {
                              console.log('Failed to load avatar:', avatarUri, error);
                              setFailedImages(prev => new Set(prev).add(avatarUri));
                            }}
                          />
                        );
                      }
                      return <Ionicons name="person" size={20} color="#666" />;
                    })()}
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
              </View>

              <Text style={styles.questionText}>
                {typeof question.question === 'string'
                  ? question.question
                  : question.question?.text || 'No question text'}
              </Text>

              {question.answer && (
                <View style={styles.answerSection}>
                  <Text style={styles.answerLabel}>Answer from poster:</Text>
                  <Text style={styles.answerText}>
                    {typeof question.answer === 'string'
                      ? question.answer
                      : question.answer?.text || 'No answer text'}
                  </Text>
                </View>
              )}
            </View>
            );
          }}
        />
      )}

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
});
