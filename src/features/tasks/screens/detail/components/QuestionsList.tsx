import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTheme } from '@/src/shared/theme/ThemeContext';
import { ActivityIndicator, Dimensions, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatUserName } from '@/src/utils/formatUserName';

import { normalizeCDNUrl } from '@/src/api/cdn-api';
import { isTablet, RFValue, wp } from '@/src/shared/utils/responsive';
import { useAuthStore } from '@/src/store/auth-task-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnswerQuestionModal } from './AnswerQuestionModal';

const screenWidth = Dimensions.get('window').width;

const isImageAttachment = (value: string) =>
  /\.(jpg|jpeg|png|gif|webp|bmp|heic)(\?|$)/i.test(value) ||
  value.includes('/images/') ||
  value.includes('image/upload');

const normalizeQuestionAttachmentList = (items: any[] | undefined): any[] => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return [];
  }

  return items
    .map((item, index) => {
      if (typeof item === 'string') {
        const url = normalizeCDNUrl(item);
        return {
          _id: `attachment-${index}`,
          url,
          secureUrl: url,
          resourceType: isImageAttachment(url) ? 'image' : 'document',
          fileId: url.split('/').pop() || `attachment-${index}`,
        };
      }

      const url = normalizeCDNUrl(item.url || item.secureUrl || item.path || item.src);
      if (!url) {
        return null;
      }

      return {
        ...item,
        url,
        secureUrl: normalizeCDNUrl(item.secureUrl || item.url || item.path || item.src),
        resourceType:
          item.resourceType ||
          item.type ||
          (isImageAttachment(url) ? 'image' : 'document'),
        fileId: item.fileId || item.name || url.split('/').pop() || `attachment-${index}`,
      };
    })
    .filter(Boolean);
};

