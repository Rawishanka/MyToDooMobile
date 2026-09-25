import { AppAlert } from '@/src/shared/components/AppAlert';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useRef, useEffect } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';

interface RatingReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    rating: number;
    reviewText: string;
    attachments: any[];
  }) => Promise<void>;
  taskTitle: string;
  userRole: 'tasker' | 'poster';
}

export const RatingReviewModal: React.FC<RatingReviewModalProps> = ({
  visible,
  onClose,
  onSubmit,
  taskTitle,
  userRole,
}) => {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log('🔵 RatingReviewModal visible:', visible);
    console.log('🔵 Task title:', taskTitle);
    console.log('🔵 User role:', userRole);
  }, [visible, taskTitle, userRole]);

  const resetForm = () => {
    setRating(0);
    setReviewText('');
    setAttachments([]);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      AppAlert.alert('Rating Required', 'Please select a rating before submitting');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        rating,
        reviewText: reviewText.trim(),
        attachments,
      });
      
      // Success - close modal and reset
      resetForm();
      onClose();
      
      // Show success message after modal closes
      setTimeout(() => {
        AppAlert.alert(
          'Success',
          'Your review has been submitted successfully!'
        );
      }, 300);
    } catch (error: any) {
      console.error('❌ Submit review error:', error);
      setIsSubmitting(false);
      
      let errorMessage = 'Failed to submit review. Please try again.';
      
      // Check for specific error messages
      if (error?.message?.includes('reviewerId') || error?.message?.includes('revieweeId')) {
        errorMessage = 'Task information is not ready yet. Please wait a moment and try again, or close this modal and submit your review from the Completed tab.';
      } else if (error?.message?.includes('already reviewed')) {
        errorMessage = 'You have already submitted a review for this task.';
      } else if (error?.message?.includes('not completed')) {
        errorMessage = 'This task must be fully completed before you can submit a review.';
      } else if (error?.message?.includes('reviewText') || error?.message?.includes("Path `reviewText`")) {
        errorMessage = 'Please write a review before submitting.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      AppAlert.alert('Review Submission Failed', errorMessage);
    }
  };

  const handleSkip = () => {
    AppAlert.alert(
      'Skip Review',
      'Are you sure you want to skip adding a review? The task will be marked as completed.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Skip & Complete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSubmitting(true);
              // Submit with no rating (0) to indicate skip
              await onSubmit({
                rating: 0,
                reviewText: '',
                attachments: [],
              });
              
              // Success - close modal and reset
              resetForm();
              onClose();
              
              // Show success message after modal closes
              setTimeout(() => {
                AppAlert.alert(
                  'Task Completed',
                  'The task has been marked as completed successfully!'
                );
              }, 300);
            } catch (error: any) {
              console.error('❌ Failed to complete task:', error);
              setIsSubmitting(false);
              AppAlert.alert(
                'Error',
                error?.message || 'Failed to complete task. Please try again.'
              );
            }
          }
        }
      ]
    );
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        AppAlert.alert(
          'Permission Required',
          'Please grant permission to access your photo library'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets) {
        const newAttachments = result.assets.map((asset, index) => ({
          uri: asset.uri,
          name: `image_${Date.now()}_${index}.jpg`,
          type: 'image/jpeg',
          isImage: true,
        }));

        if (attachments.length + newAttachments.length > 5) {
          AppAlert.alert('Limit Reached', 'You can upload a maximum of 5 files');
          return;
        }

        setAttachments([...attachments, ...newAttachments]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      AppAlert.alert('Error', 'Failed to pick image');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const newAttachments = result.assets.map((file: any) => ({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/pdf',
          isImage: false,
        }));

        if (attachments.length + newAttachments.length > 5) {
          AppAlert.alert('Limit Reached', 'You can upload a maximum of 5 files');
          return;
        }

        setAttachments([...attachments, ...newAttachments]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      AppAlert.alert('Error', 'Failed to pick document');
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 16) }, isDarkMode && { backgroundColor: '#1E293B' }]}>
            {/* Premium Header */}
            <View style={[styles.header, isDarkMode && { backgroundColor: "#0F172A", borderBottomWidth: 1, borderBottomColor: "#334155" }]}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIconBadge}>
                  <Ionicons name="star" size={18} color="#ff6b35" />
                </View>
                <Text style={styles.headerTitle}>Rate &amp; Review</Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                disabled={isSubmitting}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              ref={scrollRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              {/* Task Info */}
              <View style={[styles.taskInfo, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                <Text style={[styles.taskLabel, isDarkMode && { color: "#94A3B8" }]}>
                  {userRole === 'tasker' ? 'Task Completed' : 'Rate Tasker'}
                </Text>
                <Text style={[styles.taskTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={2}>{taskTitle}</Text>
              </View>

              {/* Star Rating */}
              <View style={[styles.ratingSection, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#334155" }]}>
                <Text style={[styles.sectionLabel, isDarkMode && { color: '#F8FAFC' }]}>Your Rating *</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                      style={styles.starButton}
                      disabled={isSubmitting}
                    >
                      <Ionicons
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={40}
                        color={star <= rating ? '#ff6b35' : (isDarkMode ? '#475569' : '#D1D5DB')}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={[styles.ratingText, isDarkMode && { color: '#38BDF8' }]}>
                  {rating === 0 ? 'Tap to rate' : 
                   rating === 1 ? 'Poor' :
                   rating === 2 ? 'Fair' :
                   rating === 3 ? 'Good' :
                   rating === 4 ? 'Very Good' :
                   'Excellent'}
                </Text>
              </View>

              {/* Review Text */}
              <View style={styles.reviewSection}>
                <Text style={[styles.sectionLabel, isDarkMode && { color: '#F8FAFC' }]}>Your Review (Optional)</Text>
                <TextInput
                  style={[styles.reviewInput, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }]}
                  multiline
                  numberOfLines={6}
                  placeholder="Share your experience..."
                  placeholderTextColor={isDarkMode ? '#64748B' : '#999'}
                  value={reviewText}
                  onChangeText={setReviewText}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollRef.current?.scrollToEnd({ animated: true });
                    }, 250);
                  }}
                  textAlignVertical="top"
                  editable={!isSubmitting}
                />
              </View>

              {/* Attachments */}
              <View style={styles.attachmentsSection}>
                <Text style={[styles.sectionLabel, isDarkMode && { color: '#F8FAFC' }]}>Attachments (Optional)</Text>
                <Text style={[styles.attachmentHint, isDarkMode && { color: "#94A3B8" }]}>
                  Max 5 files, 10MB each. Images or documents (PDF, DOC, DOCX)
                </Text>

                {/* Attachment Buttons */}
                <View style={styles.attachmentButtons}>
                  <TouchableOpacity
                    style={[styles.attachmentButton, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#334155" }]}
                    onPress={pickImage}
                    disabled={isSubmitting || attachments.length >= 5}
                  >
                    <Ionicons name="image-outline" size={24} color={isDarkMode ? "#38BDF8" : "#007AFF"} />
                    <Text style={[styles.attachmentButtonText, isDarkMode && { color: '#F8FAFC' }]}>Add Photos</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.attachmentButton, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#334155" }]}
                    onPress={pickDocument}
                    disabled={isSubmitting || attachments.length >= 5}
                  >
                    <Ionicons name="document-outline" size={24} color={isDarkMode ? "#38BDF8" : "#007AFF"} />
                    <Text style={[styles.attachmentButtonText, isDarkMode && { color: '#F8FAFC' }]}>Add Documents</Text>
                  </TouchableOpacity>
                </View>

                {/* Attachment Preview */}
                {attachments.length > 0 && (
                  <View style={styles.attachmentsList}>
                    {attachments.map((attachment, index) => (
                      <View key={index} style={styles.attachmentItem}>
                        {attachment.isImage ? (
                          <Image 
                            source={{ uri: attachment.uri }} 
                            style={styles.attachmentImage}
                          />
                        ) : (
                          <View style={styles.attachmentDoc}>
                            <Ionicons name="document" size={40} color="#007AFF" />
                          </View>
                        )}
                        <Text style={styles.attachmentName} numberOfLines={1}>
                          {attachment.name}
                        </Text>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeAttachment(index)}
                          disabled={isSubmitting}
                        >
                          <Ionicons name="close-circle" size={24} color="#FF3B30" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Submit Button — fixed footer above keyboard */}
            <View style={[styles.footer, isDarkMode && { backgroundColor: "#1E293B", borderTopColor: "#334155" }]}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isDarkMode && { backgroundColor: "#2563EB", shadowColor: "#2563EB" },
                  (rating === 0 || isSubmitting) && [styles.submitButtonDisabled, isDarkMode && { backgroundColor: "#334155" }]
                ]}
                onPress={handleSubmit}
                disabled={rating === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Review</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ── Backdrop + Container ───────────────────────────────────────────
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 60, 0.65)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: '#FAFBFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },

  // ── Header ───────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#003399',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 122, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Scroll ───────────────────────────────────────────────────
  scrollView: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: 12,
  },

  // ── Task Info Banner ─────────────────────────────────────────
  taskInfo: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#EEF2FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
  },
  taskLabel: {
    fontSize: RFValue(10),
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1,
  },
  taskTitle: {
    fontSize: RFValue(15),
    fontWeight: '700',
    color: '#1A1D2E',
    lineHeight: RFValue(21),
  },

  // ── Star Rating ────────────────────────────────────────────
  ratingSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    shadowColor: '#003399',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: RFValue(13),
    fontWeight: '700',
    color: '#374151',
    marginBottom: 14,
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  starButton: {
    padding: 6,
  },
  ratingText: {
    fontSize: RFValue(15),
    color: '#003399',
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Review Input ───────────────────────────────────────────
  reviewSection: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  reviewInput: {
    borderWidth: 1.5,
    borderColor: '#E0E7FF',
    borderRadius: 16,
    padding: 14,
    fontSize: RFValue(14),
    color: '#1A1D2E',
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    lineHeight: RFValue(21),
  },

  // ── Attachments ───────────────────────────────────────────
  attachmentsSection: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  attachmentHint: {
    fontSize: RFValue(11),
    color: '#9CA3AF',
    marginBottom: 14,
    lineHeight: RFValue(16),
  },
  attachmentButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  attachmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    gap: 8,
  },
  attachmentButtonText: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#003399',
  },
  attachmentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  attachmentItem: {
    width: 90,
    alignItems: 'center',
    position: 'relative',
  },
  attachmentImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  attachmentDoc: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
  },
  attachmentName: {
    fontSize: RFValue(10),
    color: '#6B7280',
    marginTop: 5,
    textAlign: 'center',
    width: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },

  // ── Footer Submit ──────────────────────────────────────────
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E8ECF4',
    backgroundColor: '#FAFBFF',
  },
  submitButton: {
    backgroundColor: '#003399',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#003399',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: RFValue(15),
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: '#E0E7FF',
  },
  skipButtonText: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#6B7280',
  },
});
