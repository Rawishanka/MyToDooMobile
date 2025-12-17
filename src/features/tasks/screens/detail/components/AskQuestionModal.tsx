import { AttachmentItem, AttachmentPicker } from '@/src/shared/components/AttachmentPicker';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

  // Cleanup attachments when modal closes
  useEffect(() => {
    if (!visible) {
      setAttachments([]);
    }
  }, [visible]);

  const handleSubmit = () => {
    onSubmit(attachments);
  };

  const handleClose = () => {
    setAttachments([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ask a Question</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* Question Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.questionInput}
                placeholder="Type your question here..."
                placeholderTextColor="#999"
                value={questionText}
                onChangeText={onChangeText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Compact AttachmentPicker */}
            <AttachmentPicker
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              maxAttachments={3}
              allowImages={true}
              allowDocuments={true}
            />

            {/* Guidelines */}
            <View style={styles.guidelinesContainer}>
              <Text style={styles.guidelinesTitle}>💡 Question Tips:</Text>
              <Text style={styles.guideline}>• Be specific and clear in your question</Text>
              <Text style={styles.guideline}>• Include images if they help explain your question</Text>
              <Text style={styles.guideline}>• Attach relevant documents if needed</Text>
              <Text style={styles.guideline}>• Ask about task details, requirements, or timeline</Text>
            </View>
          </ScrollView>

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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '85%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  scrollContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  questionInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  guideline: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
    lineHeight: 18,
  },
  submitQuestionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitQuestionButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitQuestionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
