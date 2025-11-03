import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Task {
  title: string;
  createdBy?: {
    firstName: string;
    lastName: string;
  };
  location?: {
    address?: string;
  };
  budget?: number;
  categories?: string[];
  details?: string;
}

interface TaskInfoCardProps {
  task: Task;
  getLocationIcon: () => 'location-outline' | 'desktop-outline' | 'car-outline';
  getTimeDisplay: () => string;
}

export const TaskInfoCard: React.FC<TaskInfoCardProps> = ({
  task,
  getLocationIcon,
  getTimeDisplay,
}) => {
  return (
    <View style={styles.taskCard}>
      {/* User Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={30} color="#666" />
        </View>
      </View>

      {/* Task Title */}
      <Text style={styles.taskTitle}>{task.title}</Text>

      {/* Poster Info */}
      <View style={styles.posterInfo}>
        <Ionicons name="person-outline" size={16} color="#666" />
        <Text style={styles.posterName}>
          {task.createdBy?.firstName} {task.createdBy?.lastName}
        </Text>
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>New!</Text>
        </View>
      </View>

      {/* Location */}
      <View style={styles.detailRow}>
        <Ionicons name={getLocationIcon()} size={16} color="#666" />
        <Text style={styles.detailText}>
          {task.location?.address || 'Location not specified'}
        </Text>
      </View>

      {/* Timing */}
      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={styles.detailText}>{getTimeDisplay()}</Text>
      </View>

      {/* Budget */}
      <View style={styles.budgetRow}>
        <Ionicons name="logo-usd" size={20} color="#000" />
        <View style={styles.budgetInfo}>
          <Text style={styles.budgetAmount}>{task.budget || 56} SGD</Text>
          <Text style={styles.budgetLabel}>Budget</Text>
        </View>
      </View>

      {/* Category */}
      {task.categories && task.categories.length > 0 && (
        <Text style={styles.category}>{task.categories[0]}</Text>
      )}

      {/* Description */}
      {task.details && <Text style={styles.description}>{task.details}</Text>}

      {/* Note */}
      <Text style={styles.note}>
        Note: It is equity share not the 10 dollar listed above
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  posterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  posterName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    marginRight: 8,
  },
  newBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  budgetInfo: {
    marginLeft: 8,
  },
  budgetAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  budgetLabel: {
    fontSize: 12,
    color: '#666',
  },
  category: {
    fontSize: 12,
    color: '#007bff',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  note: {
    fontSize: 12,
    color: '#ff9800',
    fontStyle: 'italic',
    backgroundColor: '#fff3e0',
    padding: 8,
    borderRadius: 4,
  },
});
