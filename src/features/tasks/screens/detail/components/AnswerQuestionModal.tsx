import { AttachmentItem, AttachmentPicker } from '@/src/shared/components/AttachmentPicker';
import { useAnswerTaskQuestion } from '@/src/shared/hooks/useTaskApi';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      Alert.alert('Missing Answer', 'Please enter your answer.');
      return;
    }

    if (answer.trim().length < 10) {
      Alert.alert('Answer Too Short', 'Please provide more details in your answer.');
      return;
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
    
    return `${firstName} ${lastName}`.trim() || 'Unknown User';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Answer Question</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Original Question */}
          <View style={styles.questionContainer}>
            <Text style={styles.sectionTitle}>❓ Question from {getAskedByName()}</Text>
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>{getQuestionText()}</Text>
            </View>
          </View>

          {/* Answer Input */}
          <View style={styles.answerContainer}>
            <Text style={styles.sectionTitle}>✍️ Your Answer</Text>
            <TextInput
              style={styles.answerInput}
              placeholder="Type your answer here..."
              placeholderTextColor="#999"
              value={answer}
              onChangeText={setAnswer}
              multiline
              numberOfLines={6}
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
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
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Tips for a good answer:</Text>
            <Text style={styles.tipText}>• Be specific and clear in your response</Text>
            <Text style={styles.tipText}>• Include relevant details or instructions</Text>
            <Text style={styles.tipText}>• Attach images or documents to help explain</Text>
            <Text style={styles.tipText}>• Mention any materials or tools needed</Text>
            <Text style={styles.tipText}>• Provide timeline or schedule information</Text>
            <Text style={styles.tipText}>• Be helpful and professional</Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!answer.trim() || answer.trim().length < 10) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitAnswer}
            disabled={!answer.trim() || answer.trim().length < 10 || answerQuestionMutation.isPending}
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  questionCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  questionText: {
    fontSize: 15,
    color: '#333',
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
    fontSize: 15,
    color: '#333',
    minHeight: 120,
    maxHeight: 200,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 8,
  },
  tipsContainer: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#007AFF',
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
    fontSize: 16,
    fontWeight: '600',
  },
});