import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  selectedSort: number;
  onSortChange: (index: number) => void;
  sortOptions: string[];
}

export default function SortModal({
  visible,
  onClose,
  selectedSort,
  onSortChange,
  sortOptions,
}: SortModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.sortModal}>
          <View style={styles.sortHeader}>
            <Text style={styles.sortTitle}>Sort By</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {sortOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.sortOption,
                  selectedSort === index && styles.sortOptionSelected,
                ]}
                onPress={() => {
                  onSortChange(index);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    selectedSort === index && styles.sortOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
                {selectedSort === index && (
                  <Ionicons name="checkmark" size={20} color="#007bff" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sortModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  sortHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sortTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sortOptionSelected: {
    backgroundColor: '#f0f8ff',
  },
  sortOptionText: {
    fontSize: 16,
  },
  sortOptionTextSelected: {
    color: '#007bff',
    fontWeight: '600',
  },
});
