import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
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
  const { taskId } = useLocalSearchParams<{ taskId: string }>();

  const {
    task,
    taskOffers,
    allOffers,
    myOffer,
    questions,
    isLoading,
    error,
    refetch,
    isLoadingTaskOffers,
    isLoadingAllOffers,
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
  } = useTaskDetail({ taskId: taskId! });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !task) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <DetailHeader />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <MakeOfferSection onMakeOffer={handleMakeOffer} />

        <TaskInfoCard
          task={task}
          getLocationIcon={getLocationIcon}
          getTimeDisplay={getTimeDisplay}
        />

        {/* Show user's own offer if they made one */}
        {/* OR show the first offer if user is the task poster (to review/accept) */}
        {(myOffer || (task?.createdBy?._id === currentUser?._id && taskOffers.length > 0)) && (
          <MyOfferCard 
            offer={myOffer || taskOffers[0]} 
            isTaskPoster={task?.createdBy?._id === currentUser?._id}
            onAcceptOffer={handleAcceptOffer}
          />
        )}

        <TabsSection activeTab={activeTab} onTabChange={setActiveTab} />

        <View style={styles.tabContent}>
          {activeTab === 'offers' ? (
            <OffersList 
              offers={allOffers} 
              isLoading={isLoadingAllOffers}
              taskCreatorId={task?.createdBy?._id}
              currentUserId={currentUser?._id}
              onAcceptOffer={handleAcceptOffer}
              excludeOfferId={myOffer?._id || (task?.createdBy?._id === currentUser?._id && taskOffers.length > 0 ? taskOffers[0]._id : undefined)}
            />
          ) : (
            <QuestionsList
              questions={questions}
              isLoading={isLoadingQuestions}
              onAskQuestion={() => setShowAskQuestion(true)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabContent: {
    flex: 1,
  },
});
