import { useTheme } from '@/src/shared/theme';
import { appAlert } from '@/src/shared/components/AppAlert';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BRAND_BLUE, BRAND_ORANGE, CARD_TEXT } from '@/src/shared/theme/brandColors';
import { RFValue } from '@/src/shared/utils/responsive';

interface MarkCompleteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function MarkCompleteModal({
  visible,
  onClose,
  onConfirm,
}: MarkCompleteModalProps) {
  const { isDarkMode } = useTheme();
  const [completionNotes, setCompletionNotes] = useState('');

  const handleConfirm = () => {
    setCompletionNotes('');
    onClose();
    appAlert(
      'Task marked complete',
      'The poster has been informed the task has been completed and to release payment.',
      [{ text: 'OK', onPress: onConfirm }],
      { type: 'success', autoCloseMs: 3000 },
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1 }]}>
          <View style={[styles.header, !isDarkMode && styles.headerBand]}>
            <Text style={[styles.title, !isDarkMode && { color: CARD_TEXT }, isDarkMode && { color: '#F8FAFC' }]}>Mark Task Complete</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={isDarkMode ? "#94A3B8" : CARD_TEXT} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.description, isDarkMode && { color: '#94A3B8' }]}>
            Add any notes about the task completion (optional):
          </Text>

          <TextInput
            style={[styles.input, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }]}
            placeholder="Completion notes..."
            placeholderTextColor="#94A3B8"
            value={completionNotes}
            onChangeText={setCompletionNotes}
            multiline={true}
            textAlignVertical="top"
            maxLength={500}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.cancelButton, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]} onPress={onClose}>
              <Text style={[styles.cancelButtonText, isDarkMode && { color: '#94A3B8' }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Mark Complete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerBand: {
    backgroundColor: BRAND_BLUE,
    marginHorizontal: -20,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D1B2A',
  },
  description: {
    fontSize: RFValue(14),
    color: '#666',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#0D1B2A',
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    height: 96,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    height: 50,
    justifyContent: 'center',
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: BRAND_ORANGE,
    height: 50,
    justifyContent: 'center',
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: BRAND_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
