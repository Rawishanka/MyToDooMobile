import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface OverallRatingProps {
  averageRating: number | null | undefined;
  totalReviews: number;
  ratingDistribution: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
  completionRate?: number;
  totalTasks?: number;
}

export const OverallRatingSection: React.FC<OverallRatingProps> = ({
  averageRating,
  totalReviews,
  ratingDistribution,
  completionRate = 0,
  totalTasks = 0,
}) => {
  const getBarWidth = (count: number) => {
    if (totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  const getBarColor = (starCount: number) => {
    if (starCount === 5) return '#FFD700';
    if (starCount === 4) return '#FFA500';
    if (starCount === 3) return '#FF8C00';
    if (starCount === 2) return '#FF6347';
    return '#FF4500';
  };

  return (
    <View style={styles.container}>
      {/* Overall Rating Display */}
      <View style={styles.overallSection}>
        <Text style={styles.sectionTitle}>Overall rating</Text>
        <View style={styles.ratingMainContainer}>
          <Text style={styles.ratingNumber}>
            {averageRating != null ? averageRating.toFixed(1) : '0.0'}
          </Text>
          <Ionicons name="star" size={32} color="#FFD700" style={styles.mainStar} />
        </View>
        <Text style={styles.reviewCount}>{totalReviews} review{totalReviews !== 1 ? 's' : ''}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#28A745" />
          <Text style={styles.statValue}>{completionRate || 0}%</Text>
          <Text style={styles.statLabel}>Completion rate</Text>
          <Text style={styles.statSubtext}>{totalTasks || 0} task{(totalTasks || 0) !== 1 ? 's' : ''} completed</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="chatbox" size={24} color="#007AFF" />
          <Text style={styles.statValue}>{totalReviews}</Text>
          <Text style={styles.statLabel}>review{totalReviews !== 1 ? 's' : ''}</Text>
          <Text style={styles.statSubtext}>From completed tasks</Text>
        </View>
      </View>

      {/* Rating Breakdown */}
      <View style={styles.breakdownSection}>
        <Text style={styles.breakdownTitle}>Rating Breakdown</Text>
        
        {[5, 4, 3, 2, 1].map((starCount) => {
          const count = ratingDistribution[starCount.toString() as keyof typeof ratingDistribution] || 0;
          const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
          
          return (
            <View key={starCount} style={styles.ratingRow}>
              <View style={styles.starsContainer}>
                {Array.from({ length: starCount }).map((_, index) => (
                  <Ionicons key={index} name="star" size={14} color="#FFD700" />
                ))}
                {Array.from({ length: 5 - starCount }).map((_, index) => (
                  <Ionicons key={`empty-${index}`} name="star-outline" size={14} color="#E0E0E0" />
                ))}
              </View>
              
              <View style={styles.barContainer}>
                <View style={styles.barBackground}>
                  <View 
                    style={[
                      styles.barFill, 
                      { 
                        width: `${getBarWidth(count)}%`,
                        backgroundColor: getBarColor(starCount)
                      }
                    ]} 
                  />
                </View>
              </View>
              
              <Text style={styles.countText}>
                {count} ({percentage}%)
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overallSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  ratingMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  mainStar: {
    marginTop: -4,
  },
  reviewCount: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  breakdownSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  breakdownTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    width: 80,
  },
  barContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  barBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  countText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'right',
  },
});