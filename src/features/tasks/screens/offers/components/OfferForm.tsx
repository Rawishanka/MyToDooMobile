import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface OfferFormProps {
  offerAmount: string;
  message: string;
  onAmountChange: (text: string) => void;
  onMessageChange: (text: string) => void;
}

export const OfferForm: React.FC<OfferFormProps> = ({
  offerAmount,
  message,
  onAmountChange,
  onMessageChange,
}) => {
  return (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Your Offer</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Offer Amount *</Text>
        <View style={styles.amountInputContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="Enter your offer amount"
            keyboardType="decimal-pad"
            value={offerAmount}
            onChangeText={onAmountChange}
            placeholderTextColor="#999"
          />
        </View>
        <Text style={styles.inputHint}>
          Enter a competitive amount based on the task budget
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Your Message *</Text>
        <TextInput
          style={styles.messageInput}
          placeholder="Why are you the best person for this task?"
          multiline
          numberOfLines={5}
          value={message}
          onChangeText={onMessageChange}
          placeholderTextColor="#999"
          textAlignVertical="top"
        />
        <Text style={styles.inputHint}>
          Explain your relevant experience and approach (min. 10 characters)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  currencySymbol: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#666',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  amountInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000',
    minHeight: 100,
    backgroundColor: '#fff',
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
