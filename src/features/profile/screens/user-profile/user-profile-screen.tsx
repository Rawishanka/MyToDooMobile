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
import { RFValue } from '@/src/shared/utils/responsive';

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
      <StatusBar barStyle="light-content" backgroundColor="#003399" />

      <UserProfileHeader />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
              completionRate={userData?.user?.completionRate ?? userData?.user?.completion_rate ?? 0}
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
          <Ionicons name="mail-outline" size={20} color="#003399" />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
          <Ionicons name="flag-outline" size={20} color="#DC2626" />
          <Text style={styles.reportButtonText}>Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  actionContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#E8ECF4',
    gap: 12,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#003399',
    height: 50,
    borderRadius: 14,
    gap: 8,
  },
  messageButtonText: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#003399',
  },
  reportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    height: 50,
    borderRadius: 14,
    gap: 8,
  },
  reportButtonText: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#DC2626',
  },
});
