// Edit Task Modal Component

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface EditTaskModalProps {
  visible: boolean;
  onClose: () => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ 
  visible, 
  onClose 
}) => {
  const [taskTitle, setTaskTitle] = useState('Help me with Excel');
  const [selectedDateOption, setSelectedDateOption] = useState('before');
  const [isOnline, setIsOnline] = useState(true);
  const [needsTimeOfDay, setNeedsTimeOfDay] = useState(false);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.editContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Header */}
        <View style={styles.editHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.editHeaderTitle}>Edit task</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.editContent}>
          {/* Task Title */}
          <Text style={styles.sectionLabel}>Task title</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={taskTitle}
              onChangeText={setTaskTitle}
              placeholder="Enter task title"
            />
          </View>

          {/* Task Date */}
          <Text style={styles.sectionLabel}>Task date</Text>
          
          <TouchableOpacity 
            style={[
              styles.dateOption, 
              selectedDateOption === 'before' && styles.dateOptionSelected
            ]}
            onPress={() => setSelectedDateOption('before')}
          >
            <Text style={[
              styles.dateOptionText,
              selectedDateOption === 'before' && styles.dateOptionTextSelected
            ]}>
              Before Tue, 19 Aug
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.dateOption,
              selectedDateOption === 'ondate' && styles.dateOptionSelected
            ]}
            onPress={() => setSelectedDateOption('ondate')}
          >
            <Text style={[
              styles.dateOptionText,
              selectedDateOption === 'ondate' && styles.dateOptionTextSelected
            ]}>
              On date
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.dateOption,
              selectedDateOption === 'flexible' && styles.dateOptionSelected
            ]}
            onPress={() => setSelectedDateOption('flexible')}
          >
            <Text style={[
              styles.dateOptionText,
              selectedDateOption === 'flexible' && styles.dateOptionTextSelected
            ]}>
              I'm flexible
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setNeedsTimeOfDay(!needsTimeOfDay)}
          >
            <View style={[styles.checkbox, needsTimeOfDay && styles.checkboxChecked]}>
              {needsTimeOfDay && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>I need a certain time of day</Text>
          </TouchableOpacity>

          {/* Location */}
          <Text style={styles.sectionLabel}>Location</Text>
          <View style={styles.locationContainer}>
            <TouchableOpacity 
              style={[
                styles.locationOption, 
                !isOnline && styles.locationOptionSelected
              ]}
              onPress={() => setIsOnline(false)}
            >
              <Ionicons 
                name="location-outline" 
                size={24} 
                color={!isOnline ? "#fff" : "#666"} 
                style={styles.locationIcon}
              />
              <Text style={[
                styles.locationTitle,
                !isOnline && styles.locationTitleSelected
              ]}>
                In Person
              </Text>
              <Text style={[
                styles.locationDescription,
                !isOnline && styles.locationDescriptionSelected
              ]}>
                This task has to be done{'\n'}in person
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.locationOption,
                isOnline && styles.locationOptionSelected
              ]}
              onPress={() => setIsOnline(true)}
            >
              <Ionicons 
                name="phone-portrait-outline" 
                size={24} 
                color={isOnline ? "#fff" : "#666"}
                style={styles.locationIcon}
              />
              <Text style={[
                styles.locationTitle,
                isOnline && styles.locationTitleSelected
              ]}>
                Online
              </Text>
              <Text style={[
                styles.locationDescription,
                isOnline && styles.locationDescriptionSelected
              ]}>
                This task can to be done{'\n'}from anywhere
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={onClose}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  editContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: (StatusBar.currentHeight || 0) + 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  editHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a237e',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 32,
  },
  editContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
    marginTop: 25,
  },
  inputContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    fontSize: 16,
    color: '#2c3e50',
    minHeight: 20,
  },
  dateOption: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  dateOptionSelected: {
    backgroundColor: '#1a237e',
  },
  dateOptionText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    fontWeight: '500',
  },
  dateOptionTextSelected: {
    color: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 3,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#2c3e50',
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  locationOption: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 120,
  },
  locationOptionSelected: {
    backgroundColor: '#1a237e',
  },
  locationIcon: {
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  locationTitleSelected: {
    color: '#fff',
  },
  locationDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 16,
  },
  locationDescriptionSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
