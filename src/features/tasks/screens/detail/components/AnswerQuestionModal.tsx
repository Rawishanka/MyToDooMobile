import { BRAND_BLUE, BRAND_ORANGE, CARD_BG, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
import { useTheme } from '@/src/shared/theme';
import { AttachmentItem, AttachmentPicker } from '@/src/shared/components/AttachmentPicker';
import { useAnswerTaskQuestion } from '@/src/shared/hooks/useTaskApi';
import { moderateContent } from '@/src/shared/utils/contentModeration';
import { formatUserName } from '@/src/utils/formatUserName';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { RFValue } from '@/src/shared/utils/responsive';

interface AnswerQuestionModalProps {
  visible: boolean;
  onClose: () => void;
  question: {
    _id: string;
    question: string | { text: string };
    askedBy?: {
      firstName?: string;
      lastName?: string;
    };
    userId?: {
      firstName?: string;
      lastName?: string;
    };
    isAnonymous?: boolean;
  };
  taskId: string;
  onAnswerSubmitted?: () => void;
}

export const AnswerQuestionModal: React.FC<AnswerQuestionModalProps> = ({
  visible,
  onClose,
  question,
  taskId,
  onAnswerSubmitted,
}) => {
  const { isDarkMode } = useTheme();
  const [answer, setAnswer] = useState('');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const answerQuestionMutation = useAnswerTaskQuestion();

  // Use the specific task ID from the question if available (for public questions)
  const questionTaskId = (question as any)?.taskIdToUse || taskId;

  // Cleanup state when modal closes
  useEffect(() => {
    if (!visible) {
      setAnswer('');
      setAttachments([]);
    }
  }, [visible]);

  const canSubmitAnswer =
    attachments.length > 0 || answer.trim().length >= 10;

  const handleSubmitAnswer = async () => {
    if (!answer.trim() && attachments.length === 0) {
      Alert.alert('Missing Answer', 'Please enter your answer or attach a file.');
      return;
    }

    if (attachments.length === 0 && answer.trim().length < 10) {
      Alert.alert('Answer Too Short', 'Please provide more details in your answer.');
      return;
    }

    // Moderate content before submitting
    if (answer.trim()) {
      const moderationResult = moderateContent(answer);
      if (!moderationResult.isClean) {
        Alert.alert(
          'Answer Blocked',
          moderationResult.reason || 'Your answer contains inappropriate content.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    try {
      console.log('💬 Submitting answer with attachments:', {
        taskId: questionTaskId,
        questionId: question._id,
        answer: answer.trim(),
        attachments: attachments.length,
      });

      // Convert attachments to the format expected by the API
      const files = attachments.map(att => ({
        uri: att.uri,
        name: att.name,
        type: att.type === 'image' ? 'image/jpeg' : 'application/pdf'
      }));

      await answerQuestionMutation.mutateAsync({
        taskId: questionTaskId,
        questionId: question._id,
        answer: answer.trim(),
        files: files.length > 0 ? files : undefined,
      });

      console.log('✅ Answer posted successfully');
      
      // Close modal first to prevent navigation blocking
      setAnswer('');
      setAttachments([]);
      onClose();
      
      // Show success alert after modal is closed
      setTimeout(() => {
        Alert.alert(
          'Answer Posted!',
          'Your answer has been sent to the person who asked the question.',
          [{ text: 'OK' }]
        );
      }, 300);
      
      // Questions list will auto-refresh via React Query cache invalidation
      console.log('💫 Answer submitted, questions will refresh automatically via cache invalidation');

    } catch (error: any) {
      console.error('❌ Failed to post answer:', error);
      Alert.alert(
        'Failed to Post Answer',
        error?.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const getQuestionText = () => {
    return typeof question.question === 'string' 
      ? question.question 
      : question.question?.text || 'No question text';
  };

  const getAskedByName = () => {
    if (question.isAnonymous) return 'Anonymous User';
    
    const firstName = question.askedBy?.firstName || question.userId?.firstName || '';
    const lastName = question.askedBy?.lastName || question.userId?.lastName || '';
    
    return formatUserName(firstName, lastName);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <View style={[styles.container, isDarkMode && { backgroundColor: "#0B1120" }]}>
        {/* Header */}
        <View style={[styles.header, isDarkMode && { borderBottomColor: "#334155", backgroundColor: "#0B1120" }]}>
          <Text style={[styles.headerTitle, isDarkMode && { color: "#F8FAFC" }]}>Answer Question</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={isDarkMode ? "#F8FAFC" : CARD_TEXT} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" removeClippedSubviews={false}>
          {/* Original Question */}
          <View style={styles.questionContainer}>
            <Text style={[styles.sectionTitle, isDarkMode && { color: "#F8FAFC" }]}>❓ Question from {getAskedByName()}</Text>
            <View style={[styles.questionCard, isDarkMode && { backgroundColor: "#1E293B", borderLeftColor: "#38BDF8" }]}>
              <Text style={[styles.questionText, isDarkMode && { color: "#E2E8F0" }]}>{getQuestionText()}</Text>
            </View>
          </View>

          {/* Answer Input */}
          <View style={styles.answerContainer}>
            <Text style={[styles.sectionTitle, isDarkMode && { color: "#F8FAFC" }]}>✍️ Your Answer</Text>
            <TextInput
              style={[styles.answerInput, isDarkMode && { backgroundColor: "#1E293B", borderColor: "#334155", color: "#F8FAFC" }]}
              placeholder="Type your answer here..."
              placeholderTextColor={isDarkMode ? "#64748B" : "#999"}
              value={answer}
              onChangeText={setAnswer}
              multiline
              numberOfLines={6}
              maxLength={1000}
              textAlignVertical="top"
              scrollEnabled
            />
            <Text style={[styles.characterCount, isDarkMode && { color: "#64748B" }]}>
              {answer.length}/1000 characters
            </Text>
          </View>

          {/* Attachment Picker */}
          <AttachmentPicker
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            maxAttachments={3}
            allowImages={true}
            allowDocuments={true}
          />

          {/* Answer Tips */}
          <View style={[styles.tipsContainer, isDarkMode && { backgroundColor: "#1E293B" }]}>
            <Text style={[styles.tipsTitle, isDarkMode && { color: "#38BDF8" }]}>💡 Tips for a good answer:</Text>
            <Text style={[styles.tipText, isDarkMode && { color: "#94A3B8" }]}>• Be specific and clear in your response</Text>
            <Text style={[styles.tipText, isDarkMode && { color: "#94A3B8" }]}>• Include relevant details or instructions</Text>
            <Text style={[styles.tipText, isDarkMode && { color: "#94A3B8" }]}>• Attach images or documents to help explain</Text>
            <Text style={[styles.tipText, isDarkMode && { color: "#94A3B8" }]}>• Mention any materials or tools needed</Text>
            <Text style={[styles.tipText, isDarkMode && { color: "#94A3B8" }]}>• Provide timeline or schedule information</Text>
            <Text style={[styles.tipText, isDarkMode && { color: "#94A3B8" }]}>• Be helpful and professional</Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={[styles.footer, isDarkMode && { borderTopColor: "#334155" }]}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              !canSubmitAnswer && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitAnswer}
            disabled={!canSubmitAnswer || answerQuestionMutation.isPending}
          >
            {answerQuestionMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Submit Answer</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BRAND_BLUE,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_BLUE,
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: CARD_TEXT,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  questionContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  questionCard: {
    backgroundColor: CARD_BG,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: BRAND_ORANGE,
  },
  questionText: {
    fontSize: RFValue(15),
    color: CARD_TEXT,
    lineHeight: 22,
  },
  answerContainer: {
    marginBottom: 24,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: RFValue(15),
    color: '#333',
    minHeight: 120,
    maxHeight: 200,
  },
  characterCount: {
    fontSize: RFValue(12),
    color: '#666',
    textAlign: 'right',
    marginTop: 8,
  },
  tipsContainer: {
    backgroundColor: CARD_BG,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: CARD_TEXT,
    marginBottom: 8,
  },
  tipText: {
    fontSize: RFValue(13),
    color: CARD_TEXT_MUTED,
    marginBottom: 4,
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: BRAND_ORANGE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
});