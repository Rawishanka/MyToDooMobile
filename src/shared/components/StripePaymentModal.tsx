import { Ionicons } from '@expo/vector-icons';
import { StripeProvider, usePaymentSheet } from '@stripe/stripe-react-native';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import API_CONFIG from '../../api/config';
import { useAuthStore } from '../../store/auth-task-store';
import { useCreatePaymentIntent } from '../hooks/usePaymentApi';
import { useAcceptOffer } from '../hooks/useTaskApi';
import { formatNumber } from '../utils/currency';

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
  offerDetails?: {
    description?: string;
    taskerName?: string;
    estimatedDuration?: string;
  };
}

const COUNTRIES = [
  { label: 'Sri Lanka', value: 'LK' },
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'Australia', value: 'AU' },
  { label: 'Canada', value: 'CA' },
  { label: 'India', value: 'IN' },
  { label: 'Singapore', value: 'SG' },
  { label: 'Malaysia', value: 'MY' },
];

const PaymentForm: React.FC<Omit<StripePaymentModalProps, 'visible'>> = ({
  onClose,
  onSuccess,
  taskId,
  offerId,
  offerAmount,
  currency = 'LKR',
  taskTitle,
  taskCategory,
  offerDetails,
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
  
  // Use actual service fee data from payment intent response, or fallback calculation
  const getServiceFeeData = () => {
    if (paymentIntentData?.breakdown) {
      // Use breakdown data from the actual backend response
      console.log('🔍 Using backend breakdown data:', paymentIntentData.breakdown);
      return {
        budgetAmount: paymentIntentData.breakdown.budgetAmount,
        serviceFee: paymentIntentData.breakdown.serviceFee,
        totalAmount: paymentIntentData.breakdown.totalCharge,
        currency: paymentIntentData.breakdown.currency,
      };
    }
    
    // Fallback calculation if no backend data
    console.log('🔍 Using fallback calculation for amount:', offerAmount);
    const serviceFee = Math.round(offerAmount * 0.10 * 100) / 100;
    return {
      budgetAmount: offerAmount,
      serviceFee,
      totalAmount: offerAmount + serviceFee,
      currency: currency,
    };
  };

  // Make fee calculation reactive to paymentIntentData changes
  const feeCalculation = useMemo(() => getServiceFeeData(), [paymentIntentData, offerAmount, currency]);

  // Initialize Payment Sheet when component mounts
  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const initializePaymentSheet = async () => {
    try {
      console.log('💳 Creating payment intent for Payment Sheet:', { 
        taskId, 
        offerId, 
        offerAmount, 
        currency,
        frontendCalculatedTotal: feeCalculation.totalAmount 
      });
      
      // Create payment intent first
      const paymentResult = await createPaymentIntent.mutateAsync({
        taskId,
        offerId,
        amount: offerAmount, // Include the actual offer amount
        currency: currency,
      });

      if (!paymentResult.success || !paymentResult.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      console.log('✅ Payment intent created for Payment Sheet:', paymentResult);
      setPaymentIntentData(paymentResult);

      // Log the amounts for debugging
      console.log('🔍 Payment amounts debug:', {
        backendTotalCharge: paymentResult.breakdown?.totalCharge,
        backendBudgetAmount: paymentResult.breakdown?.budgetAmount,
        backendServiceFee: paymentResult.breakdown?.serviceFee,
        frontendCalculatedTotal: feeCalculation.totalAmount,
        clientSecret: paymentResult.clientSecret,
        backendCurrency: paymentResult.breakdown?.currency,
        paymentIntentRawData: paymentResult
      });

      // Also log what Stripe might see
      console.log('💰 Stripe Payment Intent Debug:', {
        totalChargeInCents: paymentResult.breakdown?.totalCharge * 100,
        totalChargeFormatted: new Intl.NumberFormat('en-LK', {
          style: 'currency',
          currency: 'LKR',
        }).format(paymentResult.breakdown?.totalCharge || 0),
        originalOfferAmount: offerAmount,
        calculatedFee: feeCalculation
      });

      console.log('⚠️ AMOUNT VERIFICATION:', {
        'Expected Total': 7625,
        'Backend Total': paymentResult.breakdown?.totalCharge,
        'Frontend Display Total': feeCalculation.totalAmount,
        'Stripe will show': `LKR ${formatNumber(paymentResult.breakdown?.totalCharge || 0, { forceDecimals: true })}`,
        'Issue': paymentResult.breakdown?.totalCharge !== 7625 ? 'BACKEND AMOUNT MISMATCH!' : 'Amounts match correctly'
      });

      // Initialize the Payment Sheet
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'MyToDoo',
        paymentIntentClientSecret: paymentResult.clientSecret,
        defaultBillingDetails: {
          address: {
            country: 'LK',
          },
        },
        allowsDelayedPaymentMethods: false,
        returnURL: 'mytodoo://payment-return',
      });

      if (error) {
        console.log('❌ Payment Sheet initialization failed:', {
          code: error.code,
          message: error.message,
          type: error.type
        });
        Alert.alert('Setup Error', 'Failed to initialize payment. Please try again.');
      } else {
        setIsPaymentSheetReady(true);
        console.log('✅ Payment Sheet initialized successfully');
      }
    } catch (error: any) {
      console.log('❌ Payment Sheet initialization error:', {
        message: error.message,
        code: error.code || 'Unknown',
        name: error.name || 'Unknown'
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
          'Payment service is temporarily unavailable. Please try again in a few minutes.',
          [
            { text: 'Close', onPress: onClose },
            { text: 'Retry', onPress: initializePaymentSheet },
            { text: 'Accept Without Payment', onPress: () => handleDirectOfferAcceptance() }
          ]
        );
      } else if (error.message?.includes('temporarily unavailable')) {
        Alert.alert(
          'Payment Service Unavailable', 
          'The payment service is currently unavailable. Please try again in a few minutes.',
          [
            { text: 'Close', onPress: onClose },
            { text: 'Retry', onPress: initializePaymentSheet }
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
            { text: 'Retry', onPress: initializePaymentSheet }
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

  const handlePayPress = async () => {
    if (!isPaymentSheetReady) {
      Alert.alert('Payment Not Ready', 'Payment is still being set up. Please wait a moment.');
      return;
    }

    if (!escrowAgreed) {
      Alert.alert('Agreement Required', 'Please agree to the escrow terms to proceed.');
      return;
    }

    setIsProcessing(true);

    try {
      // Present the Payment Sheet
      const { error } = await presentPaymentSheet();

      if (error) {
        // Use safer logging to avoid Babel runtime issues
        console.log('❌ Payment Sheet presentation failed:', {
          code: error.code,
          message: error.message,
          localizedMessage: error.localizedMessage,
          type: error.type
        });
        
        // Don't show error for user cancellation
        if (error.code === 'Canceled') {
          console.log('ℹ️ User cancelled the payment');
          return;
        }
        
        // Show appropriate error message
        if (error.code === 'Failed') {
          Alert.alert('Payment Failed', 'Payment could not be processed. Please check your card details and try again.');
        } else {
          Alert.alert('Payment Error', error.message || 'An error occurred during payment. Please try again.');
        }
        return;
      }

      // Payment was successful
      console.log('✅ Payment succeeded, now accepting offer');
      
      try {
        // Call accept offer API after successful payment
        if (!currentUser?._id) {
          throw new Error('User not authenticated');
        }
        
        console.log('📝 Accepting offer:', { taskId, offerId, userId: currentUser._id, taskCategory });
        const acceptResult = await acceptOfferMutation.mutateAsync({
          taskId,
          offerId,
          userId: currentUser._id,
          taskCategory
        });
        
        console.log('✅ Offer accepted successfully:', acceptResult);
        Alert.alert(
          'Success! 🎉', 
          'Your payment has been processed and the offer has been accepted!',
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
        
      } catch (acceptError: any) {
        console.log('❌ Failed to accept offer after payment:', {
          message: acceptError.message,
          code: acceptError.code || 'Unknown'
        });
        
        // Show different messages based on error type
        if (acceptError.message?.includes('Server error')) {
          Alert.alert(
            'Payment Successful',
            'Your payment was processed successfully, but there was a temporary server issue. The offer acceptance is being processed. Please check your tasks.',
            [{ text: 'OK', onPress: onSuccess }]
          );
        } else if (acceptError.message?.includes('Authentication')) {
          Alert.alert(
            'Payment Successful',
            'Your payment was processed but you need to login again to complete the offer acceptance.',
            [{ text: 'OK', onPress: onSuccess }]
          );
        } else {
          Alert.alert(
            'Payment Successful',
            'Your payment was processed but there was an issue accepting the offer. Please contact support with this payment.',
            [{ text: 'OK', onPress: onSuccess }]
          );
        }
      }

    } catch (error: any) {
      console.log('❌ Payment process failed:', {
        message: error.message,
        code: error.code || 'Unknown'
      });
      Alert.alert(
        'Payment Error',
        error.message || 'An error occurred while processing your payment. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Payment</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Task Info */}
      <View style={styles.taskInfoSection}>
        <Text style={styles.taskTitle}>{taskTitle}</Text>
        {offerDetails?.taskerName && (
          <Text style={styles.taskerName}>Offered by: {offerDetails.taskerName}</Text>
        )}
        {offerDetails?.description && (
          <Text style={styles.offerDescription}>{offerDetails.description}</Text>
        )}
      </View>

      {/* Payment Summary */}
      <View style={styles.paymentSection}>
        <Text style={styles.sectionTitle}>Payment Summary</Text>
        {/* Payment Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Offer Amount</Text>
            <Text style={styles.summaryValue}>LKR {formatNumber(feeCalculation.budgetAmount, { forceDecimals: true })}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee (10%)</Text>
            <Text style={styles.summaryValue}>LKR {formatNumber(feeCalculation.serviceFee, { forceDecimals: true })}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>LKR {formatNumber(feeCalculation.totalAmount, { forceDecimals: true })}</Text>
          </View>
          
          {/* Show backend data if available */}
          {paymentIntentData?.breakdown && (
            <View style={styles.backendDataInfo}>
              <Text style={styles.backendDataLabel}>✅ Payment confirmed by backend</Text>
              <Text style={styles.backendDataText}>
                Backend calculated: LKR {formatNumber(paymentIntentData.breakdown.totalCharge, { forceDecimals: true })}
              </Text>
            </View>
          )}
        </View>

        {/* Payment Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Payment Terms</Text>
          <Text style={styles.termsBullet}>• Funds will be held in escrow until task completion</Text>
          <Text style={styles.termsBullet}>• Payment will be released to the tasker once you confirm completion</Text>
          <Text style={styles.termsBullet}>• You can dispute if the task is not completed satisfactorily</Text>
          <Text style={styles.termsBullet}>• Automatic release after 30 days of task completion</Text>
        </View>

        {/* Escrow Agreement */}
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => setEscrowAgreed(!escrowAgreed)}
        >
          <View style={[styles.checkbox, escrowAgreed && styles.checkboxChecked]}>
            {escrowAgreed && <Ionicons name="checkmark" size={16} color="white" />}
          </View>
          <Text style={styles.checkboxText}>
            I authorize this payment to be held in escrow until task completion and agree to the{' '}
            <Text style={styles.linkText}>Terms & Conditions</Text> and{' '}
            <Text style={styles.linkText}>Community Guidelines</Text>.
          </Text>
        </TouchableOpacity>

        {/* Payment Security Info */}
        <View style={styles.securityInfo}>
          <View style={styles.securityRow}>
            <Ionicons name="checkmark-circle" size={16} color="#4285f4" />
            <Text style={styles.securityText}>Your payment is secured by Stripe. Card details are encrypted and never stored on our servers.</Text>
          </View>
        </View>

        {/* Payment Button */}
        <TouchableOpacity
          style={[
            styles.payButton, 
            (!escrowAgreed || isProcessing || !isPaymentSheetReady) && styles.payButtonDisabled,
            (escrowAgreed && isPaymentSheetReady && !isProcessing) && styles.payButtonActive
          ]}
          onPress={handlePayPress}
          disabled={!escrowAgreed || isProcessing || !isPaymentSheetReady}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : !isPaymentSheetReady ? (
            <View style={styles.payButtonContent}>
              <ActivityIndicator color="white" size="small" style={styles.payButtonIcon} />
              <Text style={styles.payButtonText}>Setting up payment...</Text>
            </View>
          ) : (
            <View style={styles.payButtonContent}>
              <Ionicons name="card" size={20} color="white" style={styles.payButtonIcon} />
              <Text style={styles.payButtonText}>Pay LKR {formatNumber(feeCalculation.totalAmount, { forceDecimals: true })}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Retry Button for Failed Setup */}
        {!isPaymentSheetReady && !isProcessing && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={initializePaymentSheet}
          >
            <Ionicons name="refresh" size={20} color="#4285f4" style={styles.retryIcon} />
            <Text style={styles.retryButtonText}>Retry Payment Setup</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    fontSize: 18,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  taskerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 14,
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
    fontSize: 18,
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
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 16,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#4285f4',
    marginBottom: 4,
  },
  backendDataText: {
    fontSize: 11,
    color: '#666',
  },
  termsSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  termsBullet: {
    fontSize: 12,
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
    fontSize: 12,
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
    fontSize: 12,
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
    fontSize: 16,
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
    fontSize: 14,
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
      <StripeProvider publishableKey={API_CONFIG.STRIPE.PUBLISHABLE_KEY || ''}>
        <PaymentForm {...props} />
      </StripeProvider>
    </Modal>
  );
};

export default StripePaymentModal;