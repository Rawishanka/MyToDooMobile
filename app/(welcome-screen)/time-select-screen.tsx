import { useCreateTaskStore } from '@/store/create-task-store';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const TimeSelectScreen = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activePickerOption, setActivePickerOption] = useState('');
  const [onTimeDate, setOnTimeDate] = useState<Date | null>(null);
  const [beforeDate, setBeforeDate] = useState<Date | null>(null);
  const [selectedTimeBlock, setSelectedTimeBlock] = useState('');
  const [needSpecificTime, setNeedSpecificTime] = useState(false);
  const [budget, setBudget] = useState('');

  const { myTask, updateMyTask } = useCreateTaskStore();

  // Initialize with existing data from store
  useEffect(() => {
    // Initialize dates
    if (myTask.date) {
      const existingDate = new Date(myTask.date);
      setOnTimeDate(existingDate);
      setBeforeDate(existingDate);
      setSelectedOption('on_time');
    } else {
      const today = new Date();
      const todayDate = new Date(today);
      const futureDateFor5Days = new Date(today);
      futureDateFor5Days.setDate(today.getDate() + 5);
      
      setOnTimeDate(todayDate);
      setBeforeDate(futureDateFor5Days);
    }

    // Initialize time selection
    if (myTask.time) {
      setSelectedTimeBlock(myTask.time);
      setNeedSpecificTime(true);
    }

    // Initialize budget
    if (myTask.budget && myTask.budget > 0) {
      setBudget(myTask.budget.toString());
    }
  }, [myTask.date, myTask.time, myTask.budget]);

  const handleDateChange = (
    event: DateTimePickerEvent,
    date?: Date | undefined
  ): void => {
    setShowDatePicker(false);
    if (date) {
      if (activePickerOption === 'on_time') {
        setOnTimeDate(date);
      } else if (activePickerOption === 'before') {
        setBeforeDate(date);
      }
    }
    setActivePickerOption('');
  };

  const handleKeyPress = (value: string) => {
    if (value === 'delete') {
      setBudget(budget.slice(0, -1));
    } else {
      setBudget(budget + value);
    }
  };

  const renderKey = (value: string | number) => (
    <TouchableOpacity
      key={value}
      style={styles.key}
      onPress={() => handleKeyPress(value.toString())}
    >
      {value === 'delete' ? (
        <Ionicons name="backspace-outline" size={24} color="#002366" />
      ) : (
        <Text style={styles.keyText}>{value}</Text>
      )}
    </TouchableOpacity>
  );

  const numberPad = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [null, 0, 'delete'],
  ];

  const timeBlocks = [
    { 
      label: 'Morning', 
      value: 'morning', 
      description: 'before 12 pm', 
      icon: require('@/assets/icons/rooster.png') 
    },
    { 
      label: 'Afternoon', 
      value: 'afternoon', 
      description: '12pm to 5 pm', 
      icon: require('@/assets/icons/hat.png') 
    },
    { 
      label: 'Evening', 
      value: 'evening', 
      description: 'After 5pm', 
      icon: require('@/assets/icons/tea.png') 
    },
    { 
      label: 'Late night', 
      value: 'late_night', 
      description: 'After 9pm', 
      icon: require('@/assets/icons/owl.png') 
    },
  ];

  const options = [
    { label: 'On Time', value: 'on_time' },
    { label: 'Before', value: 'before' },
    { label: 'Flexible', value: 'no_rush' }
  ];

  const isBudgetValid = budget && Number(budget) >= 20;
  const isFormValid = selectedOption !== '' && isBudgetValid;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ChevronLeft size={24} color="#333" />
      </TouchableOpacity>
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>When & Budget</Text>
        <Text style={styles.subtitle}>When do you need this done and what's your budget?</Text>

        {/* Date/Time Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          {options.map((option) => (
            <View key={option.value}>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => {
                  setSelectedOption(option.value);
                }}
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
                  onPress={() => {
                    setActivePickerOption('on_time');
                    setShowDatePicker(true);
                  }} 
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
                  onPress={() => {
                    setActivePickerOption('before');
                    setShowDatePicker(true);
                  }} 
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

        {/* Time Toggle */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleText}>I need certain time of day</Text>
          <Switch
            value={needSpecificTime}
            onValueChange={setNeedSpecificTime}
            trackColor={{ false: '#E5E5EA', true: '#0057FF' }}
            thumbColor={needSpecificTime ? '#FFFFFF' : '#FFFFFF'}
            ios_backgroundColor="#E5E5EA"
          />
        </View>

        {/* Time of Day Grid */}
        {needSpecificTime && (
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
                <View style={styles.iconContainer}>
                  <Image source={block.icon} style={styles.timeIcon} />
                </View>
                <Text style={styles.gridTitle}>{block.label}</Text>
                <Text style={styles.gridDescription}>{block.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Budget Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget</Text>
          <Text style={styles.sectionSubtitle}>
            Minimum budget is $20. You can negotiate the final price later
          </Text>

          {/* Budget Display */}
          <View style={styles.inputBox}>
            <Text style={styles.currencySymbol}>$</Text>
            <Text style={[
              styles.budgetText, 
              budget && Number(budget) < 20 && Number(budget) > 0 && styles.invalidBudgetText
            ]}>
              {budget || '0'}
            </Text>
          </View>
          
          {/* Validation Message */}
          {budget && Number(budget) < 20 && Number(budget) > 0 && (
            <Text style={styles.validationText}>
              Minimum budget is $20
            </Text>
          )}

          {/* Keypad */}
          <View style={styles.keypad}>
            {numberPad.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((value) => value !== null ? renderKey(value) : <View key="empty" style={{ width: 70, height: 70, marginHorizontal: 10 }} />)}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.continueButton, !isFormValid && styles.continueButtonDisabled]}
        disabled={!isFormValid}
        onPress={() => {
          const selectedDate = selectedOption === 'on_time' ? onTimeDate : 
                              selectedOption === 'before' ? beforeDate : null;
          
          updateMyTask({
            date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
            time: selectedTimeBlock ? selectedTimeBlock : '',
            budget: Number(budget),
          });
          router.push('/detail-screen');
        }}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={
            activePickerOption === 'on_time' 
              ? (onTimeDate || new Date()) 
              : activePickerOption === 'before'
              ? (beforeDate || new Date())
              : new Date()
          }
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
    paddingTop: 50,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    color: '#1C1C1E',
    marginTop: 36,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 24,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 20,
  },
  toggleText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 12,
    marginVertical: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  gridItemSelected: {
    borderColor: '#FF6A00',
    backgroundColor: '#FFF4E6',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  timeIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  gridDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  inputBox: {
    marginTop: 10,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#002366',
    marginRight: 5,
  },
  budgetText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#002366',
  },
  invalidBudgetText: {
    color: '#FF3B30',
  },
  validationText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
    fontWeight: '500',
  },
  keypad: {
    marginTop: 10,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  key: {
    width: 70,
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  keyText: {
    fontSize: 22,
    color: '#002366',
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
  continueButtonDisabled: {
    backgroundColor: '#D1D1D6',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});