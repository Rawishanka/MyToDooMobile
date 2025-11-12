import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface OfferFormProps {
  offerAmount: string;
  message: string;
  currencySymbol: string;
  budget?: number;
  validationError?: string;
  onAmountChange: (text: string) => void;
  onMessageChange: (text: string) => void;
  onAmountFocus?: () => void;
  onMessageFocus?: () => void;
}

export const OfferForm: React.FC<OfferFormProps> = ({
  offerAmount,
  message,
  currencySymbol,
  budget,
  validationError,
  onAmountChange,
  onMessageChange,
  onAmountFocus,
  onMessageFocus,
}) => {
  return (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Your Offer</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Offer Amount * {budget && `(Budget: ${currencySymbol}${budget})`}
        </Text>
        <View style={[styles.amountInputContainer, validationError ? styles.errorBorder : undefined]}>
          <Text style={styles.currencySymbol}>{currencySymbol}</Text>
          <TextInput
            style={styles.amountInput}
            placeholder={budget ? budget.toString() : "Enter your offer amount"}
            keyboardType="decimal-pad"
            value={offerAmount}
            onChangeText={onAmountChange}
            onFocus={onAmountFocus}
            placeholderTextColor="#999"
          />
        </View>
        {validationError ? (
          <Text style={styles.errorText}>{validationError}</Text>
        ) : (
          <Text style={styles.inputHint}>
            Enter amount up to the task budget ({currencySymbol}{budget || '0'})
          </Text>
        )}
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
          onFocus={onMessageFocus}
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
  errorBorder: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
    fontWeight: '500',
  },
});
