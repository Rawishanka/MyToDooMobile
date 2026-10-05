import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { formatCurrency, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';

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
        return '#4ADE80';
      case 'assigned':
        return '#7DD3FC';
      case 'open':
        return '#FBBF24';
      default:
        return 'rgba(255,255,255,0.75)';
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => {
    // Use user's current location for currency display (auto geo-location)
    const userCurrencyInfo = getCurrencyFromUserLocation(countryInfo || { currency: 'AUD' });
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
            <Text style={styles.taskLocation} numberOfLines={1}>
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
    <FlatList keyboardShouldPersistTaps="handled"
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  taskLocation: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskStatus: {
    fontSize: RFValue(12),
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  taskDate: {
    fontSize: RFValue(12),
    color: 'rgba(255,255,255,0.75)',
  },
  taskPrice: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
  },
});
