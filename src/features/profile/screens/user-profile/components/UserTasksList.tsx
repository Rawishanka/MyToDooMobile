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
        return '#16A34A';
      case 'assigned':
        return '#003399';
      case 'open':
        return '#D97706';
      default:
        return '#64748B';
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
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
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
    color: '#0F172A',
    marginBottom: 8,
  },
  taskLocation: {
    fontSize: RFValue(14),
    color: '#64748B',
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
    color: '#64748B',
  },
  taskPrice: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#003399',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: RFValue(14),
    color: '#64748B',
  },
});
