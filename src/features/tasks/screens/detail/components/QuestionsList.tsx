import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuthStore } from '@/src/store/auth-task-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnswerQuestionModal } from './AnswerQuestionModal';

const screenWidth = Dimensions.get('window').width;

interface QuestionsListProps {
  questions: any[];
  isLoading: boolean;
  onAskQuestion: () => void;
  taskId?: string;
  currentUserId?: string;
  taskCreatorId?: string;
  onRefreshQuestions?: () => void;
  taskOffers?: any[];
  hideAskButton?: boolean; // Add task offers to check if user is a participant
}

export const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  isLoading,
  onAskQuestion,
  taskId,
  currentUserId,
  taskCreatorId,
  onRefreshQuestions,
  taskOffers = [],
  hideAskButton = false, // Default to empty array
}) => {
  const insets = useSafeAreaInsets();
  const currentUser = useAuthStore((state) => state.user);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  // Helper function to get user profile picture with fallback to generated avatar
  const getUserAvatar = (question: any) => {
    const user = question.askedBy || question.user || question.questioner;
    
    // If no user data in question, use current user's avatar
    if (!user && currentUser) {
      const avatar = currentUser.profilePicture || currentUser.avatar;
      if (avatar) return avatar;
      
      // Generate avatar for current user
      const name = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'You';
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4CAF50&color=fff&size=80`;
    }
    
    if (!user) {
      return 'https://ui-avatars.com/api/?name=User&background=999&color=fff&size=80';
    }
    
    // Check for real avatar first - Priority: Base64 avatar, profile picture URL, avatar URL
    const firstName = user.firstName || user.first_name || '';
    const lastName = user.lastName || user.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const displayName = fullName || user.name || user.username || user.email?.split('@')[0] || 'User';
    
    // Check for base64 avatar first
    if (user.avatar?.startsWith?.('data:')) {
      return user.avatar;
    }
    
    // Check for profile picture URL
    if (user.profilePicture || user.profile_picture) {
      return user.profilePicture || user.profile_picture;
    }
    
    // Check for regular avatar URL (but not ui-avatars generated ones)
    if (user.avatar && !user.avatar.includes('ui-avatars.com')) {
      return user.avatar;
    }
    
    // Check for image field
    if (user.image) {
      return user.image;
    }
    
    // Fallback to generated avatar with consistent styling
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0052A2&color=fff&size=80`;
  };
  
  // Helper function to extract and parse attachments from text
  const parseAttachments = (text: string) => {
    if (!text) return [];
    
    const attachments: { type: 'image' | 'file', name: string, url?: string }[] = [];
    const lines = text.split('\n');
    let inAttachmentsSection = false;
    
    for (const line of lines) {
      if (line.includes('Attached files:')) {
        inAttachmentsSection = true;
        continue;
      }
      
      if (inAttachmentsSection && line.trim()) {
        // Extract Cloudinary URL from the filename if present
        const cloudinaryMatch = line.match(/(https:\/\/res\.cloudinary\.com\/[^\s]+)/);
        const imageMatch = line.match(/🖼️\s*(.+\.(?:jpg|jpeg|png|gif|webp))/i);
        const fileMatch = line.match(/\s*(.+)/i);
        
        if (imageMatch) {
          const imageName = imageMatch[1].trim();
          attachments.push({ 
            type: 'image', 
            name: imageName,
            url: cloudinaryMatch ? cloudinaryMatch[1] : undefined
          });
        } else if (fileMatch && !line.includes('Attached files:')) {
          attachments.push({ 
            type: 'file', 
            name: fileMatch[1].trim(),
            url: cloudinaryMatch ? cloudinaryMatch[1] : undefined
          });
        }
      }
    }
    
    return attachments;
  };
  
  // Function to open image viewer
  const openImageViewer = (imageUrl: string) => {
    console.log('📸 Opening image viewer for:', imageUrl);
    setSelectedImageUrl(imageUrl);
    setImageModalVisible(true);
  };
  
  // Function to close image viewer
  const closeImageViewer = () => {
    setImageModalVisible(false);
    setSelectedImageUrl(null);
  };
  
  // Helper function to clean text by removing attachment section
  const cleanTextContent = (text: string) => {
    if (!text) return '';
    
    const attachmentIndex = text.indexOf('Attached files:');
    if (attachmentIndex !== -1) {
      return text.substring(0, attachmentIndex).trim();
    }
    
    return text.trim();
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
    // Allow both task creators and taskers to answer questions
    if (!currentUserId || !taskCreatorId) {
      console.log('❌ Missing user IDs - currentUserId:', currentUserId, 'taskCreatorId:', taskCreatorId);
      return false;
    }
    
    // Check if current user is the task creator (poster)
    const isTaskCreator = currentUserId === taskCreatorId;
    
    // Enhanced debugging for task offers
    console.log('🔍 Debugging taskOffers for user permission:', {
      currentUserId,
      taskOffersLength: taskOffers.length,
      taskOffers: taskOffers.map((offer: any) => ({
        offerId: offer._id,
        taskTakerId: offer.taskTakerId,
        userId: offer.userId,
        user: offer.user,
        userFromOffer: offer.user?._id,
        directUserId: offer.userId,
        taskTakerIdObj: offer.taskTakerId?._id,
        taskTakerName: offer.taskTakerId?.firstName + ' ' + offer.taskTakerId?.lastName
      }))
    });
    
    // Check if current user is a tasker (has made an offer on this task)
    // Try multiple possible user ID fields in offers
    const isTasker = taskOffers.some((offer: any) => {
      // Try all possible ways to identify the user in an offer
      const possibleUserIds = [
        offer.user?._id,
        offer.userId,
        offer.taskTakerId?._id,
        offer.taskTakerId,
        offer.createdBy?._id,
        offer.createdBy,
        offer.postedBy?._id,
        offer.postedBy
      ].filter(Boolean);
      
      const matches = possibleUserIds.includes(currentUserId);
      if (matches) {
        console.log('✅ Found matching offer for user:', {
          currentUserId,
          matchedField: possibleUserIds.find(id => id === currentUserId),
          offer: offer
        });
      }
      return matches;
    });
    
    // Check if user asked the question (they can answer their own questions too)
    const isQuestionAsker = currentUserId === (question.askedBy?._id || question.userId || question.user?._id);
    
    // For Q&A functionality, allow any authenticated user to answer questions
    // This ensures better collaboration and participation
    const isAuthenticatedUser = !!currentUserId;
    
    console.log('✅ Permission check for question', question._id, ':', {
      isTaskCreator,
      isTasker,
      isQuestionAsker,
      isAuthenticatedUser,
      currentUserId,
      taskCreatorId,
      offersCount: taskOffers.length,
      questionAskedBy: question.askedBy?._id || question.userId || question.user?._id,
      finalDecision: isTaskCreator || isTasker || isQuestionAsker || isAuthenticatedUser
    });
    
    // Allow task creator, taskers who made offers, question askers, or any authenticated user to answer
    // This ensures the Q&A system is open and collaborative
    return isTaskCreator || isTasker || isQuestionAsker || isAuthenticatedUser;
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
          contentContainerStyle={{ paddingBottom: 16 }}
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
                  <Image 
                    source={{ uri: getUserAvatar(question) }}
                    style={styles.questionAvatar}
                  />
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
                {(() => {
                  const questionText = typeof question.question === 'string'
                    ? question.question
                    : question.question?.text || 'No question text';
                  return cleanTextContent(questionText);
                })()}
              </Text>
              
              {/* Display question attachments if any */}
              {(() => {
                const questionText = typeof question.question === 'string'
                  ? question.question
                  : question.question?.text || '';
                const attachments = parseAttachments(questionText);
                
                if (attachments.length > 0) {
                  return (
                    <View style={styles.attachmentsContainer}>
                      <Text style={styles.attachmentsLabel}>📎 Attachments:</Text>
                      {attachments.map((attachment, index) => (
                        <TouchableOpacity 
                          key={index} 
                          style={styles.attachmentItem}
                          onPress={() => {
                            if (attachment.type === 'image' && attachment.url) {
                              openImageViewer(attachment.url);
                            } else {
                              console.log('📎 File attachment clicked:', attachment.name);
                            }
                          }}
                          activeOpacity={attachment.type === 'image' && attachment.url ? 0.7 : 1}
                        >
                          <Ionicons 
                            name={attachment.type === 'image' ? 'image-outline' : 'document-outline'} 
                            size={16} 
                            color="#007AFF" 
                          />
                          <Text style={styles.attachmentName}>{attachment.name}</Text>
                          {attachment.type === 'image' && attachment.url && (
                            <Ionicons name="eye-outline" size={14} color="#007AFF" style={{ marginLeft: 8 }} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  );
                }
                return null;
              })()}

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
                    {(() => {
                      const answerText = typeof question.answer === 'string'
                        ? question.answer
                        : question.answer?.text || 'No answer text';
                      return cleanTextContent(answerText);
                    })()}
                  </Text>
                  
                  {/* Display answer attachments if any */}
                  {(() => {
                    const answerText = typeof question.answer === 'string'
                      ? question.answer
                      : question.answer?.text || '';
                    const attachments = parseAttachments(answerText);
                    
                    if (attachments.length > 0) {
                      return (
                        <View style={styles.answerAttachmentsContainer}>
                          {attachments.map((attachment, index) => (
                            <TouchableOpacity
                              key={index} 
                              style={styles.answerAttachmentItem}
                              onPress={() => {
                                if (attachment.type === 'image' && attachment.url) {
                                  openImageViewer(attachment.url);
                                } else {
                                  console.log('📎 File attachment clicked:', attachment.name);
                                }
                              }}
                              activeOpacity={attachment.type === 'image' && attachment.url ? 0.7 : 1}
                            >
                              <Ionicons 
                                name={attachment.type === 'image' ? 'image' : 'document'} 
                                size={14} 
                                color="#4CAF50" 
                              />
                              <Text style={styles.answerAttachmentName}>{attachment.name}</Text>
                              {attachment.type === 'image' && attachment.url && (
                                <Ionicons name="eye" size={12} color="#4CAF50" style={{ marginLeft: 4 }} />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      );
                    }
                    return null;
                  })()}
                  
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
                        <Text style={styles.noAnswerText}>Waiting for an answer...</Text>
                      </View>
                    );
                  }
                })()
              )}
            </View>
          )}
        />
      )}

      {/* Ask Question Button - Hidden when viewing assigned/completed tasks */}
      {!hideAskButton && (
        <View style={[styles.askQuestionButtonContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity 
            style={styles.askQuestionButton}
            onPress={onAskQuestion}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.askQuestionButtonText}>ASK QUESTION</Text>
          </TouchableOpacity>
        </View>
      )}

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
      
      {/* Image Viewer Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageViewer}
      >
        <View style={styles.imageModalContainer}>
          <TouchableOpacity 
            style={styles.imageModalBackdrop}
            activeOpacity={1}
            onPress={closeImageViewer}
          >
            <View style={styles.imageModalContent}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeImageViewer}
              >
                <Ionicons name="close" size={30} color="#fff" />
              </TouchableOpacity>
              
              {selectedImageUrl && (
                <ScrollView
                  maximumZoomScale={3}
                  minimumZoomScale={1}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.imageScrollContent}
                >
                  <Image 
                    source={{ uri: selectedImageUrl }} 
                    style={styles.fullImage}
                    resizeMode="contain"
                    onError={(error) => {
                      console.error('❌ Failed to load image in viewer:', error);
                    }}
                  />
                </ScrollView>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
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
    marginBottom: 20,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
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
  askQuestionButtonContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginBottom: 30,
  },
  askQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  askQuestionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
  attachmentsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  attachmentsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingVertical: 4,
  },
  attachmentName: {
    fontSize: 13,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  answerAttachmentsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  answerAttachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingVertical: 2,
  },
  answerAttachmentName: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 6,
    flex: 1,
    fontStyle: 'italic',
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalBackdrop: {
    flex: 1,
    width: '100%',
  },
  imageModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  fullImage: {
    width: screenWidth,
    height: screenWidth * 1.5,
    maxHeight: '90%',
  },
});

export default QuestionsList;
