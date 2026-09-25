import { formatNumber } from '@/src/shared/utils/currency';
import * as PaymentAPI from '@/src/api/payment-api';
import { HS, homeCard } from '@/src/shared/theme/homeStyle';
import React, { useEffect, useState } from 'react';
import { useTheme } from '@/src/shared/theme';
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
  const { isDarkMode } = useTheme();
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
    <View style={[styles.formContainer, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155', shadowOpacity: 0, elevation: 0 }]}>
      <Text style={[styles.sectionTitle, isDarkMode && { color: "#F8FAFC" }]}>Your Offer</Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, !isDarkMode && styles.inputLabelLight, isDarkMode && { color: "#F8FAFC" }]}>
          Offer Amount * {budget && `(Budget: ${currencySymbol}${formatNumber(budget, { forceDecimals: true })})`}
        </Text>
        <View style={[
          styles.amountInputContainer,
          isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' },
          validationError ? [styles.errorBorder, isDarkMode && { borderColor: '#FCA5A5' }] : undefined
        ]}>
          <Text style={[styles.currencySymbol, isDarkMode && { backgroundColor: "#1E293B", color: "#94A3B8" }]}>{currencySymbol}</Text>
          <TextInput
            style={[styles.amountInput, isDarkMode && { color: "#F8FAFC" }]}
            placeholder={budget ? budget.toString() : "Enter your offer amount"}
            keyboardType="decimal-pad"
            value={offerAmount}
            onChangeText={onAmountChange}
            onFocus={onAmountFocus}
            placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
          />
        </View>
        {validationError ? (
          <Text style={[styles.errorText, isDarkMode && { color: '#FCA5A5' }]}>{validationError}</Text>
        ) : (
          <Text style={[styles.inputHint, isDarkMode && { color: "#94A3B8" }]}>
            Enter amount up to the task budget ({currencySymbol}{budget ? formatNumber(budget, { forceDecimals: true }) : '0.00'})
          </Text>
        )}
        {(feeLoading || feePreview) && (
          <View style={[styles.feePreviewBox, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#334155" }]}>
            {feeLoading ? (
              <ActivityIndicator size="small" color={isDarkMode ? '#FFFFFF' : HS.blue} />
            ) : (
              <>
                <Text style={[styles.feePreviewTitle, isDarkMode && { color: "#38BDF8" }]}>As you type</Text>
                {feePreview?.taskerCommission != null && (
                  <View style={styles.feeRow}>
                    <Text style={[styles.feePreviewLine, isDarkMode && { color: "#94A3B8" }]}>Service fee</Text>
                    <Text style={[styles.feePreviewLine, isDarkMode && { color: "#94A3B8" }]}>
                      −{currencySymbol}
                      {formatNumber(feePreview.taskerCommission, { forceDecimals: true })}
                    </Text>
                  </View>
                )}
                {feePreview?.taskerNetReceives != null && (
                  <View style={styles.feeRow}>
                    <Text style={[styles.feeReceiveLabel, isDarkMode && { color: "#38BDF8" }]}>You'll receive</Text>
                    <Text style={[styles.feeReceiveValue, !isDarkMode && { color: HS.greenText }]}>
                      {currencySymbol}
                      {formatNumber(feePreview.taskerNetReceives, { forceDecimals: true })}
                    </Text>
                  </View>
                )}
                {feePreview?.posterServiceFee != null && (
                  <Text style={[styles.feePreviewHint, isDarkMode && { color: "#64748B" }]}>
                    The poster also pays a {currencySymbol}
                    {formatNumber(feePreview.posterServiceFee, { forceDecimals: true })} service fee
                  </Text>
                )}
              </>
            )}
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, !isDarkMode && styles.inputLabelLight, isDarkMode && { color: "#F8FAFC" }]}>Your Message *</Text>
        <TextInput
          style={[
            styles.messageInput,
            isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
            messageError ? [styles.errorBorder, isDarkMode && { borderColor: '#FCA5A5' }] : undefined
          ]}
          placeholder="Why are you the best person for this task?"
          multiline
          numberOfLines={5}
          value={message}
          onChangeText={onMessageChange}
          onFocus={onMessageFocus}
          placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
          textAlignVertical="top"
        />
        {messageError ? (
          <Text style={[styles.errorText, isDarkMode && { color: '#FCA5A5' }]}>{messageError}</Text>
        ) : (
          <Text style={[styles.inputHint, isDarkMode && { color: "#94A3B8" }]}>
            Explain your relevant experience and approach (min. 10 characters)
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    marginTop: 16,
    marginBottom: 16,
    padding: 18,
    ...homeCard,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: HS.navy,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: HS.navy,
    marginBottom: 8,
  },
  inputLabelLight: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
    textTransform: 'none',
    color: HS.navy,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: HS.inputBorder,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  currencySymbol: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    fontWeight: '700',
    color: HS.blue,
    backgroundColor: HS.tint,
  },
  amountInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 15,
    fontSize: 17,
    fontWeight: '600',
    color: HS.navy,
  },
  messageInput: {
    borderWidth: 1.5,
    borderColor: HS.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    color: HS.navy,
  },
  inputHint: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
    color: HS.muted,
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: HS.redText,
    fontWeight: '600',
  },
  errorBorder: {
    borderColor: '#DC2626',
  },
  feePreviewBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: HS.tint,
    borderWidth: 1,
    borderColor: HS.tintBorder,
  },
  feePreviewTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: HS.navy,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  feePreviewLine: {
    fontSize: RFValue(13),
    color: HS.text,
  },
  feeReceiveLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: HS.navy,
  },
  feeReceiveValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#4ADE80',
  },
  feePreviewHint: {
    fontSize: RFValue(11),
    color: HS.muted,
    marginTop: 10,
  },
});
