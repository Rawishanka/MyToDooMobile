import { formatNumber } from '@/src/shared/utils/currency';
import * as PaymentAPI from '@/src/api/payment-api';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';

interface OfferFormProps {
  offerAmount: string;
  message: string;
  currencySymbol: string;
  budget?: number;
  currency?: string;
  validationError?: string;
  messageError?: string;
  onAmountChange: (text: string) => void;
  onMessageChange: (text: string) => void;
  onAmountFocus?: () => void;
  onMessageFocus?: () => void;
}

interface FeePreview {
  posterServiceFee?: number;
  taskerCommission?: number;
  taskerNetReceives?: number;
  posterTotalToPay?: number;
}

export const OfferForm: React.FC<OfferFormProps> = ({
  offerAmount,
  message,
  currencySymbol,
  budget,
  currency = 'AUD',
  validationError,
  messageError,
  onAmountChange,
  onMessageChange,
  onAmountFocus,
  onMessageFocus,
}) => {
  const [feePreview, setFeePreview] = useState<FeePreview | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);

  useEffect(() => {
    const amount = parseFloat(String(offerAmount).replace(/,/g, ''));
    if (!amount || amount <= 0 || Number.isNaN(amount)) {
      setFeePreview(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setFeeLoading(true);
      try {
        let preview: FeePreview | null = null;
        try {
          try {
            const res = await PaymentAPI.calculateFeePreview({ amount, currency });
            preview = {
              posterServiceFee: res?.posterServiceFee ?? res?.breakdown?.poster?.serviceFee,
              taskerCommission: res?.taskerCommission ?? res?.breakdown?.tasker?.commission,
              taskerNetReceives: res?.taskerNetReceives ?? res?.breakdown?.tasker?.netReceives,
              posterTotalToPay: res?.posterTotalToPay ?? res?.breakdown?.poster?.totalToPay,
            };
          } catch {
            const res = await PaymentAPI.calculateServiceFee({
              amount,
              currency,
            });
            const data = (res as any)?.data || res;
            preview = {
              posterServiceFee: data?.posterServiceFee ?? data?.calculation?.serviceFee ?? data?.breakdown?.poster?.serviceFee,
              taskerCommission: data?.taskerCommission ?? data?.breakdown?.tasker?.commission,
              taskerNetReceives: data?.taskerNetReceives ?? data?.breakdown?.tasker?.netReceives,
              posterTotalToPay: data?.posterTotalToPay ?? data?.breakdown?.poster?.totalToPay,
            };
          }
        } catch {
          preview = {
            posterServiceFee: Math.round(amount * 0.1 * 100) / 100,
            taskerCommission: Math.round(amount * 0.1 * 100) / 100,
            taskerNetReceives: Math.round(amount * 0.9 * 100) / 100,
            posterTotalToPay: Math.round(amount * 1.1 * 100) / 100,
          };
        }
        if (!cancelled) setFeePreview(preview);
      } finally {
        if (!cancelled) setFeeLoading(false);
      }
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [offerAmount, currency]);

  return (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Your Offer</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Offer Amount * {budget && `(Budget: ${currencySymbol}${formatNumber(budget, { forceDecimals: true })})`}
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
            Enter amount up to the task budget ({currencySymbol}{budget ? formatNumber(budget, { forceDecimals: true }) : '0.00'})
          </Text>
        )}
        {(feeLoading || feePreview) && (
          <View style={styles.feePreviewBox}>
            {feeLoading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <>
                <Text style={styles.feePreviewTitle}>Estimated platform fees</Text>
                {feePreview?.taskerCommission != null && (
                  <Text style={styles.feePreviewLine}>
                    Est. tasker fee: {currencySymbol}
                    {formatNumber(feePreview.taskerCommission, { forceDecimals: true })}
                  </Text>
                )}
                {feePreview?.taskerNetReceives != null && (
                  <Text style={styles.feePreviewLine}>
                    Est. you receive: {currencySymbol}
                    {formatNumber(feePreview.taskerNetReceives, { forceDecimals: true })}
                  </Text>
                )}
                {feePreview?.posterServiceFee != null && (
                  <Text style={styles.feePreviewHint}>
                    Poster also pays ~{currencySymbol}
                    {formatNumber(feePreview.posterServiceFee, { forceDecimals: true })} service fee
                  </Text>
                )}
              </>
            )}
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Your Message *</Text>
        <TextInput
          style={[styles.messageInput, messageError ? styles.errorBorder : undefined]}
          placeholder="Why are you the best person for this task?"
          multiline
          numberOfLines={5}
          value={message}
          onChangeText={onMessageChange}
          onFocus={onMessageFocus}
          placeholderTextColor="#999"
          textAlignVertical="top"
        />
        {messageError ? (
          <Text style={styles.errorText}>{messageError}</Text>
        ) : (
          <Text style={styles.inputHint}>
            Explain your relevant experience and approach (min. 10 characters)
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: RFValue(16),
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
    fontSize: RFValue(16),
    color: '#666',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  amountInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
    fontSize: RFValue(16),
    color: '#000',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: RFValue(15),
    minHeight: 120,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputHint: {
    marginTop: 6,
    fontSize: RFValue(12),
    color: '#888',
  },
  errorText: {
    marginTop: 6,
    fontSize: RFValue(12),
    color: '#dc3545',
  },
  errorBorder: {
    borderColor: '#dc3545',
  },
  feePreviewBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#cfe2ff',
  },
  feePreviewTitle: {
    fontSize: RFValue(13),
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 4,
  },
  feePreviewLine: {
    fontSize: RFValue(12),
    color: '#1e3a8a',
    marginTop: 2,
  },
  feePreviewHint: {
    fontSize: RFValue(11),
    color: '#64748b',
    marginTop: 6,
  },
});
