import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LocationData {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface SimpleLocationInputProps {
  onSelect: (location: LocationData) => void;
  placeholder?: string;
  style?: any;
}

export const SimpleLocationInput: React.FC<SimpleLocationInputProps> = ({
  onSelect,
  placeholder = "Enter suburb or address...",
  style,
}) => {
  const [address, setAddress] = useState('');

  const handleSubmit = () => {
    if (address.trim().length < 3) {
      Alert.alert('Invalid Address', 'Please enter a valid suburb or address (minimum 3 characters)');
      return;
    }

    // Create a basic location object with the entered address
    // For now, we'll use default coordinates (you can enhance this later)
    const locationData: LocationData = {
      address: address.trim(),
      coordinates: {
        lat: -33.8688, // Default to Sydney coordinates
        lng: 151.2093,
      },
    };

    onSelect(locationData);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <Ionicons name="location-outline" size={20} color="#aaa" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder={placeholder}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
        {address.length > 0 && (
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Ionicons name="checkmark" size={20} color="#0057FF" />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.helperText}>
        Enter your suburb or full address and tap the checkmark
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    height: 45,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  submitButton: {
    padding: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 12,
  },
});