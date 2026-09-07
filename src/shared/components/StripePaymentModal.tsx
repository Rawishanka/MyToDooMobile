import { StripeProvider, usePaymentSheet } from '@stripe/stripe-react-native';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    View
} from 'react-native';
import API_CONFIG from '../../api/config';
import * as PaymentAPI from '../../api/payment-api';
import { useAuthStore } from '../../store/auth-task-store';
import { useCreatePaymentIntent } from '../hooks/usePaymentApi';
import { useAcceptOffer } from '../hooks/useTaskApi';
import { RFValue } from '@/src/shared/utils/responsive';

interface StripePaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskId: string;
  offerId: string;
  offerAmount: number;
  currency?: string;
  taskTitle: string;
  taskCategory?: string; // Added taskCategory prop
  /** Optional: ask backend to offset eligible poster fees with promo credits */
  useCredits?: boolean;
  offerDetails?: {
    description?: string;
    taskerName?: string;
    estimatedDuration?: string;
  };
}

// AUSTRALIA-ONLY: Only Australia supported for billing
const COUNTRIES = [
  { label: 'Australia', value: 'AU' },
];

// Helper function to map currency to country code for billing
// AUSTRALIA-ONLY: Default to Australia (AUD)
const getCurrencyCountryCode = (currencyCode: string): string => {
  const currencyCountryMap: Record<string, string> = {
    'AUD': 'AU', // Australia - Primary currency
    'USD': 'AU', // Map USD to Australia (will be converted)
    'NZD': 'AU', // Map NZD to Australia (will be converted)
  };
  return currencyCountryMap[currencyCode] || 'AU'; // Default to Australia
};

