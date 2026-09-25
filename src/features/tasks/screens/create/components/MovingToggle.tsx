import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';
import { FLOW } from '../flowTheme';

interface MovingToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const MovingToggle: React.FC<MovingToggleProps> = ({ value, onValueChange }) => {
  const { isDarkMode } = useTheme();
  return (
    <View style={[styles.switchBox, isDarkMode && { backgroundColor: 'rgba(255,255,255,0.16)', borderColor: 'rgba(255,255,255,0.18)' }]}>
      <Text style={[styles.switchLabel, isDarkMode && { color: '#FFFFFF' }]}>Hey! are you moving?</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#CBD5E1', true: FLOW.orange }} thumbColor="#FFFFFF" />
    </View>
  );
};

const styles = StyleSheet.create({
  switchBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: FLOW.inputBorder,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: RFValue(16),
    color: FLOW.navy,
  },
});
