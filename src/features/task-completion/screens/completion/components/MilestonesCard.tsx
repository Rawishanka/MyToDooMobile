import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CompletionMilestone } from '../hooks/useCompletionStatus';
import { CARD_BG, CARD_DIVIDER, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
import { RFValue } from '@/src/shared/utils/responsive';

interface MilestonesCardProps {
  milestones: CompletionMilestone[];
  formatDate: (date: string) => string;
}

export default function MilestonesCard({ milestones, formatDate }: MilestonesCardProps) {
  const completedCount = milestones.filter((m) => m.completed).length;
  const totalCount = milestones.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Project Milestones</Text>

      <View style={styles.progress}>
        <Text style={styles.progressText}>
          {completedCount} of {totalCount} completed
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
      </View>

      <View style={styles.list}>
        {milestones.map((milestone, index) => (
          <View key={milestone._id} style={styles.item}>
            <View style={styles.indicator}>
              <View
                style={[
                  styles.circle,
                  { backgroundColor: milestone.completed ? '#4ADE80' : CARD_DIVIDER },
                ]}
              >
                {milestone.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              {index < totalCount - 1 && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: milestone.completed ? '#4ADE80' : CARD_DIVIDER },
                  ]}
                />
              )}
            </View>

            <View style={styles.content}>
              <Text
                style={[styles.milestoneTitle, { color: milestone.completed ? '#4ADE80' : CARD_TEXT }]}
              >
                {milestone.title}
              </Text>
              <Text style={styles.description}>{milestone.description}</Text>
              {milestone.completed && milestone.completedAt && (
                <Text style={styles.date}>Completed: {formatDate(milestone.completedAt)}</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#001A66',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: CARD_TEXT,
    marginBottom: 14,
  },
  progress: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: RFValue(14),
    color: CARD_TEXT_MUTED,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: CARD_DIVIDER,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 3,
  },
  list: {
    gap: 16,
  },
  item: {
    flexDirection: 'row',
    gap: 12,
  },
  indicator: {
    alignItems: 'center',
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: RFValue(16),
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: RFValue(14),
    color: CARD_TEXT_MUTED,
    lineHeight: 18,
    marginBottom: 4,
  },
  date: {
    fontSize: RFValue(12),
    color: CARD_TEXT_MUTED,
  },
});
