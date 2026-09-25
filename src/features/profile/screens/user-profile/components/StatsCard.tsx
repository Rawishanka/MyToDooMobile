import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';

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
    backgroundColor: 'rgba(255,255,255,0.10)',
    padding: 16,
    marginBottom: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#00114D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
  },
  statsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: RFValue(22),
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  responseTimeContainer: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  responseTimeLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    flexShrink: 1,
    marginRight: 8,
  },
  responseTimeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
