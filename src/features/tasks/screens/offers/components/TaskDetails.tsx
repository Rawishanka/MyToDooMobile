import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TaskDetailsProps {
  description?: string;
  dueDate?: string;
  dateType?: string;
}

export default function TaskDetails({ description, dueDate, dateType }: TaskDetailsProps) {
  return (
    <View style={styles.detailsContainer}>
      <Text style={styles.sectionTitle}>Task Description</Text>
      <Text style={styles.taskDescription}>
        {description || 'No description provided.'}
      </Text>

      {dueDate && (
        <View style={styles.dueDateContainer}>
          <Ionicons name="calendar-outline" size={20} color="#666" />
          <Text style={styles.dueDateText}>
            Due: {new Date(dueDate).toLocaleDateString()}
          </Text>
        </View>
      )}

      {dateType && (
        <View style={styles.urgencyContainer}>
          <Ionicons name="time-outline" size={20} color="#ff6b6b" />
          <Text style={styles.urgencyText}>Date Type: {dateType}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  detailsContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  taskDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dueDateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  urgencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgencyText: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: '600',
    marginLeft: 8,
  },
});
