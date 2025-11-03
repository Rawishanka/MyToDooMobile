import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

interface TimeToggleProps {
  needSpecificTime: boolean;
  onToggle: (value: boolean) => void;
}

export const TimeToggle: React.FC<TimeToggleProps> = ({ needSpecificTime, onToggle }) => {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleText}>I need certain time of day</Text>
      <Switch
        value={needSpecificTime}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E5EA', true: '#0057FF' }}
        thumbColor={needSpecificTime ? '#FFFFFF' : '#FFFFFF'}
        ios_backgroundColor="#E5E5EA"
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
});
