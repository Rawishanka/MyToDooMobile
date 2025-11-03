import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TaskFilter } from '../hooks/useMyTasksFilters';

interface MyTasksHeaderProps {
  selectedFilter: TaskFilter;
  notificationCount?: number;
  onFilterPress: () => void;
  onSearchPress: () => void;
  onNotificationPress: () => void;
}

export default function MyTasksHeader({
  selectedFilter,
  notificationCount = 0,
  onFilterPress,
  onSearchPress,
  onNotificationPress,
}: MyTasksHeaderProps) {
  const router = useRouter();

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.headerTitle}>My Tasks</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={onSearchPress}>
            <Ionicons name="search-outline" size={20} color="#000" />
          </TouchableOpacity>
          
          {/* Payment Status Button */}
          <TouchableOpacity
            onPress={() => router.push('/payment-status' as any)}
            style={styles.paymentButton}
          >
            <Ionicons name="card-outline" size={20} color="#007bff" />
          </TouchableOpacity>
          
          {/* Notification Button */}
          <TouchableOpacity onPress={onNotificationPress} style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={20} color="#000" />
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <View style={{ flex: 1, alignItems: 'flex-start', paddingLeft: 16 }}>
          <Pressable onPress={onFilterPress} style={styles.filterButton}>
            <Ionicons name="chevron-down" size={16} color="#333" />
            <Text style={styles.filterText}>{selectedFilter}</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
    height: 56,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationButton: {
    position: 'relative',
    marginLeft: 10,
    padding: 4,
  },
  paymentButton: {
    marginLeft: 10,
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterText: {
    fontSize: 16,
    color: '#002A5C',
  },
});
