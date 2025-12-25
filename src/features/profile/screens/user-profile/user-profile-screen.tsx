import { useGetUserRatingStats } from '@/src/shared/hooks/useUserProfileApi';
import { Ionicons } from '@expo/vector-icons';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  ErrorState,
  LoadingState,
  StatsCard,
  TasksTabsSection,
  UserInfoCard,
  UserProfileHeader,
  UserTasksList,
} from './components';
import { GetMoreReviewsSection } from './components/GetMoreReviewsSection';
import { OverallRatingSection } from './components/OverallRatingSection';
import { ReviewsList } from './components/ReviewsList';
import { useUserProfile } from './hooks/useUserProfile';

export default function UserProfileScreen() {
  const {
    isLoading,
    isError,
    refetch,
    userData,
    activeTab,
    setActiveTab,
    formatDate,
    getTasksByTab,
    handleTaskPress,
  } = useUserProfile();

  // Get the user ID from userData
  const userId = userData?.user?._id || '';
  const userName = userData?.user?.firstName || 'User';
  
  // Use the rating stats hook (ReviewsList manages its own review fetching)
  const {
    data: ratingStatsData,
    isLoading: ratingLoading,
  } = useGetUserRatingStats(userId, !!userId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !userData) {
    return <ErrorState onRetry={refetch} />;
  }

  const taskCounts = {
    created: userData.tasks.created.length,
    completed: userData.tasks.completed.length,
    inProgress: userData.tasks.inProgress.length,
  };

  const handleMessage = () => {
    Alert.alert(
      'Send Message',
      'Messaging functionality will be implemented in the next phase.',
      [{ text: 'OK' }]
    );
  };

  const handleReport = () => {
    Alert.alert(
      'Report User',
      'Are you sure you want to report this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', style: 'destructive' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <UserProfileHeader />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <UserInfoCard 
          user={userData.user} 
          formatDate={formatDate} 
          actualRating={ratingStatsData?.averageRating}
          actualTotalReviews={ratingStatsData?.totalReviews}
        />

        <StatsCard stats={userData.stats} />

        {/* Rating and Reviews Section */}
        {ratingStatsData && (
          <>
            <OverallRatingSection
              averageRating={ratingStatsData.averageRating || 0}
              totalReviews={ratingStatsData.totalReviews || 0}
              ratingDistribution={ratingStatsData.ratingDistribution || {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}}
              completionRate={90}
              totalTasks={userData?.user?.completedTasks || 0}
            />
            
            {/* Hidden: Get More Reviews Section - kept for future use */}
            {false && (
              <GetMoreReviewsSection 
                userId={userId}
                userName={userName}
              />
            )}
          </>
        )}

        {/* Show default rating section when loading or no data */}
        {!ratingStatsData && !ratingLoading && (
          <>
            <OverallRatingSection
              averageRating={0}
              totalReviews={0}
              ratingDistribution={{"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}}
              completionRate={0}
              totalTasks={0}
            />
            
            {/* Hidden: Get More Reviews Section - kept for future use */}
            {false && (
              <GetMoreReviewsSection 
                userId={userId}
                userName={userName}
              />
            )}
          </>
        )}

        {/* Reviews List - Manages its own data fetching */}
        {userId && <ReviewsList userId={userId} />}

        <TasksTabsSection
          activeTab={activeTab}
          taskCounts={taskCounts}
          onTabChange={setActiveTab}
        />

        <UserTasksList
          tasks={getTasksByTab()}
          formatDate={formatDate}
          onTaskPress={handleTaskPress}
        />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
          <Ionicons name="mail-outline" size={20} color="#007bff" />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
          <Ionicons name="flag-outline" size={20} color="#dc3545" />
          <Text style={styles.reportButtonText}>Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  actionContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3f2fd',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
  },
  reportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef0f0',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc3545',
  },
});
