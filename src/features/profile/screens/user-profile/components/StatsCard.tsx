import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007bff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  responseTimeContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  responseTimeLabel: {
    fontSize: 14,
    color: '#666',
  },
  responseTimeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});
