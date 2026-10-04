import { AttachmentItem, AttachmentPicker } from '@/src/shared/components/AttachmentPicker';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND_ORANGE, CARD_BG, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
import { useTheme } from '@/src/shared/theme/ThemeContext';
import { RFValue } from '@/src/shared/utils/responsive';
import AppLoader from '@/src/shared/components/AppLoader';

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

          <View style={[styles.modalHeader, !isDarkMode && styles.modalHeaderBand]}>
            <Text style={[styles.modalTitle, isDarkMode && { color: "#38BDF8" }]}>Ask a Question</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={isDarkMode ? "#F8FAFC" : CARD_TEXT} />
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
                placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                value={questionText}
                onChangeText={(text) => onChangeText(text.slice(0, 500))}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
                scrollEnabled={false}
                onFocus={() => {
                  // Keep the question box in view (scrollToEnd jumped past it to the tips below)
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
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
              <AppLoader size={22} color="#fff" />
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
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    fontSize: 20,
    fontWeight: '700',
    color: CARD_TEXT,
  },
  modalHeaderBand: {
    backgroundColor: CARD_BG,
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 16,
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
    color: '#64748B',
    textAlign: 'right',
    marginTop: 4,
  },
  questionInput: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#0D1B2A',
    minHeight: 120,
  },
  guidelinesContainer: {
    backgroundColor: CARD_BG,
    padding: 16,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  guidelinesTitle: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: CARD_TEXT,
    marginBottom: 8,
  },
  guideline: {
    fontSize: RFValue(13),
    color: CARD_TEXT_MUTED,
    marginBottom: 4,
    lineHeight: 18,
  },
  submitQuestionButton: {
    backgroundColor: BRAND_ORANGE,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  submitQuestionButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitQuestionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