const PaymentForm: React.FC<StripePaymentModalProps> = ({
  visible,
  onClose,
  onSuccess,
  taskId,
  offerId,
  offerAmount,
  currency = 'AUD',
  taskTitle,
  taskCategory,
  offerDetails,
  useCredits = false,
}) => {
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  
  // State management
  const [isProcessing, setIsProcessing] = useState(false);
  const [escrowAgreed, setEscrowAgreed] = useState(false);
  const [paymentIntentData, setPaymentIntentData] = useState<any>(null);
  const [isPaymentSheetReady, setIsPaymentSheetReady] = useState(false);
  
  // API hooks
  const createPaymentIntent = useCreatePaymentIntent();
  const acceptOfferMutation = useAcceptOffer();
  
  // Get current user from auth store
  const currentUser = useAuthStore((state: any) => state.user);
  
  // ALWAYS use backend payment intent data for consistency between display and actual charge
  const getServiceFeeData = () => {
    const normalized = PaymentAPI.normalizePaymentBreakdown(paymentIntentData?.breakdown);
    if (normalized) {
      console.log('✅ Using backend breakdown data (this is what Stripe will charge):', normalized);
      return normalized;
    }

    console.log('⏳ Waiting for backend service fee calculation...');
    return {
      budgetAmount: offerAmount,
      serviceFee: 0,
      posterConnectionFee: 0,
      posterConnectionFeeTax: 0,
      connectionFeeDisplayName: 'Connection Fee',
      taskerConnectionFee: 0,
      taskerCommission: 0,
      taskerWillReceive: offerAmount,
      totalAmount: offerAmount,
      currency: currency,
    };
  };

  // Make fee calculation reactive to paymentIntentData changes
  const feeCalculation = useMemo(() => {
    const result = getServiceFeeData();
    console.log('🔢 Fee calculation updated:', {
      hasBackendData: !!paymentIntentData?.breakdown,
      budgetAmount: result.budgetAmount,
      serviceFee: result.serviceFee,
      totalAmount: result.totalAmount,
      source: paymentIntentData?.breakdown ? 'BACKEND' : 'FALLBACK'
    });
    return result;
  }, [paymentIntentData, offerAmount, currency]);

  // Initialize Payment Sheet and immediately present it when modal opens
  useEffect(() => {
    if (visible) {
      initializeAndPresentPaymentSheet();
    }
  }, [visible]);

  const initializeAndPresentPaymentSheet = async () => {
    setIsProcessing(true);
    try {
      console.log('💳 Starting payment process:', { 
        taskId, 
        offerId, 
        offerAmount, 
        currency
      });
      
      // STEP 1: Calculate service fee using the new endpoint (with fallback)
      console.log('📊 Step 1: Calculating service fee...');
      let serviceFeeResult;
      try {
        serviceFeeResult = await PaymentAPI.calculateServiceFee({
          amount: offerAmount,
          currency: currency || 'AUD',
        });

        console.log('✅ Service fee calculated:', {
          budgetAmount: serviceFeeResult.calculation.budgetAmount,
          serviceFee: serviceFeeResult.calculation.serviceFee,
          totalAmount: serviceFeeResult.calculation.totalAmount,
          currency: serviceFeeResult.calculation.currency
        });
      } catch (feeError: any) {
        // If service fee calculation fails completely, log it but continue
        // The backend payment intent will handle fee calculation as backup
        console.log('ℹ️ Service fee pre-calculation unavailable, backend will calculate:', feeError.message);
      }

      // STEP 2: Create payment intent with the calculated amounts
      console.log('💳 Step 2: Creating payment intent...');
      const paymentResult = await createPaymentIntent.mutateAsync({
        taskId,
        offerId,
        amount: offerAmount,
        currency: currency || 'AUD',
        ...(useCredits ? { useCredits: true } : {}),
      });

      if (!paymentResult.success || !paymentResult.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      console.log('✅ Payment intent created:', PaymentAPI.normalizePaymentBreakdown(paymentResult.breakdown));
      
      setPaymentIntentData(paymentResult);

      const billingCountry = getCurrencyCountryCode(currency || 'AUD');
      console.log('🌍 Setting billing country:', billingCountry, 'for currency:', currency);

      // Initialize the Payment Sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'MyToDoo',
        paymentIntentClientSecret: paymentResult.clientSecret,
        defaultBillingDetails: {
          address: {
            country: billingCountry,
          },
        },
        allowsDelayedPaymentMethods: false,
        returnURL: 'mytodoo://payment-return',
        // Apple Pay (iOS only — native builds)
        applePay: {
          merchantCountryCode: 'AU',
        },
        // Google Pay (Android only — native builds / APK)
        // testEnv: true  → test keys (pk_test_...) — no real money charged, Google Pay TEST UI shown
        // testEnv: false → live keys (pk_live_...) — real payments
        // IMPORTANT: currencyCode MUST be UPPERCASE ISO 4217 (e.g. "AUD" not "aud")
        // IMPORTANT: Device must have Google Wallet app with at least one card added
        googlePay: {
          merchantCountryCode: 'AU',
          testEnv: (API_CONFIG.STRIPE.PUBLISHABLE_KEY || '').startsWith('pk_test_'),
          currencyCode: (currency || 'AUD').toUpperCase(),
          label: 'MyToDoo Payment',
        },
      });

      if (initError) {
        console.error('❌ Payment Sheet initialization failed:', initError);
        throw new Error(initError.message);
      }

      console.log('✅ Payment Sheet initialized, presenting now...');
      
      // Immediately present the payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          console.log('ℹ️ User canceled payment');
          onClose();
          return;
        }
        throw new Error(presentError.message);
      }

      // Payment succeeded
      console.log('✅ Payment succeeded!');
      Alert.alert(
        'Payment Successful! 🎉',
        'Your payment has been processed. The task will be assigned shortly.',
        [{
          text: 'View My Tasks',
          onPress: () => {
            onSuccess();
            router.push({
              pathname: '/(tabs)/my-tasks' as any,
              params: { role: 'Poster', tab: 'Todo' }
            });
          }
        }]
      );
    } catch (error: any) {
      console.log('❌ Payment Sheet initialization error:', {
        message: error.message,
        code: error.code || 'Unknown',
        name: error.name || 'Unknown',
        currency: currency,
        billingCountry: getCurrencyCountryCode(currency || 'AUD')
      });
      
      // Handle specific backend endpoint errors
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        Alert.alert(
          'Payment Service Setup', 
          'Payment service is being configured. Please contact support or try again later.',
          [
            { text: 'Close', onPress: onClose },
            { text: 'Use Direct Payment', onPress: () => handleDirectOfferAcceptance() }
          ]
        );
      } else if (error.message?.includes('500') || error.message?.includes('Internal Server Error')) {
        Alert.alert(
          'Payment Service Error', 
          `Payment service encountered an error. This may be a backend configuration issue.\n\nCurrency: ${currency}\nPlease contact support if this persists.`,
          [
            { text: 'Close', onPress: onClose },
            { text: 'Retry', onPress: initializeAndPresentPaymentSheet },
            { text: 'Accept Without Payment', onPress: () => handleDirectOfferAcceptance() }
          ]
        );
      } else if (error.message?.includes('temporarily unavailable')) {
        Alert.alert(
          'Payment Service Unavailable', 
          `The payment service is currently unavailable for ${currency} payments.\n\nIf you're in Australia/NZ, this may be a backend Stripe configuration issue. Please contact support.`,
          [
            { text: 'Close', onPress: onClose },
            { text: 'Retry', onPress: initializeAndPresentPaymentSheet },
            { text: 'Contact Support', onPress: () => {
              // You can add support contact functionality here
              onClose();
            }}
          ]
        );
      } else if (error.message?.includes('Authentication')) {
        Alert.alert(
          'Authentication Required', 
          'Please login again to continue with payment.',
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        Alert.alert(
          'Setup Error', 
          'Failed to setup payment. Please check your connection and try again.',
          [
            { text: 'Close', onPress: onClose },
            { text: 'Retry', onPress: initializeAndPresentPaymentSheet }
          ]
        );
      }
    }
  };

  const handleDirectOfferAcceptance = async () => {
    try {
      console.log('🚀 Direct offer acceptance (bypassing payment):', { taskId, offerId });
      
      if (!currentUser?._id) {
        Alert.alert('Authentication Required', 'Please login to continue.');
        return;
      }

      setIsProcessing(true);
      
      const acceptResult = await acceptOfferMutation.mutateAsync({
        taskId,
        offerId,
        userId: currentUser._id,
        taskCategory
      });
      
      console.log('✅ Offer accepted directly:', acceptResult);
      Alert.alert(
        'Success! 🎉', 
        'The offer has been accepted successfully!',
        [{ 
          text: 'OK', 
          onPress: () => {
            onSuccess();
            // Navigate to My Tasks → Poster → Accepted tab
            router.push({
              pathname: '/(tabs)/my-tasks' as any,
              params: { role: 'Poster', tab: 'Accepted' }
            });
          }
        }]
      );
      
    } catch (error: any) {
      console.log('❌ Failed to accept offer directly:', {
        message: error.message,
        code: error.code || 'Unknown'
      });
      Alert.alert(
        'Error',
        'Failed to accept offer. Please try again or contact support.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Payment is now handled immediately in initializeAndPresentPaymentSheet

  // Show minimal loading UI - Stripe sheet will open immediately
  return (
    <View style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285f4" />
        <Text style={styles.loadingText}>Preparing secure payment...</Text>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: RFValue(16),
    color: '#666',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 34,
  },
  taskInfoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  taskerName: {
    fontSize: RFValue(14),
    color: '#666',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: RFValue(14),
    color: '#374151',
    lineHeight: 20,
  },
  paymentSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: RFValue(14),
    color: '#666',
  },
  summaryValue: {
    fontSize: RFValue(14),
    fontWeight: '500',
    color: '#000',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#4285f4',
  },
  backendDataInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4285f4',
  },
  backendDataLabel: {
    fontSize: RFValue(12),
    fontWeight: '600',
    color: '#4285f4',
    marginBottom: 4,
  },
  backendDataText: {
    fontSize: RFValue(11),
    color: '#666',
  },
  termsSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  termsTitle: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  termsBullet: {
    fontSize: RFValue(12),
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#4285f4',
    borderColor: '#4285f4',
  },
  checkboxText: {
    flex: 1,
    fontSize: RFValue(12),
    color: '#666',
    lineHeight: 18,
  },
  linkText: {
    color: '#4285f4',
    textDecorationLine: 'underline',
  },
  securityInfo: {
    marginBottom: 20,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  securityText: {
    flex: 1,
    fontSize: RFValue(12),
    color: '#666',
    lineHeight: 18,
    marginLeft: 8,
  },
  payButton: {
    backgroundColor: '#9CA3AF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonActive: {
    backgroundColor: '#4285f4',
  },
  payButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payButtonIcon: {
    marginRight: 8,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4285f4',
    backgroundColor: 'transparent',
  },
  retryIcon: {
    marginRight: 8,
  },
  retryButtonText: {
    color: '#4285f4',
    fontSize: RFValue(14),
    fontWeight: '600',
  },
});

const StripePaymentModal: React.FC<StripePaymentModalProps> = ({ visible, ...props }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={props.onClose}
    >
      <StripeProvider
        publishableKey={API_CONFIG.STRIPE.PUBLISHABLE_KEY || ''}
        merchantIdentifier="merchant.com.mytodoo.mytodoolive"
        urlScheme="mytodoo"
      >
        <PaymentForm visible={visible} {...props} />
      </StripeProvider>
    </Modal>
  );
};

export default StripePaymentModal;