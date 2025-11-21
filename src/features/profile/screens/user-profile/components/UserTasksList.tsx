import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { formatCurrency, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Task {
  _id: string;
  title: string;
  location?: {
    address?: string;
  };
  status: string;
  createdAt: string;
  budget: number;
  currency?: string;
  formattedBudget?: string;
}

interface UserTasksListProps {
  tasks: Task[];
  formatDate: (date: string) => string;
  onTaskPress: (taskId: string) => void;
}

export const UserTasksList: React.FC<UserTasksListProps> = ({ tasks, formatDate, onTaskPress }) => {
  // Use current user's location for currency auto-detection
  const { countryInfo } = useLocationCountry();
  
  const getStatusColor = (status: string) => {
    switch (status) {
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

  const renderTaskItem = ({ item }: { item: Task }) => {
    // Use user's current location for currency display (auto geo-location)
    const userCurrencyInfo = getCurrencyFromUserLocation(countryInfo);
    const formattedPrice = item.formattedBudget || 
      (item.budget ? formatCurrency(item.budget, userCurrencyInfo) : 
      `${userCurrencyInfo.symbol}0.00`);
    
    return (
      <TouchableOpacity
        style={styles.taskCard}
        activeOpacity={0.7}
        onPress={() => onTaskPress(item._id)}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.taskLocation}>
              {item.location?.address || 'Location not specified'}
            </Text>
            <View style={styles.taskMeta}>
              <Text style={[styles.taskStatus, { color: getStatusColor(item.status) }]}>
                {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
              </Text>
              <Text style={styles.taskDate}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.taskPrice}>
            <Text style={styles.priceText}>
              {formattedPrice}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No tasks found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item._id}
      renderItem={renderTaskItem}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  taskCard: {
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  taskLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  taskDate: {
    fontSize: 12,
    color: '#999',
  },
  taskPrice: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007bff',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});
