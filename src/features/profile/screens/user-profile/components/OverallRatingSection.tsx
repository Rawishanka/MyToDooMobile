import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';

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
    if (starCount === 5) return '#16A34A';
    if (starCount === 4) return '#84CC16';
    if (starCount === 3) return '#F59E0B';
    if (starCount === 2) return '#F97316';
    return '#DC2626';
  };

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
      {/* Overall Rating Display */}
      <View style={styles.overallSection}>
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>Overall rating</Text>
        <View style={styles.ratingMainContainer}>
          <Text style={[styles.ratingNumber, isDarkMode && { color: '#F8FAFC' }]}>
            {averageRating != null ? averageRating.toFixed(1) : '0.0'}
          </Text>
          <Ionicons name="star" size={32} color="#F59E0B" style={styles.mainStar} />
        </View>
        <Text style={[styles.reviewCount, isDarkMode && { color: '#94A3B8' }]}>{totalReviews} review{totalReviews !== 1 ? 's' : ''}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
          <View style={[styles.statChip, { backgroundColor: '#DCFCE7' }]}><Ionicons name="checkmark-circle" size={20} color="#16A34A" /></View>
          <Text style={[styles.statValue, isDarkMode && { color: '#F8FAFC' }]}>{completionRate || 0}%</Text>
          <Text style={[styles.statLabel, isDarkMode && { color: '#F8FAFC' }]}>Completion rate</Text>
          <Text style={[styles.statSubtext, isDarkMode && { color: '#94A3B8' }]}>{totalTasks || 0} task{(totalTasks || 0) !== 1 ? 's' : ''} completed</Text>
        </View>

        <View style={[styles.statCard, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
          <View style={[styles.statChip, isDarkMode && { backgroundColor: 'rgba(56,189,248,0.14)' }]}><Ionicons name="chatbox" size={20} color={isDarkMode ? '#38BDF8' : '#003399'} /></View>
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
                  <Ionicons key={index} name="star" size={14} color="#F59E0B" />
                ))}
                {Array.from({ length: 5 - starCount }).map((_, index) => (
                  <Ionicons key={`empty-${index}`} name="star-outline" size={14} color={isDarkMode ? '#334155' : '#CBD5E1'} />
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },
  statChip: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(0,51,153,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  ratingMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingNumber: {
    fontSize: RFValue(44),
    fontWeight: '800',
    color: '#003399',
    marginRight: 8,
  },
  mainStar: {
    marginTop: -4,
  },
  reviewCount: {
    fontSize: RFValue(15),
    color: '#64748B',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: RFValue(24),
    fontWeight: '800',
    color: '#003399',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: RFValue(12),
    color: '#64748B',
    textAlign: 'center',
  },
  breakdownSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  breakdownTitle: {
    fontSize: RFValue(17),
    fontWeight: '700',
    color: '#0F172A',
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
    backgroundColor: '#E8ECF4',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  countText: {
    fontSize: RFValue(13),
    color: '#334155',
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'right',
  },
});