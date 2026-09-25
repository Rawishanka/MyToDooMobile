import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { FLOW } from '../flowTheme';

interface MovingToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const MovingToggle: React.FC<MovingToggleProps> = ({ value, onValueChange }) => {
  return (
    <View style={styles.switchBox}>
      <Text style={styles.switchLabel}>Hey! are you moving?</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: 'rgba(255,255,255,0.28)', true: FLOW.orange }} thumbColor="#FFFFFF" />
    </View>
  );
};

const styles = StyleSheet.create({
  switchBox: {
    backgroundColor: FLOW.glassStrong,
    borderWidth: 1,
    borderColor: FLOW.glassBorder,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: RFValue(16),
    color: '#FFFFFF',
  },
});
