import { useCreateTaskStore } from '@/store/create-task-store';
import { AntDesign } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Switch,
  Text, TouchableOpacity,
  View
} from 'react-native';

const TimeSelectScreen = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isTimeSwitchOn, setIsTimeSwitchOn] = useState(false);
  const [selectedTimeBlock, setSelectedTimeBlock] = useState('');

  const { myTask, updateMyTask } = useCreateTaskStore();
const handleDateChange = (
    event: DateTimePickerEvent,
    date?: Date | undefined
): void => {
    setShowDatePicker(false);
    if (date) {
        setSelectedDate(date);
    }
};

  const options = ['On Time', 'Before date', "I'm Flexible"];
  const timeBlocks = [
    { label: 'Morning', value: 'morning', description: 'before 12 pm' },
    { label: 'Afternoon', value: 'afternoon', description: '12pm to 5 pm' },
    { label: 'Evening', value: 'evening', description: 'After 5pm' },
    { label: 'Late night', value: 'night', description: 'After 9pm' },
  ];

  return (
    <View style={styles.container}>
      {/* Back Arrow Top Left */}
      <TouchableOpacity style={styles.backButton}>
        <AntDesign name="arrowleft" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.title}>Choose a time</Text>
      <Text style={styles.subtitle}>When do you need this done?</Text>

      {options.map((option) => (
        <View key={option} style={styles.optionRow}>
          <TouchableOpacity
            style={styles.radioBox}
            onPress={() => {
              setSelectedOption(option);
              if (option !== "I'm Flexible") {
                setShowDatePicker(true);
              } else {
                setShowDatePicker(false);
              }
            }}
          >
            <View style={[
              styles.radioOuter,
              selectedOption === option && styles.radioOuterSelected,
            ]}>
              {selectedOption === option && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>

          {/* Show selected date under the option, except for 'I'm Flexible' */}
          {selectedOption === option && selectedDate && option !== "I'm Flexible" && (
            <Text style={styles.dateText}>
              📅 {selectedDate.toDateString()}
            </Text>
          )}
        </View>
      ))}

      {/* Toggle */}
      <View style={styles.switchRow}>
        <Text style={styles.optionText}>I need certain time of day</Text>
        <Switch
          value={isTimeSwitchOn}
          onValueChange={setIsTimeSwitchOn}
        />
      </View>

      {/* Time of Day Grid */}
      {isTimeSwitchOn && (
        <View style={styles.gridContainer}>
          {timeBlocks.map(block => (
            <TouchableOpacity
              key={block.value}
              style={[
                styles.gridItem,
                selectedTimeBlock === block.value && styles.gridItemSelected
              ]}
              onPress={() => setSelectedTimeBlock(block.value)}
            >
              <Text style={styles.gridTitle}>{block.label}</Text>
              <Text style={styles.gridDescription}>{block.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.continueButton, selectedOption === '' && { backgroundColor: '#D1D1D6' }]}
        disabled={selectedOption === ''}
        onPress={() => {
          updateMyTask({
            ...myTask,
            date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
            time: isTimeSwitchOn && selectedTimeBlock ? selectedTimeBlock : '',
          });
          router.push('/location-screen');
        }}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </View>
  );
};

export default TimeSelectScreen;
const styles = StyleSheet.create({
  headerArrow: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 6,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    color: '#1C1C1E',
    marginTop: 36,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  optionRow: {
    marginBottom: 16,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  radioBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#0057FF',
  },
  radioInner: {
    width: 10,
    height: 10,
    backgroundColor: '#0057FF',
    borderRadius: 5,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  dateText: {
    marginLeft: 30,
    marginTop: 5,
    color: '#0057FF',
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginVertical: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gridItemSelected: {
    borderColor: '#FF6A00', // Orange border
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  gridDescription: {
    fontSize: 12,
    color: '#666',
  },
  continueButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 40,
    backgroundColor: '#0057FF',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
