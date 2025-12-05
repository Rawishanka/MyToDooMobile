import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
      Alert.alert('Rating Required', 'Please select a rating before submitting');
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
        Alert.alert(
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
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Review Submission Failed', errorMessage);
    }
  };

  const handleSkip = () => {
    Alert.alert(
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
                Alert.alert(
                  'Task Completed',
                  'The task has been marked as completed successfully!'
                );
              }, 300);
            } catch (error: any) {
              console.error('❌ Failed to complete task:', error);
              setIsSubmitting(false);
              Alert.alert(
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
        Alert.alert(
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
          Alert.alert('Limit Reached', 'You can upload a maximum of 5 files');
          return;
        }

        setAttachments([...attachments, ...newAttachments]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
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
          Alert.alert('Limit Reached', 'You can upload a maximum of 5 files');
          return;
        }

        setAttachments([...attachments, ...newAttachments]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
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
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Rate & Review</Text>
            <TouchableOpacity 
              onPress={handleClose}
              disabled={isSubmitting}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Task Info */}
            <View style={styles.taskInfo}>
              <Text style={styles.taskLabel}>
                {userRole === 'tasker' ? 'Task Completed' : 'Rate Tasker'}
              </Text>
              <Text style={styles.taskTitle} numberOfLines={2}>{taskTitle}</Text>
            </View>

            {/* Star Rating */}
            <View style={styles.ratingSection}>
              <Text style={styles.sectionLabel}>Your Rating *</Text>
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
                      color={star <= rating ? '#FFD700' : '#DDD'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingText}>
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
              <Text style={styles.sectionLabel}>Your Review (Optional)</Text>
              <TextInput
                style={styles.reviewInput}
                multiline
                numberOfLines={6}
                placeholder="Share your experience..."
                placeholderTextColor="#999"
                value={reviewText}
                onChangeText={setReviewText}
                textAlignVertical="top"
                editable={!isSubmitting}
              />
            </View>

            {/* Attachments */}
            <View style={styles.attachmentsSection}>
              <Text style={styles.sectionLabel}>Attachments (Optional)</Text>
              <Text style={styles.attachmentHint}>
                Max 5 files, 10MB each. Images or documents (PDF, DOC, DOCX)
              </Text>

              {/* Attachment Buttons */}
              <View style={styles.attachmentButtons}>
                <TouchableOpacity
                  style={styles.attachmentButton}
                  onPress={pickImage}
                  disabled={isSubmitting || attachments.length >= 5}
                >
                  <Ionicons name="image-outline" size={24} color="#007AFF" />
                  <Text style={styles.attachmentButtonText}>Add Photos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.attachmentButton}
                  onPress={pickDocument}
                  disabled={isSubmitting || attachments.length >= 5}
                >
                  <Ionicons name="document-outline" size={24} color="#007AFF" />
                  <Text style={styles.attachmentButtonText}>Add Documents</Text>
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

          {/* Submit Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (rating === 0 || isSubmitting) && styles.submitButtonDisabled
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

            {/* Skip Button - Only for Poster */}
            {userRole === 'poster' && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                disabled={isSubmitting}
              >
                <Text style={styles.skipButtonText}>Skip & Complete Task</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flexShrink: 1,
    flexGrow: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  taskInfo: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    marginTop: 1,
  },
  taskLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  ratingSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
  },
  starButton: {
    padding: 8,
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  reviewSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#333',
    minHeight: 120,
    backgroundColor: '#FFF',
  },
  attachmentsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  attachmentHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 8,
  },
  attachmentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  attachmentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  attachmentItem: {
    width: 100,
    alignItems: 'center',
    position: 'relative',
  },
  attachmentImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  attachmentDoc: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  attachmentName: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
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
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    flexShrink: 0,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#999',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
});
