import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DateOption {
  label: string;
  value: string;
}

interface DateOptionSelectorProps {
  options: DateOption[];
  selectedOption: string;
  onSelectOption: (value: string) => void;
  onTimeDate: Date | null;
  beforeDate: Date | null;
  onOpenPicker: (pickerType: string) => void;
}

export const DateOptionSelector: React.FC<DateOptionSelectorProps> = ({
  options,
  selectedOption,
  onSelectOption,
  onTimeDate,
  beforeDate,
  onOpenPicker,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Date</Text>
      {options.map((option) => (
        <View key={option.value}>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => onSelectOption(option.value)}
          >
            <Text style={styles.optionText}>{option.label}</Text>
            <View style={[
              styles.radioOuter,
              selectedOption === option.value && styles.radioOuterSelected,
            ]}>
              {selectedOption === option.value && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* Show date selector for On Time */}
          {option.value === 'on_time' && selectedOption === 'on_time' && (
            <TouchableOpacity 
              onPress={() => onOpenPicker('on_time')} 
              style={styles.dateSelector}
            >
              <Text style={styles.dateText}>
                📅 {onTimeDate ? onTimeDate.toDateString() : 'Select date'} (Tap to change)
              </Text>
            </TouchableOpacity>
          )}

          {/* Show date selector for Before */}
          {option.value === 'before' && selectedOption === 'before' && (
            <TouchableOpacity 
              onPress={() => onOpenPicker('before')} 
              style={styles.dateSelector}
            >
              <Text style={styles.dateText}>
                📅 {beforeDate ? beforeDate.toDateString() : 'Select date'} (Tap to change)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#0057FF',
    backgroundColor: '#0057FF',
  },
  radioInner: {
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  dateSelector: {
    marginBottom: 16,
    paddingLeft: 16,
  },
  dateText: {
    color: '#0057FF',
    fontSize: 14,
    fontWeight: '500',
  },
});
