import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AskQuestionModalProps {
  visible: boolean;
  questionText: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
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
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ask a Question</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

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

          <TouchableOpacity
            style={[
              styles.submitQuestionButton,
              !questionText.trim() && styles.submitQuestionButtonDisabled,
            ]}
            onPress={onSubmit}
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
  questionInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000',
    minHeight: 120,
    marginBottom: 20,
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
