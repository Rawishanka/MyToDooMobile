import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';

interface TaskCounts {
  created: number;
  completed: number;
  inProgress: number;
}

interface TasksTabsSectionProps {
  activeTab: 'created' | 'completed' | 'progress';
  taskCounts: TaskCounts;
  onTabChange: (tab: 'created' | 'completed' | 'progress') => void;
}

export const TasksTabsSection: React.FC<TasksTabsSectionProps> = ({
  activeTab,
  taskCounts,
  onTabChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task History</Text>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'created' && styles.activeTab]}
          onPress={() => onTabChange('created')}
        >
          <Text style={[styles.tabText, activeTab === 'created' && styles.activeTabText]}>
            Created ({taskCounts.created})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => onTabChange('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed ({taskCounts.completed})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
          onPress={() => onTabChange('progress')}
        >
          <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>
            In Progress ({taskCounts.inProgress})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 11,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: RFValue(12),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
  },
  activeTabText: {
    color: '#003399',
    fontWeight: '700',
  },
});
