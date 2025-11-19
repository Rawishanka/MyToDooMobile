import { cardStyles, colors, spacing } from '@/src/shared/theme';
import { formatCurrency, getCurrencyFromLocation } from '@/src/shared/utils/currency';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Import Task type
import { Task } from '@/src/api/types/tasks';

export interface TaskCardProps {
  task: Task;
  onPress: (taskId: string) => void;
  onMapPress?: (taskId: string) => void;
  showMapButton?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onMapPress,
  showMapButton = true,
  variant = 'default',
}) => {
  // Helper: Get location type with icon
  const getLocationInfo = () => {
    const address = task.location?.address || '';
    if (address.toLowerCase().includes('online') || address.toLowerCase().includes('remote')) {
      return { icon: 'laptop-outline', text: 'Remote' };
    }
    if (address.includes(' → ') || address.includes(' to ')) {
      return { icon: 'car-outline', text: 'Moving' };
    }
    return { icon: 'location-outline', text: 'In Person' };
  };

  // Helper: Get time preference
  const getTimePreference = () => {
    if (task.dateType === 'before') return 'Before specific date';
    if (task.dateType === 'no-rush') return 'No rush';
    if (task.time && task.time !== 'Anytime') return task.time;
    return 'Flexible';
  };

  // Helper: Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'assigned':
        return colors.primary;
      case 'open':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const locationInfo = getLocationInfo();
  
  // Get proper currency formatting with thousand separators
  const currencyInfo = getCurrencyFromLocation(task.location);
  const formattedBudget = task.formattedBudget || 
    (task.budget ? formatCurrency(task.budget, currencyInfo) : 
    `${currencyInfo.symbol}0`);

  // Compact variant (for lists with many items)
  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[cardStyles.card, styles.compactCard]}
        activeOpacity={0.7}
        onPress={() => onPress(task._id)}
      >
        <View style={styles.compactContent}>
          <View style={styles.compactLeft}>
            <Text style={styles.compactTitle} numberOfLines={1}>
              {task.title}
            </Text>
            <Text style={styles.compactLocation} numberOfLines={1}>
              {task.location?.address || 'Location not specified'}
            </Text>
          </View>
          <View style={styles.compactRight}>
            <Text style={styles.compactPrice}>{formattedBudget}</Text>
            <Text style={[styles.compactStatus, { color: getStatusColor(task.status) }]}>
              {task.status?.charAt(0).toUpperCase() + task.status?.slice(1)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Detailed variant (for task detail-related lists)
  if (variant === 'detailed') {
    return (
      <TouchableOpacity
        style={[cardStyles.taskCard, styles.detailedCard]}
        activeOpacity={0.7}
        onPress={() => onPress(task._id)}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle} numberOfLines={2}>
              {task.title}
            </Text>
            <Text style={styles.taskLocation} numberOfLines={1}>
              {task.location?.address || 'Location not specified'}
            </Text>
            <View style={styles.taskMeta}>
              <Text style={[styles.statusBadge, { color: getStatusColor(task.status) }]}>
                {task.status?.charAt(0).toUpperCase() + task.status?.slice(1)}
              </Text>
              {task.createdAt && (
                <Text style={styles.taskDate}>
                  {new Date(task.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.taskPriceContainer}>
            <Text style={styles.taskPrice}>{formattedBudget}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Default variant (for browse/explore screens)
  return (
    <TouchableOpacity
      style={[cardStyles.taskCard, styles.defaultCard]}
      activeOpacity={0.6}
      onPress={() => onPress(task._id)}
    >
      {/* Task Title */}
      <Text style={styles.taskTitle} numberOfLines={2}>
        {task.title}
      </Text>

      {/* Location */}
      <View style={styles.taskRow}>
        <Ionicons name={locationInfo.icon as any} size={16} color={colors.textSecondary} />
        <Text style={styles.taskRowText} numberOfLines={1}>
          {task.location?.address || 'Location not specified'}
        </Text>
      </View>

      {/* Time Preference */}
      <View style={styles.taskRow}>
        <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.taskRowText}>{getTimePreference()}</Text>
      </View>

      {/* Categories */}
      {task.categories && Array.isArray(task.categories) && task.categories.length > 0 && (
        <View style={styles.categoriesRow}>
          {task.categories.slice(0, 2).map((category, index) => (
            <View key={index} style={styles.categoryTag}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          ))}
          {task.categories.length > 2 && (
            <Text style={styles.moreCategoriesText}>
              +{task.categories.length - 2} more
            </Text>
          )}
        </View>
      )}

      {/* Status and Offers Row */}
      <View style={styles.bottomRow}>
        <View style={styles.statusContainer}>
          {/* Task Status */}
          <Text style={[styles.statusBadge, { color: getStatusColor(task.status || 'open') }]}>
            {task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : 'Open'}
          </Text>
          {/* Posted Date */}
          <Text style={styles.statusText}>
            Posted {task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }) : ''}
          </Text>
          {/* Offer Count */}
          <Text style={styles.offerText}>
            {task.status === 'accepted' || task.status === 'completed' || 
             task.status === 'assigned' || task.status === 'in_progress' || task.status === 'in-progress'
              ? task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ').replace('-', ' ')
              : (task.offerCount || 0) > 0
                ? `${task.offerCount} Offer${task.offerCount !== 1 ? 's' : ''}`
                : 'Make the first offer'}
          </Text>
        </View>

        {/* Price */}
        <Text style={styles.priceText}>{formattedBudget}</Text>
      </View>

      {/* View Map Button */}
      {showMapButton && onMapPress && (
        <TouchableOpacity
          style={styles.viewMapButton}
          onPress={(e) => {
            e.stopPropagation();
            onMapPress(task._id);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="map-outline" size={11} color={colors.primary} />
          <Text style={styles.viewMapButtonText}>View Map</Text>
        </TouchableOpacity>
      )}

      {/* User Avatar */}
      <View style={styles.userAvatarContainer}>
        <Image
          source={{
            uri: task.createdBy?.avatar || 
                 task.createdBy?.profilePicture ||
                 `https://ui-avatars.com/api/?name=${task.createdBy?.firstName}+${task.createdBy?.lastName}&background=0052A2&color=fff&size=80`,
          }}
          style={styles.userAvatar}
        />
        {/* Poster Name */}
        <Text style={styles.posterName} numberOfLines={2}>
          Posted by: {task.createdBy?.firstName || 'User'} {task.createdBy?.lastName || ''}
        </Text>
      </View>

      {/* Navigation Indicator */}
      <View style={styles.navigationIndicator}>
        <Ionicons name="chevron-forward" size={16} color={colors.border} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Default Card Styles
  defaultCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    position: 'relative',
    paddingRight: 100, // Space for avatar and poster name
  },

  // Compact Card Styles
  compactCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.xs,
    paddingVertical: spacing.sm,
  },
  compactContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  compactLocation: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  compactRight: {
    alignItems: 'flex-end',
  },
  compactPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  compactStatus: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Detailed Card Styles
  detailedCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    lineHeight: 22,
    paddingRight: spacing.xs,
  },
  taskLocation: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskDate: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  taskPriceContainer: {
    alignItems: 'flex-end',
  },
  taskPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },

  // Common Task Row Styles (Default)
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  taskRowText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    flexShrink: 1,
  },

  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  categoryTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 3,
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

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    paddingRight: spacing.xs,
  },
  statusContainer: {
    flexDirection: 'column',
  },
  statusText: {
    fontSize: 11,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  offerText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },

  // Map Button
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.backgroundDark,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  viewMapButtonText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
  },

  // User Avatar
  userAvatarContainer: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    alignItems: 'center',
    width: 85,
    zIndex: 2,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundDark,
  },
  posterName: {
    fontSize: 9,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 3,
    maxWidth: 80,
    lineHeight: 11,
    fontWeight: '500',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
    overflow: 'hidden',
  },

  // Navigation Indicator
  navigationIndicator: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },
});
