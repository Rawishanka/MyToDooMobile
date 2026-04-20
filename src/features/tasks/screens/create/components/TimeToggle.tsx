import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

interface TimeToggleProps {
  needSpecificTime: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
}

export const TimeToggle: React.FC<TimeToggleProps> = ({ needSpecificTime, onToggle, disabled = false }) => {
  return (
    <View style={[styles.toggleRow, disabled && styles.toggleRowDisabled]}>
      <Text style={[styles.toggleText, disabled && styles.toggleTextDisabled]}>
        I need certain time of day
      </Text>
      <Switch
        value={needSpecificTime}
        onValueChange={disabled ? undefined : onToggle}
        trackColor={{ 
          false: disabled ? '#F2F2F7' : '#E5E5EA', 
          true: disabled ? '#D1D1D6' : '#0057FF' 
        }}
        thumbColor={disabled ? '#8E8E93' : '#FFFFFF'}
        ios_backgroundColor={disabled ? '#F2F2F7' : '#E5E5EA'}
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
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 20,
  },
  toggleText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  toggleRowDisabled: {
    opacity: 0.5,
    backgroundColor: '#F2F2F7',
  },
  toggleTextDisabled: {
    color: '#8E8E93',
  },
});
