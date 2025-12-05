import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

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
        <Ionicons name="location-outline" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          placeholder="Enter postal code"
          placeholderTextColor="#999"
          value={pickupCode}
          onChangeText={onPickupChange}
          style={styles.input}
        />
      </View>

      {/* Drop-off */}
      <Text style={styles.label}>Drop-off Location</Text>
      <View style={styles.inputBox}>
        <Ionicons name="location-outline" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          placeholder="Enter postal code"
          placeholderTextColor="#999"
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
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    marginTop: 10,
  },
  inputBox: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    height: 45,
    marginBottom: 10,
  },
  icon: {
    marginRight: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
});
