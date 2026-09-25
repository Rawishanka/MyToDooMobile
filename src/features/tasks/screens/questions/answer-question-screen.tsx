import { AttachmentItem, AttachmentPicker } from '@/src/shared/components/AttachmentPicker';
import { useAnswerTaskQuestion, useGetTaskById, useGetTaskQuestions } from '@/src/shared/hooks/useTaskApi';
import { formatUserName } from '@/src/utils/formatUserName';import { moderateContent } from '@/src/shared/utils/contentModeration';import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';
import { HS, homeCard } from '@/src/shared/theme/homeStyle';

export default function AnswerQuestionScreen() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { taskId, questionId } = useLocalSearchParams<{ 
    taskId: string; 
    questionId: string;
  }>();
  
  const [answer, setAnswer] = useState('');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: taskData, isLoading: isTaskLoading } = useGetTaskById(taskId || '', !!taskId);
  const { data: questionsData, isLoading: isQuestionsLoading } = useGetTaskQuestions(taskId || '', !!taskId);
  const answerQuestionMutation = useAnswerTaskQuestion();

  const task = taskData?.data;
  const questions = questionsData?.data || [];
  const question = questions.find(q => q._id === questionId);

  const isLoading = isTaskLoading || isQuestionsLoading;

  const canSubmitAnswer =
    attachments.length > 0 || answer.trim().length >= 10;

  const handleSubmitAnswer = async () => {
    try {
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

      setIsSubmitting(true);

      console.log('💬 Posting answer with attachments:', {
        answer: answer.trim(),
        attachments: attachments.length
      });

      const files = attachments.map(att => ({
        uri: att.uri,
        name: att.name,
        type: att.type === 'image' ? 'image/jpeg' : 'application/pdf',
      }));

      const result = await answerQuestionMutation.mutateAsync({
        taskId: taskId!,
        questionId: questionId!,
        answer: answer.trim(),
        files: files.length > 0 ? files : undefined,
      });

      console.log('✅ Answer posted successfully:', result);

      Alert.alert(
        'Answer Posted!',
        'Your answer has been sent to the person who asked the question.',
        [
          {
            text: 'View All Questions',
            onPress: () => router.push(`./task-questions?taskId=${taskId}`)
          },
          {
            text: 'Back to Task',
            onPress: () => router.push(`./task-detail?taskId=${taskId}`)
          }
        ]
      );

    } catch (error: any) {
      console.error('❌ Failed to post answer:', error);
      Alert.alert(
        'Failed to Post Answer',
        error?.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAnswerTips = () => {
    return [
      'Be specific and clear in your response',
      'Include relevant details or instructions',
      'Attach images or documents to help explain your answer',
      'Mention any materials or tools needed',
      'Provide timeline or schedule information',
      'Be helpful and professional'
    ];
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, isDarkMode && { backgroundColor: '#0B1120' }]}>
        <ActivityIndicator size="large" color={HS.blue} />
        <Text style={styles.loadingText}>Loading question details...</Text>
      </View>
    );
  }

  if (!task || !question) {
    return (
      <View style={[styles.errorContainer, isDarkMode && { backgroundColor: '#0B1120' }]}>
        <View style={styles.iconCircle}>
          <Ionicons name="alert-circle-outline" size={44} color={HS.redText} />
        </View>
        <Text style={styles.errorTitle}>Question Not Found</Text>
        <Text style={styles.errorSubtitle}>Could not load question details.</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#003399" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Answer Question</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Summary */}
        <View style={styles.taskSummary}>
          <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
          <Text style={styles.taskLocation}>
            {task.location?.address || 'Location not specified'}
          </Text>
        </View>

        {/* Original Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.sectionTitle}>❓ Question</Text>
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionAsker}>
                Asked by {formatUserName(question.askedBy?.firstName, question.askedBy?.lastName)}
              </Text>
              <Text style={styles.questionDate}>
                {new Date(question.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.questionText}>{question.question}</Text>
          </View>
        </View>

        {/* Answer Form */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Your Answer</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.answerInput}
              value={answer}
              onChangeText={setAnswer}
              placeholder="Type your answer here... Be helpful and specific."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor={HS.placeholder}
              maxLength={1000}
              scrollEnabled
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
            <Text style={styles.tipsTitle}>💡 Tips for a Great Answer:</Text>
            {getAnswerTips().map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* Guidelines */}
          <View style={styles.guidelinesContainer}>
            <Text style={styles.guidelinesTitle}>📋 Answer Guidelines:</Text>
            <Text style={styles.guideline}>• Answer only the question that was asked</Text>
            <Text style={styles.guideline}>• Provide accurate and helpful information</Text>
            <Text style={styles.guideline}>• Be professional and respectful</Text>
            <Text style={styles.guideline}>• Include relevant details without being overwhelming</Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.submitButton, (isSubmitting || !canSubmitAnswer) && styles.submittingButton]}
          onPress={handleSubmitAnswer}
          disabled={isSubmitting || !canSubmitAnswer}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={HS.blue} />
          ) : (
            <>
              <Ionicons name="chatbubble" size={20} color={canSubmitAnswer ? '#FFFFFF' : HS.muted} />
              <Text style={[styles.submitButtonText, !canSubmitAnswer && { color: HS.muted }]}>Post Answer</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HS.page,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: HS.page,
  },
  loadingText: {
    marginTop: 12,
    fontSize: RFValue(16),
    color: HS.muted,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: HS.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: HS.page,
  },
  errorTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: HS.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: RFValue(16),
    color: HS.muted,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: HS.blue,
    fontSize: RFValue(16),
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#003399',
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
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  taskSummary: {
    ...homeCard,
    padding: 16,
    marginTop: 20,
  },
  taskTitle: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: HS.navy,
    marginBottom: 8,
  },
  taskLocation: {
    fontSize: RFValue(14),
    color: HS.muted,
  },
  questionContainer: {
    marginTop: 24,
  },
  questionCard: {
    ...homeCard,
    padding: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionAsker: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: HS.navy,
  },
  questionDate: {
    fontSize: RFValue(12),
    color: HS.muted,
  },
  questionText: {
    fontSize: RFValue(16),
    color: HS.text,
    lineHeight: 22,
  },
  formContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: HS.navy,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  answerInput: {
    borderWidth: 1.5,
    borderColor: HS.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: RFValue(16),
    color: HS.navy,
    minHeight: 120,
    maxHeight: 200,
    backgroundColor: '#fff',
  },
  characterCount: {
    fontSize: RFValue(12),
    color: HS.muted,
    textAlign: 'right',
    marginTop: 4,
  },
  tipsContainer: {
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: HS.navy,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  tipBullet: {
    fontSize: RFValue(14),
    color: HS.blue,
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: RFValue(14),
    color: HS.text,
    lineHeight: 20,
  },
  guidelinesContainer: {
    backgroundColor: HS.tint,
    borderWidth: 1,
    borderColor: HS.tintBorder,
    borderRadius: 16,
    padding: 16,
  },
  guidelinesTitle: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: HS.navy,
    marginBottom: 8,
  },
  guideline: {
    fontSize: RFValue(12),
    color: HS.text,
    marginBottom: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HS.cardBorder,
  },
  submitButton: {
    backgroundColor: '#ff6b35',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  submittingButton: {
    backgroundColor: HS.tintStrong,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontWeight: '700',
  },
});