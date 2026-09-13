import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';

interface MovingToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const MovingToggle: React.FC<MovingToggleProps> = ({ value, onValueChange }) => {
  return (
    <View style={styles.switchBox}>
      <Text style={styles.switchLabel}>Hey! are you moving?</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
};

const styles = StyleSheet.create({
  switchBox: {
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: RFValue(16),
    color: '#333',
  },
});
