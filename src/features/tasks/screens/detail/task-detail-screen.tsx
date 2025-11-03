import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import {
    AskQuestionModal,
    DetailHeader,
    ErrorState,
    LoadingState,
    MakeOfferSection,
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
    offers,
    questions,
    isLoading,
    error,
    refetch,
    isLoadingOffers,
    isLoadingQuestions,
    activeTab,
    setActiveTab,
    showAskQuestion,
    setShowAskQuestion,
    questionText,
    setQuestionText,
    handleMakeOffer,
    handleAskQuestion,
    getLocationIcon,
    getTimeDisplay,
    postQuestionMutation,
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

        <TabsSection activeTab={activeTab} onTabChange={setActiveTab} />

        <View style={styles.tabContent}>
          {activeTab === 'offers' ? (
            <OffersList offers={offers} isLoading={isLoadingOffers} />
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
