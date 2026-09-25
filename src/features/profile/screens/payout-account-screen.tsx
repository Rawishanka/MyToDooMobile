import { useTheme } from '@/src/shared/theme';
import { getAbnStatus, isAbnRequiredError, type TaskerAbnStatus } from '@/src/api/abn-api';
import TaskerAbnSection from '@/src/features/profile/components/TaskerAbnSection';
import {
    useCreateStripeAccount,
    useDeleteStripeAccount,
    useGetStripeAccountLink,
    useGetStripeAccountStatus,
} from '@/src/shared/hooks/useStripeConnectApi';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { WebView } from 'react-native-webview';
import { RFValue } from '@/src/shared/utils/responsive';

const PayoutAccountScreen = ({ navigation }: any) => {
  const { isDarkMode } = useTheme();
  const [showWebView, setShowWebView] = useState(false);
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null);
  const [abnStatus, setAbnStatus] = useState<TaskerAbnStatus | null>(null);
  const [loadingAbn, setLoadingAbn] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const status = await getAbnStatus();
        if (mounted) setAbnStatus(status);
      } catch (err) {
        console.warn('Failed to load ABN status for payout screen:', err);
      } finally {
        if (mounted) setLoadingAbn(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const abnVerified = !!abnStatus?.abnVerified;

  // API Hooks
  const { data: accountStatus, isLoading, error, refetch } = useGetStripeAccountStatus();
  const createAccount = useCreateStripeAccount();
  const getAccountLink = useGetStripeAccountLink();
  const deleteAccount = useDeleteStripeAccount();

  // Return URL for Stripe onboarding
  const returnUrl = 'https://mytodoo.com/stripe-onboarding/return';
  const refreshUrl = 'https://mytodoo.com/stripe-onboarding/refresh';

  // Check if account exists
  const hasAccount = accountStatus && !error;
  const accountNotFound = error?.status === 404;

  // Handle create account
  const handleCreateAccount = async () => {
    if (!abnVerified) {
      Alert.alert('ABN Required', 'Please verify your ABN first.');
      return;
    }
    try {
      // Step 1: Create Stripe Connect account
      console.log('🔑 Creating Stripe Connect account...');
      const result = await createAccount.mutateAsync();
      console.log('✅ Account created:', result);

      // Step 2: Get onboarding link
      console.log('🔗 Getting onboarding link with URLs:', { returnUrl, refreshUrl });
      const url = await getAccountLink.mutateAsync({ returnUrl, refreshUrl });
      console.log('✅ Got onboarding URL:', url);
      
      // Step 3: Open WebView with onboarding URL
      setOnboardingUrl(url);
      setShowWebView(true);
    } catch (err: any) {
      console.error('❌ Create account flow error:', {
        message: err.message,
        status: err.status,
        details: err.details,
      });
      
      if (err?.status === 400) {
        Alert.alert(
          'Account Exists',
          'You already have a payout account. Refreshing status...',
          [{ text: 'OK', onPress: () => refetch() }]
        );
      } else if (err?.status === 401) {
        Alert.alert(
          'Authentication Error',
          'Your session has expired. Please log in again.',
          [{ text: 'OK' }]
        );
      } else if (isAbnRequiredError(err)) {
        Alert.alert(
          'ABN Required',
          err?.message || 'An Australian Business Number (ABN) is required before setting up payouts.',
          [{ text: 'OK' }]
        );
      } else if (err?.status === 500) {
        Alert.alert(
          'Server Error',
          'Unable to connect to payment service. Please try again later.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          err?.message || 'Failed to setup payout account. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  // Handle refresh onboarding link
  const handleRefreshOnboarding = async () => {
    if (!abnVerified) {
      Alert.alert('ABN Required', 'Please verify your ABN first.');
      return;
    }
    try {
      console.log('🔄 Refreshing onboarding link...');
      const url = await getAccountLink.mutateAsync({ returnUrl, refreshUrl });
      console.log('✅ Got new onboarding URL:', url);
      setOnboardingUrl(url);
      setShowWebView(true);
    } catch (err: any) {
      console.error('❌ Refresh onboarding error:', {
        message: err.message,
        status: err.status,
        details: err.details,
      });
      
      if (err?.status === 404) {
        Alert.alert(
          'No Account Found',
          'Please create a payout account first.',
          [{ text: 'OK' }]
        );
      } else if (err?.status === 401) {
        Alert.alert(
          'Authentication Error',
          'Your session has expired. Please log in again.',
          [{ text: 'OK' }]
        );
      } else if (isAbnRequiredError(err)) {
        Alert.alert(
          'ABN Required',
          err?.message || 'An Australian Business Number (ABN) is required before setting up payouts.',
          [{ text: 'OK' }]
        );
      } else if (err?.status === 500) {
        Alert.alert(
          'Server Error',
          'Unable to connect to payment service. Please try again later.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          err?.message || 'Failed to get onboarding link. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Payout Account',
      'Are you sure you want to delete your payout account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount.mutateAsync();
              Alert.alert('Success', 'Payout account deleted successfully');
              refetch();
            } catch (err: any) {
              console.error('Delete account error:', err);
              Alert.alert('Error', err?.message || 'Failed to delete payout account');
            }
          },
        },
      ]
    );
  };

  // Handle WebView navigation
  const handleWebViewNavigationStateChange = (navState: any) => {
    const { url } = navState;

    // Check if user completed onboarding
    if (url.includes('stripe-onboarding/return')) {
      setShowWebView(false);
      setOnboardingUrl(null);
      
      // Refresh account status
      setTimeout(() => {
        refetch();
      }, 1000);

      Alert.alert('Success', 'Payout account setup completed!');
    }

    // Check if user needs to refresh
    if (url.includes('stripe-onboarding/refresh')) {
      setShowWebView(false);
      setOnboardingUrl(null);
      handleRefreshOnboarding();
    }
  };

  // Get status badge color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return '#22c55e';
      case 'pending':
        return '#f59e0b';
      case 'restricted':
        return '#ef4444';
      case 'disabled':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  // Get status display text
  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending Verification';
      case 'restricted':
        return 'Restricted';
      case 'disabled':
        return 'Disabled';
      default:
        return 'Unknown';
    }
  };

  // Show WebView if onboarding
  if (showWebView && onboardingUrl) {
    return (
      <View style={[styles.container, isDarkMode && { backgroundColor: "#0B1120" }]}>
        <View style={[styles.header, isDarkMode && { backgroundColor: "#0B1120", borderBottomColor: "#334155" }]}>
          <TouchableOpacity
            onPress={() => {
              setShowWebView(false);
              setOnboardingUrl(null);
            }}
            style={styles.backButton}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Setup Payout Account</Text>
        </View>
        <WebView
          source={{ uri: onboardingUrl }}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6200ee" />
              <Text style={styles.loadingText}>Loading Stripe...</Text>
            </View>
          )}
        />
      </View>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, isDarkMode && { backgroundColor: "#0B1120" }]}>
        <View style={[styles.header, isDarkMode && { backgroundColor: "#0B1120", borderBottomColor: "#334155" }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#F8FAFC" : "#000"} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDarkMode && { color: "#F8FAFC" }]}>Payout Account</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading account status...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: "#0B1120" }]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && { backgroundColor: "#0B1120", borderBottomColor: "#334155" }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#F8FAFC" : "#000"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && { color: "#F8FAFC" }]}>Payout Account</Text>
      </View>

      <View style={styles.content}>
        <TaskerAbnSection
          onVerified={(status) => setAbnStatus(status)}
        />

        {!loadingAbn && !abnVerified && (
          <View style={styles.abnGateCard}>
            <Ionicons name="information-circle-outline" size={20} color="#b45309" />
            <Text style={styles.abnGateText}>
              Verify your ABN above before setting up payouts.
            </Text>
          </View>
        )}

        {/* No Account */}
        {accountNotFound && (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Payout Account</Text>
            <Text style={styles.emptyDescription}>
              Setup your payout account to receive payments for completed tasks.
            </Text>
            <Text style={styles.emptyInfo}>
              You'll need your Australian bank details (BSB and Account Number).
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, !abnVerified && styles.primaryButtonDisabled]}
              onPress={handleCreateAccount}
              disabled={!abnVerified || createAccount.isPending || getAccountLink.isPending}
            >
              {createAccount.isPending || getAccountLink.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Add Payout Account</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Has Account */}
        {hasAccount && accountStatus && (
          <View style={styles.accountContainer}>
            {/* Status Card */}
            <View style={[styles.statusCard, isDarkMode && { backgroundColor: "#1E293B", borderWidth: 1, borderColor: "#334155" }]}>
              <View style={styles.statusHeader}>
                <Text style={[styles.statusLabel, isDarkMode && { color: "#F8FAFC" }]}>Account Status</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(accountStatus.status) },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {getStatusText(accountStatus.status)}
                  </Text>
                </View>
              </View>

              {/* Account Details */}
              {accountStatus.detailsSubmitted && (
                <View style={styles.detailRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                  <Text style={[styles.detailText, isDarkMode && { color: "#F8FAFC" }]}>Details Submitted</Text>
                </View>
              )}

              {accountStatus.chargesEnabled && (
                <View style={styles.detailRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                  <Text style={[styles.detailText, isDarkMode && { color: "#F8FAFC" }]}>Charges Enabled</Text>
                </View>
              )}

              {accountStatus.payoutsEnabled && (
                <View style={styles.detailRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                  <Text style={[styles.detailText, isDarkMode && { color: "#F8FAFC" }]}>Payouts Enabled</Text>
                </View>
              )}

              {/* Account ID */}
              {accountStatus.accountId && (
                <View style={[styles.accountIdContainer, isDarkMode && { borderTopColor: "#334155" }]}>
                  <Text style={[styles.accountIdLabel, isDarkMode && { color: "#94A3B8" }]}>Account ID</Text>
                  <Text style={styles.accountIdText}>{accountStatus.accountId}</Text>
                </View>
              )}
            </View>

            {/* Info Messages */}
            {accountStatus.status === 'pending' && (
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color="#f59e0b" />
                <Text style={styles.infoText}>
                  Your account is pending verification. This may take a few minutes.
                </Text>
              </View>
            )}

            {accountStatus.status === 'restricted' && (
              <View style={[styles.infoBox, styles.warningBox]}>
                <Ionicons name="warning" size={20} color="#ef4444" />
                <Text style={styles.warningText}>
                  Your account is restricted. Please complete the onboarding process.
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {/* Continue Onboarding */}
              {!accountStatus.detailsSubmitted && (
                <TouchableOpacity
                  style={[styles.primaryButton, !abnVerified && styles.primaryButtonDisabled]}
                  onPress={handleRefreshOnboarding}
                  disabled={!abnVerified || getAccountLink.isPending}
                >
                  {getAccountLink.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="arrow-forward-circle-outline" size={20} color="#fff" />
                      <Text style={styles.primaryButtonText}>Continue Setup</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* Refresh Status */}
              <TouchableOpacity
                style={[styles.secondaryButton, isDarkMode && { backgroundColor: "#1E293B", borderColor: "#38BDF8" }]}
                onPress={() => refetch()}
              >
                <Ionicons name="refresh-outline" size={20} color="#6200ee" />
                <Text style={styles.secondaryButtonText}>Refresh Status</Text>
              </TouchableOpacity>

              {/* Delete Account */}
              <TouchableOpacity
                style={[styles.dangerButton, isDarkMode && { backgroundColor: "#1E293B" }]}
                onPress={handleDeleteAccount}
                disabled={deleteAccount.isPending}
              >
                {deleteAccount.isPending ? (
                  <ActivityIndicator color="#ef4444" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    <Text style={styles.dangerButtonText}>Delete Account</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Payout Info */}
            <View style={[styles.payoutInfo, isDarkMode && { backgroundColor: "#0F172A", borderWidth: 1, borderColor: "#334155" }]}>
              <Text style={[styles.payoutInfoTitle, isDarkMode && { color: "#38BDF8" }]}>Payout Timeline</Text>
              <Text style={[styles.payoutInfoText, isDarkMode && { color: "#94A3B8" }]}>
                Payouts are processed within 3-5 business days for Australian bank accounts.
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    marginLeft: 12,
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: RFValue(14),
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: RFValue(22),
    fontWeight: '600',
    marginTop: 24,
    color: '#000',
  },
  emptyDescription: {
    fontSize: RFValue(14),
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyInfo: {
    fontSize: RFValue(12),
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200ee',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 32,
    minHeight: 48,
    gap: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  abnGateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  abnGateText: {
    flex: 1,
    fontSize: RFValue(13),
    color: '#92400e',
    lineHeight: 18,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
  accountContainer: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: RFValue(12),
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  detailText: {
    fontSize: RFValue(14),
    color: '#333',
  },
  accountIdContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  accountIdLabel: {
    fontSize: RFValue(12),
    color: '#666',
    marginBottom: 4,
  },
  accountIdText: {
    fontSize: RFValue(12),
    color: '#999',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: RFValue(13),
    color: '#92400e',
    lineHeight: 18,
  },
  warningBox: {
    backgroundColor: '#fee2e2',
  },
  warningText: {
    flex: 1,
    fontSize: RFValue(13),
    color: '#991b1b',
    lineHeight: 18,
  },
  actionButtons: {
    gap: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6200ee',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    minHeight: 48,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#6200ee',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    minHeight: 48,
    gap: 8,
  },
  dangerButtonText: {
    color: '#ef4444',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
  payoutInfo: {
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  payoutInfoTitle: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#075985',
    marginBottom: 4,
  },
  payoutInfoText: {
    fontSize: RFValue(12),
    color: '#0c4a6e',
    lineHeight: 16,
  },
});

export default PayoutAccountScreen;
