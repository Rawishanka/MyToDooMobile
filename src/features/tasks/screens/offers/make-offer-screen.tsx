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
import {
    ErrorState,
    LoadingState,
    OfferForm,
    OfferFormHeader,
    TaskSummarySection,
    TipsSection,
} from './components';
import { useOfferSubmission } from './hooks/useOfferSubmission';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MakeOfferScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  
  const {
    data: taskData,
    isLoading,
    error,
  } = useGetTaskById(taskId!);

  const task = taskData?.data;

  const insets = useSafeAreaInsets();
  const scrollRef = React.useRef<ScrollView>(null);

  const {
    offerAmount,
    message,
    isSubmitting,
    isLoadingOffers,
    userHasExistingOffer,
    currencySymbol,
    validationError,
    taskBudget,
    setMessage,
    handleOfferAmountChange,
    handleOfferAmountFocus,
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={{ flex: 1 }}>
        <OfferFormHeader />

        <ScrollView
          ref={scrollRef}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <TaskSummarySection task={task} />

          <OfferForm
            offerAmount={offerAmount}
            message={message}
            currencySymbol={currencySymbol}
            budget={taskBudget}
            validationError={validationError}
            onAmountChange={handleOfferAmountChange}
            onAmountFocus={handleOfferAmountFocus}
            onMessageFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}
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

        <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
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
                    ? 'Checking Previous Offers...' 
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
    paddingHorizontal: 20,
  },
  warningContainer: {
    backgroundColor: '#FFF3CD',
    borderWidth: 2,
    borderColor: '#FFC107',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  warningText: {
    color: '#856404',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
