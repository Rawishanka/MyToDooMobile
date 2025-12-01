import { useGetServiceFeeConfig, useUpdateServiceFeeConfig } from '@/src/shared/hooks/usePaymentApi';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

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
      setBasePercentage((configData.config.BASE_PERCENTAGE * 100).toString());
      setMinFeeUsd(configData.config.MIN_FEE_USD.toString());
      setMaxFeeUsd(configData.config.MAX_FEE_USD.toString());
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
      setBasePercentage((configData.config.BASE_PERCENTAGE * 100).toString());
      setMinFeeUsd(configData.config.MIN_FEE_USD.toString());
      setMaxFeeUsd(configData.config.MAX_FEE_USD.toString());
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackToAccount}>
          <Ionicons name="chevron-back" size={24} color="#0052A2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Fee Configuration</Text>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0052A2" />
            <Text style={styles.loadingText}>Loading configuration...</Text>
          </View>
        ) : error && (error as any)?.message?.includes('Admin access required') ? (
          <View style={styles.errorContainer}>
            <Ionicons name="lock-closed" size={48} color="#FF6B35" />
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
            <Ionicons name="alert-circle-outline" size={48} color="#FF6B35" />
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
              <Ionicons name="information-circle-outline" size={20} color="#0052A2" />
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
                    <ActivityIndicator size="small" color="#FFF" />
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#0052A2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#0052A2',
    marginLeft: 8,
    lineHeight: 18,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  currentConfigBox: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  configLabel: {
    fontSize: 14,
    color: '#666',
  },
  configValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0052A2',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resetButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#0052A2',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  currencyBox: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  currencyLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  currencyValue: {
    fontSize: 13,
    color: '#333',
  },
});

export default ServiceFeeConfigScreen;
