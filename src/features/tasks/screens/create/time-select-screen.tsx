import { useCreateTaskStore } from '@/src/store/create-task-store';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BudgetKeypad,
  DateOptionSelector,
  TimeOfDayGrid,
  TimeToggle,
} from './components';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';

const TimeSelectScreen = () => {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedOption, setSelectedOption] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activePickerOption, setActivePickerOption] = useState('');
  const [tempDate, setTempDate] = useState<Date>(new Date());
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
    if (Platform.OS === 'android') {
      // Android: apply immediately on change
      setShowDatePicker(false);
      if (date) {
        if (activePickerOption === 'on_time') setOnTimeDate(date);
        else if (activePickerOption === 'before') setBeforeDate(date);
      }
      setActivePickerOption('');
    } else {
      // iOS spinner: just update temp state while user scrolls
      if (date) setTempDate(date);
    }
  };

  const handleIOSDone = () => {
    if (activePickerOption === 'on_time') setOnTimeDate(tempDate);
    else if (activePickerOption === 'before') setBeforeDate(tempDate);
    setShowDatePicker(false);
    setActivePickerOption('');
  };

  const handleIOSCancel = () => {
    setShowDatePicker(false);
    setActivePickerOption('');
  };

  const handleKeyPress = (value: string) => {
    if (value === 'delete') {
      setBudget(budget.slice(0, -1));
    } else {
      setBudget(budget + value);
    }
  };

  const handleOpenPicker = (pickerType: string) => {
    const seed =
      pickerType === 'on_time'
        ? onTimeDate || new Date()
        : pickerType === 'before'
        ? beforeDate || new Date()
        : new Date();
    setTempDate(seed);
    setActivePickerOption(pickerType);
    setShowDatePicker(true);
  };

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
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={isDarkMode ? "#F8FAFC" : "#333"} />
      </TouchableOpacity>
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>When & Budget</Text>
        <Text style={styles.subtitle}>When do you need this done and what's your budget?</Text>

        {/* Date/Time Options */}
        <DateOptionSelector
          options={options}
          selectedOption={selectedOption}
          onSelectOption={setSelectedOption}
          onTimeDate={onTimeDate}
          beforeDate={beforeDate}
          onOpenPicker={handleOpenPicker}
        />

        {/* Time Toggle */}
        <TimeToggle
          needSpecificTime={needSpecificTime}
          onToggle={setNeedSpecificTime}
        />

        {/* Time of Day Grid */}
        {needSpecificTime && (
          <TimeOfDayGrid
            timeBlocks={timeBlocks}
            selectedTimeBlock={selectedTimeBlock}
            onSelectTimeBlock={setSelectedTimeBlock}
          />
        )}

        {/* Budget Section */}
        <BudgetKeypad
          budget={budget}
          onKeyPress={handleKeyPress}
        />
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

      {/* ── Date Picker ── iOS: proper Modal bottom-sheet / Android: default */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="none"
          onRequestClose={handleIOSCancel}
        >
          {/* Full-screen wrapper: overlay tap area + sheet at bottom */}
          <View style={styles.modalWrapper}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={handleIOSCancel}
            />
            <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + 8 }]}>
              {/* Toolbar */}
              <View style={styles.pickerToolbar}>
                <TouchableOpacity onPress={handleIOSCancel} style={styles.pickerToolbarBtn}>
                  <Text style={styles.pickerCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.pickerTitle}>Select Date</Text>
                <TouchableOpacity onPress={handleIOSDone} style={styles.pickerToolbarBtn}>
                  <Text style={styles.pickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              {/* Wheel picker */}
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
                style={styles.iosPicker}
                textColor="#1C1C1E"
              />
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={
              activePickerOption === 'on_time'
                ? (onTimeDate || new Date())
                : activePickerOption === 'before'
                ? (beforeDate || new Date())
                : new Date()
            }
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )
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
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: RFValue(24),
    fontWeight: '700',
    marginBottom: 4,
    color: '#1C1C1E',
    marginTop: 36,
  },
  subtitle: {
    fontSize: RFValue(14),
    color: '#8E8E93',
    marginBottom: 24,
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
    fontSize: RFValue(16),
    fontWeight: '600',
  },

  // ── iOS Date Picker Modal bottom-sheet ──
  modalWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalOverlay: {
    flex: 1,
  },
  pickerSheet: {
    backgroundColor: '#F2F2F7',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  pickerToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C7C7CC',
    backgroundColor: '#F2F2F7',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  pickerToolbarBtn: {
    minWidth: 60,
  },
  pickerTitle: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#1C1C1E',
  },
  pickerCancelText: {
    fontSize: RFValue(16),
    color: '#8E8E93',
  },
  pickerDoneText: {
    fontSize: RFValue(16),
    color: '#0057FF',
    fontWeight: '600',
    textAlign: 'right',
  },
  iosPicker: {
    height: 220,
    backgroundColor: '#F2F2F7',
  },
});