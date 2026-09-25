import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { formatCurrency, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { CARD_BG, CARD_TEXT, CARD_TEXT_MUTED, CARD_DIVIDER, CARD_CHIP_BG, BRAND_BLUE, BRAND_ORANGE } from '@/src/shared/theme/brandColors';

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
        return CARD_TEXT_MUTED;
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
    backgroundColor: CARD_BG,
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
    fontSize: RFValue(16),
    fontWeight: '600',
    color: CARD_TEXT,
    marginBottom: 8,
  },
  taskLocation: {
    fontSize: RFValue(14),
    color: CARD_TEXT_MUTED,
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
    color: CARD_TEXT_MUTED,
  },
  taskPrice: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: CARD_TEXT,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: RFValue(14),
    color: '#999',
  },
});
