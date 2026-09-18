import { useTheme } from '@/src/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';

interface NetworkAlertProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export const NetworkAlert: React.FC<NetworkAlertProps> = ({
  visible,
  onClose,
  title = 'No Internet',
  message,
  actionText = 'OK',
  onAction,
}) => {
  const { isDarkMode } = useTheme();
  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.alertContainer, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1 }]}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="cloud-offline" size={48} color="#FF6B6B" />
          </View>

          {/* Title */}
          <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>{title}</Text>

          {/* Message */}
          <Text style={[styles.message, isDarkMode && { color: '#94A3B8' }]}>{message}</Text>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAction}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>{actionText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: RFValue(15),
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actions: {
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
});