const collectAttachmentCandidates = (question: any, field: 'question' | 'answer'): any[] => {
  const nested = question[field];
  const candidates: any[] = [];

  if (Array.isArray(nested?.attachments)) {
    candidates.push(...nested.attachments);
  }
  if (Array.isArray(nested?.images)) {
    candidates.push(...nested.images);
  }
  if (Array.isArray(nested?.image_urls)) {
    candidates.push(...nested.image_urls);
  }
  if (Array.isArray(nested?.imageUrls)) {
    candidates.push(...nested.imageUrls);
  }

  if (field === 'question') {
    if (Array.isArray(question.questionAttachments)) {
      candidates.push(...question.questionAttachments);
    }
    if (Array.isArray(question.questionImages)) {
      candidates.push(...question.questionImages);
    }
    if (Array.isArray(question.question_image_urls)) {
      candidates.push(...question.question_image_urls);
    }
  } else {
    if (Array.isArray(question.answerAttachments)) {
      candidates.push(...question.answerAttachments);
    }
    if (Array.isArray(question.answerImages)) {
      candidates.push(...question.answerImages);
    }
    if (Array.isArray(question.answer_image_urls)) {
      candidates.push(...question.answer_image_urls);
    }
    if (Array.isArray(question.answerImageUrls)) {
      candidates.push(...question.answerImageUrls);
    }
    if (Array.isArray(question.image_urls) && typeof nested === 'object' && nested !== null) {
      candidates.push(...question.image_urls);
    }
  }

  return normalizeQuestionAttachmentList(candidates);
};

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
  const { isDarkMode } = useTheme();
  const currentUser = useAuthStore((state) => state.user);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  // Helper function to get user profile picture with fallback to generated avatar
  const getUserAvatar = (question: any) => {
    const user = question.askedBy || question.user || question.questioner || question.userId;
    
    if (!user) {
      return 'https://ui-avatars.com/api/?name=User&background=999&color=fff&size=80';
    }
    
    // Check for real avatar first - Priority: Base64 avatar, profile picture URL, avatar URL
    const firstName = user.firstName || user.first_name || '';
    const lastName = user.lastName || user.last_name || '';
    const fullName = formatUserName(firstName, lastName);
    const displayName = fullName !== 'Unknown User' ? fullName : (user.name || user.username || user.email?.split('@')[0] || 'User');
    
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
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1A2980&color=fff&size=80`;
  };
  
  // Helper function to get question attachments from API response
  const getQuestionAttachments = (question: any) => collectAttachmentCandidates(question, 'question');
  
  // Helper function to get answer attachments from API response
  const getAnswerAttachments = (question: any) => collectAttachmentCandidates(question, 'answer');
  
  // Helper function to get question text
  const getQuestionText = (question: any) => {
    if (typeof question.question === 'string') {
      return question.question;
    }
    if (question.question?.text) {
      return question.question.text;
    }
    return 'No question text';
  };
  
  // Helper function to get answer text
  const getAnswerText = (question: any) => {
    if (typeof question.answer === 'string') {
      return question.answer;
    }
    if (question.answer?.text) {
      return question.answer.text;
    }
    return '';
  };
  
  // Function to open image viewer
  const openImageViewer = (imageUrl: string) => {
    const normalizedUrl = normalizeCDNUrl(imageUrl);
    console.log('📸 Opening image viewer for:', { original: imageUrl, normalized: normalizedUrl });
    setSelectedImageUrl(normalizedUrl);
    setImageModalVisible(true);
  };
  
  // Function to close image viewer
  const closeImageViewer = () => {
    setImageModalVisible(false);
    setSelectedImageUrl(null);
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
    
    // Debug: Log question asker details for first question
    if (questions.length > 0) {
      const firstQ = questions[0];
      console.log('🔍 First Question Debug:', {
        questionId: firstQ._id,
        askedBy: firstQ.askedBy,
        user: firstQ.user,
        questioner: firstQ.questioner,
        userId: firstQ.userId,
        hasAskedByData: !!firstQ.askedBy,
        askedByName: firstQ.askedBy ? formatUserName(firstQ.askedBy.firstName, firstQ.askedBy.lastName) : 'N/A'
      });
    }
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
    if (!currentUserId || !taskCreatorId) {
      console.log('❌ Missing user IDs - currentUserId:', currentUserId, 'taskCreatorId:', taskCreatorId);
      return false;
    }
    
    // Get the ID of who asked this question - try multiple possible field paths
    const questionAskerId = 
      question.askedBy?._id || 
      question.userId?._id || 
      question.userId || 
      question.user?._id || 
      question.user || 
      question.questioner?._id || 
      question.questioner ||
      question.createdBy?._id ||
      question.createdBy;
    
    console.log('🔍 DEBUG: Extracting question asker ID:', {
      questionId: question._id,
      questionAskerId,
      currentUserId,
      possibleFields: {
        'askedBy._id': question.askedBy?._id,
        'userId._id': question.userId?._id,
        'userId': question.userId,
        'user._id': question.user?._id,
        'user': question.user,
        'questioner._id': question.questioner?._id,
        'questioner': question.questioner,
        'createdBy._id': question.createdBy?._id,
        'createdBy': question.createdBy,
      }
    });
    
    if (!questionAskerId) {
      console.log('❌ Cannot determine who asked the question - denying answer permission');
      return false;
    }
    
    // ⚠️ CRITICAL: Users can NEVER answer their own questions
    const isQuestionAsker = currentUserId === questionAskerId;
    if (isQuestionAsker) {
      console.log('❌ BLOCKED: User cannot answer their own question:', {
        currentUserId,
        questionAskerId,
        questionId: question._id,
        match: true
      });
      return false;
    }
    
    console.log('✅ User is NOT the question asker - checking other permissions:', {
      currentUserId,
      questionAskerId,
      areEqual: currentUserId === questionAskerId
    });
    
    // Check if current user is the task creator (poster)
    const isTaskCreator = currentUserId === taskCreatorId;
    
    // Check if the question was asked by the poster
    const wasAskedByPoster = questionAskerId === taskCreatorId;
    
    // Check if current user is a tasker (has made an offer on this task)
    // NOTE: We check offers array exists and has length to avoid issues when no offers yet
    const isTasker = taskOffers && taskOffers.length > 0 ? taskOffers.some((offer: any) => {
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
    }) : false;
    
    console.log('🔍 Permission check for question', question._id, ':', {
      questionAskerId,
      wasAskedByPoster,
      isTaskCreator,
      isTasker,
      currentUserId,
      taskCreatorId,
      hasOffers: taskOffers && taskOffers.length > 0
    });
    
    // RULE 1: If poster asked the question → Anyone except the poster can answer
    // (Taskers with offers can answer, and poster cannot answer their own question)
    if (wasAskedByPoster) {
      // If user is a tasker with an offer, they can answer
      // If user is NOT the poster, they can answer (any other user viewing the task)
      const canAnswer = isTasker || !isTaskCreator;
      console.log('📋 Poster asked question - others can answer:', canAnswer, {
        isTasker,
        isTaskCreator,
        reasoning: isTasker ? 'User is a tasker with offer' : !isTaskCreator ? 'User is not the poster' : 'User is poster (blocked)'
      });
      return canAnswer;
    }
    
    // RULE 2: If tasker asked the question → Only poster can answer
    const canAnswer = isTaskCreator;
    console.log('👤 Tasker asked question - only poster can answer:', canAnswer);
    return canAnswer;
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
          <Text style={[styles.questionsCountText, isDarkMode && { color: "#94A3B8" }]}>
            Questions about this task ({questions.length})
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={[styles.loadingStateText, isDarkMode && { color: "#94A3B8" }]}>Loading questions...</Text>
        </View>
      ) : questions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="help-circle-outline" size={48} color={isDarkMode ? "#475569" : "#ccc"} />
          <Text style={[styles.emptyStateText, isDarkMode && { color: "#F8FAFC" }]}>No questions yet</Text>
          <Text style={[styles.emptyStateSubtext, isDarkMode && { color: "#94A3B8" }]}>Be the first to ask a question!</Text>
        </View>
      ) : (
        <FlatList
          data={questions}
          scrollEnabled={false}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={{ paddingBottom: 16 }}
          renderItem={({ item: question }: { item: any }) => (
            <View style={[styles.questionCard, isDarkMode && { backgroundColor: "#1E293B", borderColor: "#334155" }]}>
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
                    <Text style={[styles.questionUserName, isDarkMode && { color: "#F8FAFC" }]}>
                      {question.isAnonymous
                        ? 'Anonymous User'
                        : (() => {
                            // Handle different possible user data structures
                            const user = question.askedBy || question.user || question.questioner || question.userId;
                            
                            if (!user) return 'Unknown User';
                            
                            const firstName = user.firstName || user.first_name || '';
                            const lastName = user.lastName || user.last_name || '';
                            const fullName = formatUserName(firstName, lastName);
                            
                            // If we have a full name, use it
                            if (fullName !== 'Unknown User') return fullName;
                            
                            // Fallback to email or username if available
                            if (user.email) return user.email.split('@')[0];
                            if (user.username) return user.username;
                            if (user.name) return user.name;
                            
                            return 'Unknown User';
                          })()}
                    </Text>
                    <Text style={[styles.questionTime, isDarkMode && { color: "#64748B" }]}>
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
                  hasValidAnswer(question) 
                    ? (isDarkMode ? { backgroundColor: 'rgba(76, 175, 80, 0.2)' } : styles.statusAnswered) 
                    : (isDarkMode ? { backgroundColor: 'rgba(255, 152, 0, 0.2)' } : styles.statusPending)
                ]}>
                  <Text style={[
                    styles.statusText,
                    hasValidAnswer(question) ? styles.statusAnsweredText : styles.statusPendingText
                  ]}>
                    {hasValidAnswer(question) ? 'Answered' : 'Pending'}
                  </Text>
                </View>
              </View>

              <Text style={[styles.questionText, isDarkMode && { color: "#E2E8F0" }]}>
                {getQuestionText(question)}
              </Text>
              
              {/* Display question attachments from API response */}
              {(() => {
                const attachments = getQuestionAttachments(question);
                
                if (attachments.length > 0) {
                  return (
                    <View style={[styles.attachmentsContainer, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#1E3A8A", borderLeftColor: "#38BDF8" }]}>
                      <Text style={[styles.attachmentsLabel, isDarkMode && { color: "#38BDF8" }]}>📎 Attachments ({attachments.length}):</Text>
                      {attachments.map((attachment: any, index: number) => (
                        <TouchableOpacity 
                          key={attachment._id || index} 
                          style={[styles.attachmentItem, isDarkMode && { backgroundColor: "#1E293B", borderColor: "#334155" }]}
                          onPress={() => {
                            if (attachment.resourceType === 'image' && (attachment.url || attachment.secureUrl)) {
                              openImageViewer(attachment.secureUrl || attachment.url);
                            } else {
                              console.log('📎 File attachment clicked:', attachment.fileId);
                            }
                          }}
                          activeOpacity={attachment.resourceType === 'image' ? 0.7 : 1}
                        >
                          <Ionicons 
                            name={attachment.resourceType === 'image' ? 'image-outline' : 'document-outline'} 
                            size={22} 
                            color="#007AFF" 
                          />
                          
                          {/* Image Preview Thumbnail */}
                          {attachment.resourceType === 'image' && (attachment.url || attachment.secureUrl) && (
                            <Image 
                              source={{ uri: normalizeCDNUrl(attachment.secureUrl || attachment.url) }}
                              style={styles.attachmentThumbnail}
                              resizeMode="cover"
                            />
                          )}
                          
                          <Text style={[styles.attachmentName, isDarkMode && { color: "#F8FAFC" }]} numberOfLines={1}>
                            {attachment.fileId?.split('/').pop() || 'Attachment'}
                          </Text>
                          {attachment.resourceType === 'image' && (
                            <Ionicons name="eye-outline" size={20} color="#007AFF" style={{ marginLeft: 'auto' }} />
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
                <View style={[styles.answerSection, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#166534", borderLeftColor: "#22C55E" }]}>
                  <Text style={[styles.answerLabel, isDarkMode && { color: "#4ADE80" }]}>
                    Answer from {(() => {
                      const answerer = question.answeredBy || question.posterId;
                      if (!answerer) return 'poster';
                      
                      const firstName = answerer.firstName || answerer.first_name || '';
                      const lastName = answerer.lastName || answerer.last_name || '';
                      const fullName = formatUserName(firstName, lastName);
                      
                      return fullName !== 'Unknown User' ? fullName : (answerer.email?.split('@')[0] || answerer.username || 'poster');
                    })()}:
                  </Text>
                  <Text style={[styles.answerText, isDarkMode && { color: "#E2E8F0" }]}>
                    {getAnswerText(question)}
                  </Text>
                  
                  {/* Display answer attachments from API response */}
                  {(() => {
                    const attachments = getAnswerAttachments(question);
                    
                    if (attachments.length > 0) {
                      return (
                        <View style={[styles.answerAttachmentsContainer, isDarkMode && { borderTopColor: "#166534" }]}>
                          <Text style={[styles.attachmentsLabel, { color: '#2E7D32' }]}>📎 Attachments ({attachments.length}):</Text>
                          {attachments.map((attachment: any, index: number) => (
                            <TouchableOpacity
                              key={attachment._id || index} 
                              style={[styles.answerAttachmentItem, isDarkMode && { backgroundColor: "#1E293B", borderColor: "#334155" }]}
                              onPress={() => {
                                if (attachment.resourceType === 'image' && (attachment.url || attachment.secureUrl)) {
                                  openImageViewer(attachment.secureUrl || attachment.url);
                                } else {
                                  console.log('📎 File attachment clicked:', attachment.fileId);
                                }
                              }}
                              activeOpacity={attachment.resourceType === 'image' ? 0.7 : 1}
                            >
                              <Ionicons 
                                name={attachment.resourceType === 'image' ? 'image' : 'document'} 
                                size={20} 
                                color="#4CAF50" 
                              />
                              
                              {/* Image Preview Thumbnail */}
                              {attachment.resourceType === 'image' && (attachment.url || attachment.secureUrl) && (
                                <Image 
                                  source={{ uri: normalizeCDNUrl(attachment.secureUrl || attachment.url) }}
                                  style={styles.answerAttachmentThumbnail}
                                  resizeMode="cover"
                                />
                              )}
                              
                              <Text style={[styles.answerAttachmentName, isDarkMode && { color: "#4ADE80" }]} numberOfLines={1}>
                                {attachment.fileId?.split('/').pop() || 'Attachment'}
                              </Text>
                              {attachment.resourceType === 'image' && (
                                <Ionicons name="eye" size={18} color="#4CAF50" style={{ marginLeft: 'auto' }} />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      );
                    }
                    return null;
                  })()}
                  
                  {question.answeredAt && (
                    <Text style={[styles.answerTime, isDarkMode && { color: "#86EFAC" }]}>
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
                        <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
                        <Text style={styles.answerButtonText}>Answer this question</Text>
                      </TouchableOpacity>
                    );
                  } else {
                    return (
                      <View style={[styles.noAnswerYet, isDarkMode && { backgroundColor: "rgba(255, 152, 0, 0.1)", borderColor: "rgba(255, 152, 0, 0.3)" }]}>
                        <Text style={[styles.noAnswerText, isDarkMode && { color: "#FDBA74" }]}>Waiting for an answer...</Text>
                      </View>
                    );
                  }
                })()
              )}
            </View>
          )}
        />
      )}

      {/* Ask Question Button - Hidden when viewing assigned/completed tasks OR when user is the task creator */}
      {/* Task creator should NOT be able to post questions on their own task - only answer them */}
      {!hideAskButton && currentUserId !== taskCreatorId && (
        <View style={[styles.askQuestionButtonContainer, isDarkMode && { backgroundColor: "#0B1120", borderTopColor: "#334155" }, { paddingBottom: Math.max(insets.bottom, 16) }]}>
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
            // React Query will auto-refresh questions via cache invalidation
            console.log('🔄 Questions will refresh automatically via React Query cache invalidation');
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
    fontSize: RFValue(14),
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
    fontSize: RFValue(14),
    color: '#666',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: RFValue(14),
    color: '#999',
    marginTop: 4,
  },
  questionCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questionUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  questionAvatar: {
    width: isTablet ? 50 : 40,
    height: isTablet ? 50 : 40,
    borderRadius: isTablet ? 25 : 20,
    marginRight: wp('3%'),
    backgroundColor: '#f0f0f0',
  },
  questionUserInfo: {
    flex: 1,
  },
  questionUserName: {
    fontSize: RFValue(isTablet ? 12 : 12),
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  questionTime: {
    fontSize: RFValue(12),
    color: '#999',
  },
  questionText: {
    fontSize: RFValue(15),
    color: '#1a1a1a',
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '400',
  },
  answerSection: {
    backgroundColor: '#F0F9F4',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#D4EDDA',
  },
  answerLabel: {
    fontSize: RFValue(13),
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  answerText: {
    fontSize: RFValue(15),
    color: '#1a1a1a',
    lineHeight: 22,
    fontWeight: '400',
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
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  statusAnswered: {
    backgroundColor: '#E8F5E8',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: RFValue(11),
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statusAnsweredText: {
    color: '#4CAF50',
  },
  statusPendingText: {
    color: '#FF9800',
  },
  answerTime: {
    fontSize: RFValue(12),
    color: '#2E7D32',
    marginTop: 8,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  answerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  answerButtonText: {
    fontSize: RFValue(15),
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  noAnswerYet: {
    backgroundColor: '#FFF9E6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    alignItems: 'center',
  },
  noAnswerText: {
    fontSize: RFValue(14),
    color: '#E65100',
    fontStyle: 'italic',
    textAlign: 'center',
    fontWeight: '500',
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
    fontSize: RFValue(12),
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  attachmentsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    borderWidth: 1,
    borderColor: '#CCE5FF',
  },
  attachmentsLabel: {
    fontSize: RFValue(13),
    fontWeight: '700',
    color: '#0056B3',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },
  attachmentThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginLeft: 10,
    marginRight: 6,
    backgroundColor: '#f0f0f0',
  },
  attachmentName: {
    fontSize: RFValue(14),
    color: '#1a1a1a',
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  answerAttachmentsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#C8E6C9',
  },
  answerAttachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  answerAttachmentThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginLeft: 10,
    marginRight: 6,
    backgroundColor: '#f0f0f0',
  },
  answerAttachmentName: {
    fontSize: RFValue(14),
    color: '#2E7D32',
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
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