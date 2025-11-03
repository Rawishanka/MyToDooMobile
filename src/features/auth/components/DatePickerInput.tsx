// Date Picker Input Component with Age Validation

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { formatDateForDisplay } from './signup-helpers';

interface DatePickerInputProps {
  dateOfBirth: Date | null;
  showDatePicker: boolean;
  onTogglePicker: (show: boolean) => void;
  onDateChange: (event: DateTimePickerEvent, selectedDate?: Date) => void;
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  dateOfBirth,
  showDatePicker,
  onTogglePicker,
  onDateChange,
}) => {
  return (
    <>
      <Text style={styles.label}>Date of Birth *</Text>
      <Text style={styles.subLabel}>You must be 18 years or older to create an account</Text>
      <TouchableOpacity 
        style={styles.dateInputContainer}
        onPress={() => onTogglePicker(true)}
        activeOpacity={0.7}
      >
        <View style={styles.dateInputWrapper}>
          <Ionicons 
            name="calendar-outline" 
            size={18} 
            color="#666" 
            style={styles.dateIcon}
          />
          <Text style={dateOfBirth ? styles.dateInputTextSelected : styles.dateInputTextPlaceholder}>
            {dateOfBirth ? formatDateForDisplay(dateOfBirth) : 'Select your date of birth'}
          </Text>
        </View>
      </TouchableOpacity>

      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => onTogglePicker(false)}
          >
            <View style={styles.datePickerModalOverlay}>
              <View style={styles.datePickerModalContent}>
                <View style={styles.datePickerHeader}>
                  <TouchableOpacity onPress={() => onTogglePicker(false)}>
                    <Text style={styles.datePickerCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.datePickerTitle}>Select Date of Birth</Text>
                  <TouchableOpacity onPress={() => onTogglePicker(false)}>
                    <Text style={styles.datePickerDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={dateOfBirth || new Date(2000, 0, 1)}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={dateOfBirth || new Date(2000, 0, 1)}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
          />
        )
      )}
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  subLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  dateInputContainer: {
    marginBottom: 16,
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FAFAFA',
  },
  dateIcon: {
    marginRight: 10,
  },
  dateInputTextPlaceholder: {
    fontSize: 15,
    color: '#999',
  },
  dateInputTextSelected: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  datePickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  datePickerCancelText: {
    fontSize: 16,
    color: '#666',
  },
  datePickerDoneText: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: '600',
  },
});
