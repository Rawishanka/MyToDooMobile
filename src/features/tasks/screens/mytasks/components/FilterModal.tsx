import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { TASK_FILTERS, TaskFilter } from '../hooks/useMyTasksFilters';

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
              <Pressable onPress={onClose}>
                <Ionicons name="close" size={24} color="#333" />
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
                  <Ionicons name="checkmark" size={20} color="#002A5C" />
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
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#002A5C',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#002A5C',
    fontWeight: '600',
  },
});
