import { useTheme } from '@/src/shared/theme';
import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { FLOW } from '../flowTheme';

interface TimeToggleProps {
  needSpecificTime: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
}

export const TimeToggle: React.FC<TimeToggleProps> = ({ needSpecificTime, onToggle, disabled = false }) => {
  const { isDarkMode } = useTheme();
  return (
    <View style={[styles.toggleRow, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1 }, disabled && [styles.toggleRowDisabled, isDarkMode && { backgroundColor: '#0F172A' }]]}>
      <Text style={[styles.toggleText, isDarkMode && { color: '#F8FAFC' }, disabled && [styles.toggleTextDisabled, isDarkMode && { color: '#64748B' }]]}>
        I need certain time of day
      </Text>
      <Switch
        value={needSpecificTime}
        onValueChange={disabled ? undefined : onToggle}
        trackColor={{ 
          false: isDarkMode ? '#334155' : '#CBD5E1', 
          true: disabled ? '#D1D1D6' : FLOW.orange 
        }}
        thumbColor={disabled ? '#8E8E93' : '#FFFFFF'}
        ios_backgroundColor={isDarkMode ? '#334155' : '#CBD5E1'}
        disabled={disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: FLOW.inputBorder,
    marginBottom: 16,
  },
  toggleText: {
    fontSize: RFValue(16),
    color: FLOW.navy,
    fontWeight: '500',
  },
  toggleRowDisabled: {
    opacity: 0.6,
    backgroundColor: FLOW.tint,
  },
  toggleTextDisabled: {
    color: FLOW.muted,
  },
});
