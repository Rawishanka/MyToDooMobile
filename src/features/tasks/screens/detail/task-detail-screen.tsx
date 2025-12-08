import { NetworkAlert } from '@/src/shared/components/NetworkAlert';
import { OfflineBanner } from '@/src/shared/components/OfflineBanner';
import { useNetworkStatus } from '@/src/shared/hooks/useNetworkStatus';
import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import StripePaymentModal from '../../../../shared/components/StripePaymentModal';

// Responsive utilities
import { isTablet, wp } from '@/src/shared/utils/responsive';
import {
    AskQuestionModal,
    DetailHeader,
    ErrorState,
    LoadingState,
    MakeOfferSection,
    MyOfferCard,
    OffersList,
    QuestionsList,
    TabsSection,
    TaskInfoCard,
} from './components';
import { useTaskDetail } from './hooks/useTaskDetail';

export default function TaskDetailScreen() {
  const { taskId, fromUserRole, fromStatus } = useLocalSearchParams<{ 
    taskId: string; 
    fromUserRole?: string; 
    fromStatus?: string; 
  }>();
  const scrollViewRef = useRef<ScrollView>(null);
  const tabsSectionRef = useRef<View>(null);
  
  // Network state
  const [showNetworkAlert, setShowNetworkAlert] = useState(false);
  // Network status is monitored by OfflineBanner component
  useNetworkStatus();
  
  // Check if user came from Tasker's Todoo Tasks or Completed tab
  // These are tasks where the current user is the assignee (tasker role)
  const isFromTaskerAssignedOrCompleted = 
    fromUserRole === 'Tasker' && (fromStatus === 'assigned' || fromStatus === 'completed');
  
  console.log('🔍 Task Detail Screen - Navigation Context:', {
    fromUserRole,
    fromStatus,
    isFromTaskerAssignedOrCompleted,
    shouldHideMakeOfferAndAskQuestion: isFromTaskerAssignedOrCompleted
  });

  const {
    task,
    taskOffers,
    myOffer,
    questions,
    isLoading,
    error,
    refetch,
    refetchQuestions,
    isLoadingTaskOffers,
    isLoadingQuestions,
    activeTab,
    setActiveTab,
    showAskQuestion,
    setShowAskQuestion,
    questionText,
    setQuestionText,
    handleMakeOffer,
    handleAcceptOffer,
    handleAskQuestion,
    getLocationIcon,
    getTimeDisplay,
    postQuestionMutation,
    currentUser,
    // Stripe Payment Modal
    showPaymentModal,
    selectedOfferId,
    selectedOffer,
    handleClosePaymentModal,
    handlePaymentSuccess,
  } = useTaskDetail({ taskId: taskId! });

  // Handle tab change with auto-scroll
  const handleTabChange = (tab: 'offers' | 'questions') => {
    setActiveTab(tab);
    
    // Scroll to tabs section after a small delay to ensure render
    setTimeout(() => {
      tabsSectionRef.current?.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
        },
        () => console.log('Failed to measure tabs section')
      );
    }, 100);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !task) {
    return <ErrorState onRetry={refetch} />;
  }

  // Additional check: Verify if current user is actually assigned to this task
  // This is a safety check in addition to navigation params
  const isCurrentUserAssignee = (task as any)?.userRole === 'assignee' || 
                                 (task as any)?.assignedTo?._id === currentUser?._id;
  
  // Final decision: Hide Make Offer and Ask Question if:
  // 1. Came from Tasker's assigned/completed tab, OR
  // 2. Task shows current user as assignee
  const shouldHideSections = isFromTaskerAssignedOrCompleted || 
                            (isCurrentUserAssignee && (task.status === 'assigned' || 
                                                       task.status === 'in_progress' || 
                                                       task.status === 'todo' ||
                                                       task.status === 'completed'));
  
  console.log('🎯 Task Detail - Hide Sections Decision:', {
    taskId: task._id,
    taskStatus: task.status,
    userRole: (task as any)?.userRole,
    isCurrentUserAssignee,
    isFromTaskerAssignedOrCompleted,
    shouldHideSections
  });

  return (
    <View style={styles.wrapper}>
      <OfflineBanner />
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <DetailHeader />

        <ScrollView 
          ref={scrollViewRef}
          style={styles.content} 
          showsVerticalScrollIndicator={false}
        >
        {/* Only show Make Offer section to taskers (not the task creator) */}
        {/* Hide if user is assigned to this task (Todoo Tasks or Completed) */}
        {/* Hide if user has already made an offer (myOffer exists) */}
        {task?.createdBy?._id !== currentUser?._id && !shouldHideSections && !myOffer && (
          <MakeOfferSection 
            onMakeOffer={handleMakeOffer} 
            offerCount={task?.offerCount || taskOffers.length}
          />
        )}

        <TaskInfoCard
          task={task}
          getLocationIcon={getLocationIcon}
          getTimeDisplay={getTimeDisplay}
          refetch={refetch}
        />

        {/* Show user's own offer if they made one (Tasker only) */}
        {myOffer && task?.createdBy?._id !== currentUser?._id && (
          <MyOfferCard 
            offer={myOffer} 
            isTaskPoster={false}
            onAcceptOffer={handleAcceptOffer}
            taskLocation={task?.location}
          />
        )}

        <View ref={tabsSectionRef} collapsable={false}>
          <TabsSection activeTab={activeTab} onTabChange={handleTabChange} />
        </View>

        <View style={styles.tabContent}>
          {activeTab === 'offers' ? (
            <OffersList 
              offers={taskOffers} 
              isLoading={isLoadingTaskOffers}
              taskCreatorId={task?.createdBy?._id}
              currentUserId={currentUser?._id}
              onAcceptOffer={handleAcceptOffer}
              excludeOfferId={myOffer?._id}
              taskLocation={task?.location}
            />
          ) : (
            <QuestionsList
              questions={questions}
              isLoading={isLoadingQuestions}
              onAskQuestion={() => setShowAskQuestion(true)}
              taskId={taskId}
              currentUserId={currentUser?._id}
              taskCreatorId={task?.createdBy?._id}
              onRefreshQuestions={refetchQuestions}
              taskOffers={taskOffers}
              hideAskButton={shouldHideSections}
            />
          )}
        </View>
      </ScrollView>

      <AskQuestionModal
        visible={showAskQuestion}
        questionText={questionText}
        onChangeText={setQuestionText}
        onSubmit={handleAskQuestion}
        onClose={() => setShowAskQuestion(false)}
        isSubmitting={postQuestionMutation.isPending}
      />

      <StripePaymentModal
        visible={showPaymentModal}
        taskId={taskId!}
        offerId={selectedOfferId || ''}
        offerAmount={selectedOffer?.offer?.amount || selectedOffer?.amount || 0}
        currency={selectedOffer?.offer?.currency || selectedOffer?.currency || 'LKR'}
        taskTitle={task?.title || 'Task'}
        taskCategory={task?.categories?.[0]}
        onClose={handleClosePaymentModal}
        onSuccess={handlePaymentSuccess}
      />
      </View>

      {/* Bottom safe area for Android navigation bar */}
      <View style={styles.bottomSafeArea} />
      
      <NetworkAlert
        visible={showNetworkAlert}
        onClose={() => setShowNetworkAlert(false)}
        message="Network connection lost. Please check your internet."
        actionText="OK"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    paddingHorizontal: isTablet ? wp('12.5%') : wp('4%'),
    maxWidth: isTablet ? 900 : undefined,
    alignSelf: isTablet ? 'center' : 'auto',
    width: isTablet ? '100%' : 'auto',
  },
  tabContent: {
    flex: 1,
  },
  bottomSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'android' ? 48 : 0,
    backgroundColor: '#fff',
  },
});
