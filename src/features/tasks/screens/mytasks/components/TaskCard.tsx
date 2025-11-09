import { Task } from '@/src/api/types/tasks';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TaskCardProps {
  task: Task;
  onPress?: (taskId: string) => void;
  status?: string;
}

export default function TaskCard({ task, onPress, status }: TaskCardProps) {
  const router = useRouter();

  const handleMarkAsCompleted = () => {
    console.log('Mark as completed:', task._id);
    // TODO: API call to mark task as completed
  };

  const handleCancelTask = () => {
    console.log('Cancel task:', task._id);
    // TODO: API call to cancel task
  };

  // Helper function to get time preference display
  const getTimePreference = () => {
    if (task.dateType === 'before') return '🕐 Before specific date';
    if (task.dateType === 'no-rush') return '⏰ No rush';
    if (task.time && task.time !== 'Anytime') return `🕒 ${task.time}`;
    return '⏰ Flexible timing';
  };

  // Helper function to get location type
  const getLocationType = () => {
    const address = task.location?.address || '';
    if (address.toLowerCase().includes('online') || address.toLowerCase().includes('remote')) {
      return '💻 Online';
    }
    if (address.includes(' → ') || address.includes(' to ')) {
      return '🚚 Moving/Delivery';
    }
    return '📍 In Person';
  };

  // Helper function to format location display
  const formatLocation = () => {
    const address = task.location?.address || 'Location not specified';
    if (address.includes(' → ') || address.includes(' to ')) {
      const parts = address.split(/\s*(?:→|to)\s*/);
      return `${parts[0]} → ${parts[1]}`;
    }
    return address;
  };

  // Get status color
  const getStatusColor = () => {
    switch (task.status) {
      case 'completed':
        return '#28a745';
      case 'assigned':
        return '#007bff';
      case 'open':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/task-detail?taskId=${task._id}`)}
    >
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.title}>{task.title}</Text>

          {/* Time and Date Information */}
          <View style={styles.metaRow}>
            <Text style={styles.timePreference}>{getTimePreference()}</Text>
          </View>

          {/* Location Information */}
          <View style={styles.metaRow}>
            <Text style={styles.locationType}>{getLocationType()}</Text>
            <Text style={styles.locationDivider}>•</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {formatLocation()}
            </Text>
          </View>

          {/* Task Status and Date */}
          <View style={styles.meta}>
            <Text style={[styles.status, { color: getStatusColor() }]}>
              {task.status?.charAt(0).toUpperCase() + task.status?.slice(1)}
            </Text>
            <Text style={styles.date}>
              {new Date(task.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {/* Categories */}
          {task.categories && Array.isArray(task.categories) && task.categories.length > 0 && (
            <View style={styles.categoriesContainer}>
              {task.categories.slice(0, 3).map((category, index) => (
                <View key={index} style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{category}</Text>
                </View>
              ))}
              {task.categories.length > 3 && (
                <Text style={styles.moreCategoriesText}>
                  +{task.categories.length - 3} more
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Price and User Info */}
        <View style={styles.price}>
          <Text style={styles.priceText}>
            {task.formattedBudget || `${task.currency || 'A$'}${task.budget}`}
          </Text>
          {task.createdBy && (
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${task.createdBy.firstName}+${task.createdBy.lastName}&background=random`,
              }}
              style={styles.userAvatar}
            />
          )}
        </View>
      </View>

      {/* Task Details */}
      {task.details && (
        <Text style={styles.description} numberOfLines={2}>
          {task.details}
        </Text>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {status === 'accepted' ? (
          // Accepted Offers tab: Mark as Completed + Cancel
          <>
            <TouchableOpacity 
              style={styles.completedButton}
              onPress={handleMarkAsCompleted}
            >
              <Text style={styles.completedButtonText}>Mark as Completed</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancelTask}
            >
              <MaterialIcons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          // Posted tab: Edit + Cancel (removed Approve button)
          <>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => onPress ? onPress(task._id) : router.push(`/edit-task?taskId=${task._id}` as any)}
            >
              <MaterialIcons name="edit" size={20} color="#007bff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleCancelTask}
            >
              <MaterialIcons name="cancel" size={20} color="#dc3545" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  completedButton: {
    flex: 1,
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  timePreference: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '500',
  },
  locationType: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  locationDivider: {
    marginHorizontal: 6,
    color: '#ccc',
    fontSize: 12,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  price: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007bff',
    marginBottom: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginTop: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  categoryTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    color: '#1976d2',
    fontWeight: '500',
  },
  moreCategoriesText: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
});
