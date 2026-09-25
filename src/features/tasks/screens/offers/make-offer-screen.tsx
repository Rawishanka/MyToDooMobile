import { useGetTaskById } from '@/src/shared/hooks/useTaskApi';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/shared/theme';
import {
    ErrorState,
    LoadingState,
    OfferForm,
    OfferFormHeader,
    TaskSummarySection,
    TipsSection,
} from './components';
import { useOfferSubmission } from './hooks/useOfferSubmission';
import { RFValue } from '@/src/shared/utils/responsive';
import { BRAND_BLUE, BRAND_ORANGE } from '@/src/shared/theme/brandColors';

export default function MakeOfferScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  
  const {
    data: taskData,
    isLoading,
    error,
  } = useGetTaskById(taskId!);

  const task = taskData?.data;

  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const scrollRef = React.useRef<ScrollView>(null);

  const {
    offerAmount,
    message,
    isSubmitting,
    isLoadingOffers,
    userHasExistingOffer,
    currencySymbol,
    validationError,
    messageError,
    taskBudget,
    setMessage,
    handleOfferAmountChange,
    handleOfferAmountFocus,
    handleMessageFocus,
    handleSubmitOffer,
  } = useOfferSubmission({ 
    taskId: taskId!,
    taskBudget: task?.budget,
    taskLocation: task?.location
  });

  // Debug logging for button state
  console.log('🔧 [MakeOfferScreen] Button State:', {
    isSubmitting,
    isLoadingOffers,
    userHasExistingOffer,
    buttonDisabled: isSubmitting || userHasExistingOffer || isLoadingOffers,
    taskId: taskId
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error.message || 'Failed to load task details'} />;
  }

  if (!task) {
    return <ErrorState error="Task not found" />;
  }

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: "#0B1120" }]}>
      <StatusBar barStyle="light-content" backgroundColor={isDarkMode ? "#0B1120" : BRAND_BLUE} />
      
      <View style={{ flex: 1 }}>
        <OfferFormHeader />

        <ScrollView
          ref={scrollRef}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
        >
          <TaskSummarySection task={task} />

          <OfferForm
            offerAmount={offerAmount}
            message={message}
            currencySymbol={currencySymbol}
            budget={taskBudget}
            validationError={validationError}
            messageError={messageError}
            onAmountChange={handleOfferAmountChange}
            onAmountFocus={handleOfferAmountFocus}
            onMessageFocus={() => {
              handleMessageFocus();
              scrollRef.current?.scrollToEnd({ animated: true });
            }}
            onMessageChange={setMessage}
          />

          <TipsSection />
          
          {/* Show message if user already has an offer */}
          {userHasExistingOffer && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ⚠️ You have already submitted an offer for this task. Only one offer per task is allowed.
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={[styles.buttonContainer, isDarkMode && { backgroundColor: "#0B1120", borderTopColor: "#334155" }, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <TouchableOpacity
            style={[
              styles.submitButton, 
              (isSubmitting || userHasExistingOffer || isLoadingOffers || !!validationError) && styles.disabledButton
            ]}
            onPress={userHasExistingOffer ? undefined : handleSubmitOffer}
            disabled={isSubmitting || userHasExistingOffer || isLoadingOffers || !!validationError}
          >
            {isSubmitting || isLoadingOffers ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {userHasExistingOffer 
                  ? 'Already Offer Submitted' 
                  : isLoadingOffers
                    ? 'Loading...' 
                    : 'Submit Offer'
                }
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  warningContainer: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFC107',
    borderRadius: 14,
    padding: 16,
    marginTop: 0,
    marginBottom: 16,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  warningText: {
    color: '#856404',
    fontSize: RFValue(15),
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#CBD5E1',
  },
  submitButton: {
    backgroundColor: BRAND_ORANGE,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
