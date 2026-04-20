import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007bff',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
});
