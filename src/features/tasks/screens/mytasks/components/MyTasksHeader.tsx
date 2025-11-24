import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MyTasksHeaderProps {
  notificationCount?: number;
  onSearchPress: () => void;
  onNotificationPress: () => void;
}

export default function MyTasksHeader({
  notificationCount = 0,
  onSearchPress,
  onNotificationPress,
}: Omit<MyTasksHeaderProps, 'selectedFilter' | 'onFilterPress'>) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>My Tasks</Text>
      </View>
      <View style={styles.headerIcons}>
        <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
          <Ionicons name="search-outline" size={20} color="#000" />
        </TouchableOpacity>
        
        {/* Payment Summary Button */}
        <TouchableOpacity
          onPress={() => router.push('/payment-summary' as any)}
          style={styles.iconButton}
        >
          <Ionicons name="card-outline" size={20} color="#007bff" />
        </TouchableOpacity>
        
        {/* Notification Button */}
        <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
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
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
  },
  headerLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  iconButton: {
    marginLeft: 16,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
