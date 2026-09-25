import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';
import { CARD_BG, CARD_TEXT, CARD_TEXT_MUTED, CARD_DIVIDER, CARD_CHIP_BG } from '@/src/shared/theme/brandColors';

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
  const { isDarkMode } = useTheme();
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
    <View style={[styles.container, isDarkMode && { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' }]}>
      {/* Overall Rating Display */}
      <View style={styles.overallSection}>
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>Overall rating</Text>
        <View style={styles.ratingMainContainer}>
          <Text style={[styles.ratingNumber, isDarkMode && { color: '#F8FAFC' }]}>
            {averageRating != null ? averageRating.toFixed(1) : '0.0'}
          </Text>
          <Ionicons name="star" size={32} color="#FFD700" style={styles.mainStar} />
        </View>
        <Text style={[styles.reviewCount, isDarkMode && { color: '#94A3B8' }]}>{totalReviews} review{totalReviews !== 1 ? 's' : ''}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, isDarkMode && { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' }]}>
          <Ionicons name="checkmark-circle" size={24} color="#4ADE80" />
          <Text style={[styles.statValue, isDarkMode && { color: '#F8FAFC' }]}>{completionRate || 0}%</Text>
          <Text style={[styles.statLabel, isDarkMode && { color: '#F8FAFC' }]}>Completion rate</Text>
          <Text style={[styles.statSubtext, isDarkMode && { color: '#94A3B8' }]}>{totalTasks || 0} task{(totalTasks || 0) !== 1 ? 's' : ''} completed</Text>
        </View>

        <View style={[styles.statCard, isDarkMode && { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' }]}>
          <Ionicons name="chatbox" size={24} color="#7DD3FC" />
          <Text style={[styles.statValue, isDarkMode && { color: '#F8FAFC' }]}>{totalReviews}</Text>
          <Text style={[styles.statLabel, isDarkMode && { color: '#F8FAFC' }]}>review{totalReviews !== 1 ? 's' : ''}</Text>
          <Text style={[styles.statSubtext, isDarkMode && { color: '#94A3B8' }]}>From completed tasks</Text>
        </View>
      </View>

      {/* Rating Breakdown */}
      <View style={styles.breakdownSection}>
        <Text style={[styles.breakdownTitle, isDarkMode && { color: '#F8FAFC' }]}>Rating Breakdown</Text>
        
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
                  <Ionicons key={`empty-${index}`} name="star-outline" size={14} color={isDarkMode ? '#334155' : CARD_DIVIDER} />
                ))}
              </View>
              
              <View style={styles.barContainer}>
                <View style={[styles.barBackground, isDarkMode && { backgroundColor: '#334155' }]}>
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
              
              <Text style={[styles.countText, isDarkMode && { color: '#94A3B8' }]}>
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
    backgroundColor: CARD_BG,
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
    fontSize: RFValue(22),
    fontWeight: 'bold',
    color: CARD_TEXT,
    marginBottom: 16,
  },
  ratingMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingNumber: {
    fontSize: RFValue(48),
    fontWeight: 'bold',
    color: CARD_TEXT,
    marginRight: 8,
  },
  mainStar: {
    marginTop: -4,
  },
  reviewCount: {
    fontSize: RFValue(16),
    color: CARD_TEXT_MUTED,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD_CHIP_BG,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: RFValue(24),
    fontWeight: 'bold',
    color: CARD_TEXT,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: CARD_TEXT,
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: RFValue(12),
    color: CARD_TEXT_MUTED,
    textAlign: 'center',
  },
  breakdownSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  breakdownTitle: {
    fontSize: RFValue(20),
    fontWeight: 'bold',
    color: CARD_TEXT,
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
    backgroundColor: CARD_DIVIDER,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  countText: {
    fontSize: RFValue(14),
    color: CARD_TEXT,
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'right',
  },
});