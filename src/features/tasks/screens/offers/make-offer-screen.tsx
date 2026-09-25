import { useGetTaskById } from '@/src/shared/hooks/useTaskApi';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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
      {!isDarkMode && (
        <LinearGradient
          pointerEvents="none"
          colors={[BRAND_BLUE, '#00287A']}
          style={StyleSheet.absoluteFill}
        />
      )}
      
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
              <ActivityIndicator size="small" color="#FFFFFF" />
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
    backgroundColor: BRAND_BLUE,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  warningContainer: {
    backgroundColor: 'rgba(251,191,36,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.55)',
    borderRadius: 14,
    padding: 16,
    marginTop: 0,
    marginBottom: 16,
  },
  warningText: {
    color: '#FEF3C7',
    fontSize: RFValue(15),
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    backgroundColor: BRAND_BLUE,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.25)',
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
    backgroundColor: 'rgba(255,255,255,0.22)',
    opacity: 0.8,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
