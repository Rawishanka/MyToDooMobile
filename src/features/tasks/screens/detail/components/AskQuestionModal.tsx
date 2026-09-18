import { AttachmentItem, AttachmentPicker } from '@/src/shared/components/AttachmentPicker';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND_BLUE, BRAND_ORANGE } from '@/src/shared/theme/brandColors';
import { useTheme } from '@/src/shared/theme/ThemeContext';
import { RFValue } from '@/src/shared/utils/responsive';

interface AskQuestionModalProps {
  visible: boolean;
  questionText: string;
  onChangeText: (text: string) => void;
  onSubmit: (attachments: AttachmentItem[]) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

export const AskQuestionModal: React.FC<AskQuestionModalProps> = ({
  visible,
  questionText,
  onChangeText,
  onSubmit,
  onClose,
  isSubmitting,
}) => {
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const { height: SCREEN_HEIGHT } = useWindowDimensions();

  // Track keyboard height for Android
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
      () => setKeyboardHeight(0)
    );
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // Cleanup attachments when modal closes
  useEffect(() => {
    if (!visible) {
      setAttachments([]);
      setKeyboardHeight(0);
    } else {
      // Scroll to top when modal opens
      setTimeout(() => scrollViewRef.current?.scrollTo({ y: 0, animated: false }), 100);
    }
  }, [visible]);

  const handleSubmit = () => {
    onSubmit(attachments);
  };

  const handleClose = () => {
    setAttachments([]);
    onClose();
  };

  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* KAV must be outermost inside Modal for keyboard avoidance to work */}
      <KeyboardAvoidingView
        style={styles.kavWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        enabled
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={[
          styles.modalContent,
          isDarkMode && { backgroundColor: "#1E293B" },
          { paddingBottom: Math.max(insets.bottom, 16) },
          keyboardHeight > 0
            ? { maxHeight: SCREEN_HEIGHT - keyboardHeight - (Platform.OS === 'ios' ? insets.top + 20 : 40) }
            : { maxHeight: SCREEN_HEIGHT * 0.85 },
        ]}>
          {/* Handle bar */}
          <View style={[styles.handleBar, isDarkMode && { backgroundColor: "#334155" }]} />

          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, isDarkMode && { color: "#38BDF8" }]}>Ask a Question</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={isDarkMode ? "#F8FAFC" : BRAND_BLUE} />
            </TouchableOpacity>
          </View>

          {/* ScrollView is flexible - shrinks when keyboard appears */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            {/* Question Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.questionInput, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#334155", color: "#F8FAFC" }]}
                placeholder="Type your question here..."
                placeholderTextColor={isDarkMode ? "#64748B" : "#999"}
                value={questionText}
                onChangeText={(text) => onChangeText(text.slice(0, 500))}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
                scrollEnabled={false}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 300);
                }}
              />
              <Text style={[styles.charCount, isDarkMode && { color: "#64748B" }]}>{questionText.length}/500</Text>
            </View>

            {/* AttachmentPicker */}
            <AttachmentPicker
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              maxAttachments={3}
              allowImages={true}
              allowDocuments={true}
            />

            {/* Guidelines */}
            <View style={[styles.guidelinesContainer, isDarkMode && { backgroundColor: "#0F172A" }]}>
              <Text style={[styles.guidelinesTitle, isDarkMode && { color: "#38BDF8" }]}>💡 Question Tips:</Text>
              <Text style={[styles.guideline, isDarkMode && { color: "#94A3B8" }]}>• Be specific and clear in your question</Text>
              <Text style={[styles.guideline, isDarkMode && { color: "#94A3B8" }]}>• Include images if they help explain your question</Text>
              <Text style={[styles.guideline, isDarkMode && { color: "#94A3B8" }]}>• Attach relevant documents if needed</Text>
              <Text style={[styles.guideline, isDarkMode && { color: "#94A3B8" }]}>• Ask about task details, requirements, or timeline</Text>
            </View>
          </ScrollView>

          {/* Submit button is OUTSIDE ScrollView — always visible above keyboard */}
          <TouchableOpacity
            style={[
              styles.submitQuestionButton,
              !questionText.trim() && styles.submitQuestionButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!questionText.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitQuestionButtonText}>Submit Question</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  kavWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: BRAND_BLUE,
  },
  scrollContainer: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  charCount: {
    fontSize: RFValue(12),
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  questionInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: RFValue(16),
    color: '#000',
    minHeight: 120,
  },
  guidelinesContainer: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  guidelinesTitle: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: BRAND_BLUE,
    marginBottom: 8,
  },
  guideline: {
    fontSize: RFValue(13),
    color: '#555',
    marginBottom: 4,
    lineHeight: 18,
  },
  submitQuestionButton: {
    backgroundColor: BRAND_ORANGE,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitQuestionButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitQuestionButtonText: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#fff',
  },
});
