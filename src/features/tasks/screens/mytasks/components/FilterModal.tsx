import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { TASK_FILTERS, TaskFilter } from '../hooks/useMyTasksFilters';
import { RFValue } from '@/src/shared/utils/responsive';

interface FilterModalProps {
  visible: boolean;
  selectedFilter: TaskFilter;
  onClose: () => void;
  onSelectFilter: (filter: TaskFilter) => void;
}

export default function FilterModal({
  visible,
  selectedFilter,
  onClose,
  onSelectFilter,
}: FilterModalProps) {
  const handleFilterPress = (filter: TaskFilter) => {
    onSelectFilter(filter);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.container}>
          <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Filter Tasks</Text>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color="#FFFFFF" />
              </Pressable>
            </View>

            {TASK_FILTERS.map((filter, index) => (
              <TouchableOpacity
                key={index}
                style={styles.option}
                onPress={() => handleFilterPress(filter)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedFilter === filter && styles.selectedOptionText,
                  ]}
                >
                  {filter}
                </Text>
                {selectedFilter === filter && (
                  <Ionicons name="checkmark-circle" size={22} color="#003399" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 100,
  },
  content: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#001A66',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#003399',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: RFValue(16),
    color: '#333',
  },
  selectedOptionText: {
    color: '#003399',
    fontWeight: '700',
  },
});
