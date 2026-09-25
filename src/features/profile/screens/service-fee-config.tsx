import { useGetServiceFeeConfig, useUpdateServiceFeeConfig } from '@/src/shared/hooks/usePaymentApi';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { BlueBackdrop, IconChip, LightHeader } from '@/src/shared/components/custom_components/lightCard';

interface ServiceFeeConfigScreenProps {
  onBackToAccount: () => void;
}

const ServiceFeeConfigScreen: React.FC<ServiceFeeConfigScreenProps> = ({ onBackToAccount }) => {
  // API hooks
  const { data: configData, isLoading, error, refetch } = useGetServiceFeeConfig(true);
  const updateConfigMutation = useUpdateServiceFeeConfig();

  // Form state
  const [basePercentage, setBasePercentage] = useState<string>('');
  const [minFeeUsd, setMinFeeUsd] = useState<string>('');
  const [maxFeeUsd, setMaxFeeUsd] = useState<string>('');

  // Populate form when config data is loaded
  useEffect(() => {
    if (configData?.config) {
      // Add null checks and default values to prevent toString() errors
      const basePercentageValue = configData.config.BASE_PERCENTAGE ?? 0.1; // Default 10%
      const minFeeValue = configData.config.MIN_FEE_USD ?? 5; // Default $5
      const maxFeeValue = configData.config.MAX_FEE_USD ?? 50; // Default $50
      
      setBasePercentage((basePercentageValue * 100).toString());
      setMinFeeUsd(minFeeValue.toString());
      setMaxFeeUsd(maxFeeValue.toString());
    }
  }, [configData]);

  const handleSave = async () => {
    // Validate inputs
    const percentage = parseFloat(basePercentage);
    const minFee = parseFloat(minFeeUsd);
    const maxFee = parseFloat(maxFeeUsd);

    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      Alert.alert('Invalid Input', 'Base percentage must be between 0 and 100.');
      return;
    }

    if (isNaN(minFee) || minFee < 0) {
      Alert.alert('Invalid Input', 'Minimum fee must be a positive number.');
      return;
    }

    if (isNaN(maxFee) || maxFee < 0) {
      Alert.alert('Invalid Input', 'Maximum fee must be a positive number.');
      return;
    }

    if (minFee > maxFee) {
      Alert.alert('Invalid Input', 'Minimum fee cannot be greater than maximum fee.');
      return;
    }

    try {
      await updateConfigMutation.mutateAsync({
        BASE_PERCENTAGE: percentage / 100, // Convert back to decimal
        MIN_FEE_USD: minFee,
        MAX_FEE_USD: maxFee,
      });

      Alert.alert(
        'Success',
        'Service fee configuration has been updated successfully.',
        [{ text: 'OK', onPress: () => refetch() }]
      );
    } catch (err: any) {
      Alert.alert(
        'Update Failed',
        err.message || 'Failed to update service fee configuration. Please try again.'
      );
    }
  };

  const handleReset = () => {
    if (configData?.config) {
      // Add null checks and default values to prevent toString() errors
      const basePercentageValue = configData.config.BASE_PERCENTAGE ?? 0.1; // Default 10%
      const minFeeValue = configData.config.MIN_FEE_USD ?? 5; // Default $5
      const maxFeeValue = configData.config.MAX_FEE_USD ?? 50; // Default $50
      
      setBasePercentage((basePercentageValue * 100).toString());
      setMinFeeUsd(minFeeValue.toString());
      setMaxFeeUsd(maxFeeValue.toString());
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
    <View style={styles.container}>
      <BlueBackdrop />
      <LightHeader title="Service Fee Configuration" onBack={onBackToAccount} />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading configuration...</Text>
          </View>
        ) : error && (error as any)?.message?.includes('Admin access required') ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorCircle}><Ionicons name="lock-closed" size={36} color="#FBBF24" /></View>
            <Text style={styles.errorTitle}>Admin Access Required</Text>
            <Text style={styles.errorText}>
              This feature is only available to administrators. Service fee configuration requires elevated permissions.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={onBackToAccount}>
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorCircle}><Ionicons name="alert-circle-outline" size={38} color="#FCA5A5" /></View>
            <Text style={styles.errorTitle}>Failed to Load Configuration</Text>
            <Text style={styles.errorText}>
              {(error as any)?.message || 'Unable to fetch service fee configuration.'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Info Box */}
            <View style={styles.infoBox}>
              <IconChip name="information-circle-outline" style={{ marginRight: 12 }} />
              <Text style={styles.infoText}>
                Configure the service fee settings that apply to all transactions on the platform.
              </Text>
            </View>

            {/* Current Configuration Display */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Settings</Text>
              <View style={styles.currentConfigBox}>
                <View style={styles.configRow}>
                  <Text style={styles.configLabel}>Base Percentage:</Text>
                  <Text style={styles.configValue}>
                    {((configData?.config?.BASE_PERCENTAGE || 0) * 100).toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.configRow}>
                  <Text style={styles.configLabel}>Minimum Fee (USD):</Text>
                  <Text style={styles.configValue}>
                    ${configData?.config?.MIN_FEE_USD?.toFixed(2) || '0.00'}
                  </Text>
                </View>
                <View style={styles.configRow}>
                  <Text style={styles.configLabel}>Maximum Fee (USD):</Text>
                  <Text style={styles.configValue}>
                    ${configData?.config?.MAX_FEE_USD?.toFixed(2) || '0.00'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Update Form */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Update Configuration</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Base Percentage (%)</Text>
                <TextInput
                  style={styles.input}
                  value={basePercentage}
                  onChangeText={setBasePercentage}
                  placeholder="Enter percentage (e.g., 10 for 10%)"
                  placeholderTextColor="#94A3B8"
                  keyboardType="decimal-pad"
                  editable={!updateConfigMutation.isPending}
                />
                <Text style={styles.helperText}>
                  The base percentage fee applied to transactions
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Minimum Fee (USD)</Text>
                <TextInput
                  style={styles.input}
                  value={minFeeUsd}
                  onChangeText={setMinFeeUsd}
                  placeholder="Enter minimum fee (e.g., 5.00)"
                  placeholderTextColor="#94A3B8"
                  keyboardType="decimal-pad"
                  editable={!updateConfigMutation.isPending}
                />
                <Text style={styles.helperText}>
                  The minimum service fee charged in USD
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Maximum Fee (USD)</Text>
                <TextInput
                  style={styles.input}
                  value={maxFeeUsd}
                  onChangeText={setMaxFeeUsd}
                  placeholder="Enter maximum fee (e.g., 50.00)"
                  placeholderTextColor="#94A3B8"
                  keyboardType="decimal-pad"
                  editable={!updateConfigMutation.isPending}
                />
                <Text style={styles.helperText}>
                  The maximum service fee charged in USD
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.resetButton]}
                  onPress={handleReset}
                  disabled={updateConfigMutation.isPending}
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.saveButton, updateConfigMutation.isPending && styles.buttonDisabled]}
                  onPress={handleSave}
                  disabled={updateConfigMutation.isPending}
                >
                  {updateConfigMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Currency Rates Info */}
            {configData?.config?.CURRENCY_RATES && Object.keys(configData.config.CURRENCY_RATES).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Currency Conversion Rates</Text>
                <View style={styles.currencyBox}>
                  {Object.entries(configData.config.CURRENCY_RATES).map(([currency, rate]) => (
                    <View key={currency} style={styles.currencyRow}>
                      <Text style={styles.currencyLabel}>{currency}:</Text>
                      <Text style={styles.currencyValue}>{rate}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.helperText}>
                  Currency rates are automatically updated by the system
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const CARD = {
  backgroundColor: 'rgba(255,255,255,0.10)',
  borderRadius: 20,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.18)',
  shadowColor: '#00114D',
  shadowOpacity: 0.25,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
} as const;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003399',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  errorCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 28,
    height: 48,
    justifyContent: 'center',
    borderRadius: 14,
    shadowColor: '#ff6b35',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  infoBox: {
    ...CARD,
    flexDirection: 'row',
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 19,
  },
  section: {
    ...CARD,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  currentConfigBox: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  configLabel: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
    flexShrink: 1,
    marginRight: 8,
  },
  configValue: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    fontSize: RFValue(14),
    color: '#0F172A',
  },
  helperText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#ff6b35',
    shadowColor: '#ff6b35',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  currencyBox: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    marginBottom: 8,
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  currencyLabel: {
    fontSize: RFValue(13),
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },
  currencyValue: {
    fontSize: RFValue(13),
    color: '#FFFFFF',
  },
});

export default ServiceFeeConfigScreen;
