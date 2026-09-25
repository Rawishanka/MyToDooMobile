import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { FLOW } from '../flowTheme';

interface RemovalLocationInputsProps {
  pickupCode: string;
  dropoffCode: string;
  onPickupChange: (text: string) => void;
  onDropoffChange: (text: string) => void;
}

export const RemovalLocationInputs: React.FC<RemovalLocationInputsProps> = ({
  pickupCode,
  dropoffCode,
  onPickupChange,
  onDropoffChange,
}) => {
  return (
    <>
      {/* Pickup */}
      <Text style={styles.label}>Pickup Location</Text>
      <View style={styles.inputBox}>
        <Ionicons name="location-outline" size={20} color={FLOW.blue} style={styles.icon} />
        <TextInput
          placeholder="Enter postal code"
          placeholderTextColor={FLOW.placeholder}
          value={pickupCode}
          onChangeText={onPickupChange}
          style={styles.input}
        />
      </View>

      {/* Drop-off */}
      <Text style={styles.label}>Drop-off Location</Text>
      <View style={styles.inputBox}>
        <Ionicons name="location-outline" size={20} color={FLOW.blue} style={styles.icon} />
        <TextInput
          placeholder="Enter postal code"
          placeholderTextColor={FLOW.placeholder}
          value={dropoffCode}
          onChangeText={onDropoffChange}
          style={styles.input}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
    marginTop: 10,
  },
  inputBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    height: 50,
    marginBottom: 10,
  },
  icon: {
    marginRight: 16,
  },
  input: {
    flex: 1,
    fontSize: RFValue(16),
    color: FLOW.ink,
  },
});
