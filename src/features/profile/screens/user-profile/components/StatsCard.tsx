import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { HS, homeCard } from '@/src/shared/theme/homeStyle';

interface Stats {
  totalTasksCreated: number;
  totalTasksCompleted: number;
  averageRating: number;
  totalEarnings: number;
  responseTime: string;
}

interface StatsCardProps {
  stats: Stats;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  return (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>Performance Stats</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalTasksCreated}</Text>
          <Text style={styles.statLabel}>Tasks Created</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalTasksCompleted}</Text>
          <Text style={styles.statLabel}>Tasks Completed</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.averageRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>${stats.totalEarnings}</Text>
          <Text style={styles.statLabel}>Total Earnings</Text>
        </View>
      </View>

      <View style={styles.responseTimeContainer}>
        <Text style={styles.responseTimeLabel}>Average Response Time</Text>
        <Text style={styles.responseTimeValue}>{stats.responseTime}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsCard: {
    ...homeCard,
    padding: 16,
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: HS.navy,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statItem: {
    width: '48%',
    backgroundColor: HS.tint,
    borderWidth: 1,
    borderColor: HS.tintBorder,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: RFValue(22),
    fontWeight: '800',
    color: HS.blue,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: HS.muted,
    textAlign: 'center',
  },
  responseTimeContainer: {
    backgroundColor: HS.tint,
    borderWidth: 1,
    borderColor: HS.tintBorder,
    padding: 14,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  responseTimeLabel: {
    fontSize: 14,
    color: HS.muted,
    flexShrink: 1,
    marginRight: 8,
  },
  responseTimeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: HS.navy,
  },
});
