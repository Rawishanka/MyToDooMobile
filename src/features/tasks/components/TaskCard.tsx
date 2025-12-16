import { cardStyles, colors } from '@/src/shared/theme';
import { formatCurrency, getCurrencySymbol } from '@/src/shared/utils/currency';
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

// Import responsive utilities
import {
    getResponsiveValue,
    hp,
    isTablet,
    RFValue,
    wp
} from '@/src/shared/utils/responsive';

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
  // Helper function to parse location if it's a string
  const parseLocation = (location: any) => {
    if (!location) return null;
    
    // If it's already an object with address, return it
    if (typeof location === 'object' && location.address) {
      return location;
    }
    
    // If it's a string, try to parse it
    if (typeof location === 'string') {
      try {
        const parsed = JSON.parse(location);
        console.log('📍 TaskCard (general): Parsed stringified location:', parsed);
        return parsed;
      } catch {
        // If parsing fails, treat it as plain address string
        console.warn('⚠️ TaskCard (general): Could not parse location string:', location);
        return { address: location, coordinates: {} };
      }
    }
    
    return null;
  };
  
  // Get parsed location
  const parsedLocation = parseLocation(task.location);
  
  // Helper: Get location type with icon
  const getLocationInfo = () => {
    const address = parsedLocation?.address || '';
    // Clean up any JSON remnants from address
    let cleanAddress = address;
    if (typeof address === 'string' && (address.includes('{') || address.includes('"coordinates"'))) {
      console.warn('⚠️ TaskCard (general): Address contains JSON remnants:', address);
      const match = address.match(/"address":"([^"]+)"/);
      if (match) {
        cleanAddress = match[1];
      }
    }
    
    if (cleanAddress.includes(' → ') || cleanAddress.includes(' to ')) {
      return { icon: 'car-outline', text: 'Moving' };
    }
    return { icon: 'location-outline', text: '' }; // Just show icon, address will be displayed elsewhere
  };

  // Helper: Get time preference
  const getTimePreference = () => {
    if (task.dateType === 'before') return 'Before specific date';
    if (task.dateType === 'no-rush') return 'No rush';
    if (task.time && task.time !== 'Anytime') {
      return task.time.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    }
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
  
  // Use task's original currency and formatted budget from backend
  // If backend provides formattedBudget, use it directly
  // Otherwise, format using task's original currency
  const formattedBudget = task.formattedBudget || 
    (task.budget && task.currency ? formatCurrency(task.budget, { code: task.currency, symbol: getCurrencySymbol(task.currency) }) : 
    'Budget not specified');

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
              {(() => {
                const address = parsedLocation?.address || 'Location not specified';
                if (typeof address === 'string' && (address.includes('{') || address.includes('\"coordinates\"'))) {
                  const match = address.match(/\"address\":\"([^\"]+)\"/);
                  return match ? match[1] : address;
                }
                return address;
              })()}
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
              {(() => {
                const address = parsedLocation?.address || 'Location not specified';
                if (typeof address === 'string' && (address.includes('{') || address.includes('\"coordinates\"'))) {
                  const match = address.match(/\"address\":\"([^\"]+)\"/);
                  return match ? match[1] : address;
                }
                return address;
              })()}
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
        <Ionicons name={locationInfo.icon as any} size={RFValue(14)} color={colors.textSecondary} />
        <Text style={styles.taskRowText} numberOfLines={1}>
          {(() => {
            const address = parsedLocation?.address || 'Location not specified';
            if (typeof address === 'string' && (address.includes('{') || address.includes('\"coordinates\"'))) {
              const match = address.match(/\"address\":\"([^\"]+)\"/);
              return match ? match[1] : address;
            }
            return address;
          })()}
        </Text>
      </View>

      {/* Time Preference */}
      <View style={styles.taskRow}>
        <Ionicons name="time-outline" size={RFValue(14)} color={colors.textSecondary} />
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
              : (() => {
                  // Try multiple ways to get offer count
                  const offerCount = task.offerCount || task.offers?.length || 0;
                  
                  // Only log for the first few tasks to avoid spam
                  if (task._id && task.title && Math.random() < 0.1) {
                    console.log('🔍 [Browse TaskCard] Offer count:', {
                      taskId: task._id,
                      title: task.title,
                      offerCount: task.offerCount,
                      offersLength: task.offers?.length,
                      calculatedCount: offerCount
                    });
                  }
                  
                  return offerCount > 0
                    ? `${offerCount} Offer${offerCount !== 1 ? 's' : ''}`
                    : 'Make the first offer';
                })()}
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
          <Ionicons name="map-outline" size={RFValue(9)} color={colors.primary} />
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
        <Ionicons name="chevron-forward" size={RFValue(14)} color={colors.border} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Default Card Styles - RESPONSIVE
  defaultCard: {
    marginHorizontal: isTablet ? wp('-2%') : wp('4%'), // Wider cards on tablets
    marginBottom: hp('1%'),
    position: 'relative',
    paddingRight: isTablet ? wp('10%') : wp('20%'), // More space on phones for avatar
  },

  // Compact Card Styles - RESPONSIVE
  compactCard: {
    marginHorizontal: isTablet ? wp('8%') : wp('4%'),
    marginBottom: hp('0.5%'),
    paddingVertical: hp('1%'),
  },
  compactContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactLeft: {
    flex: 1,
    marginRight: wp('2%'),
  },
  compactTitle: {
    fontSize: RFValue(isTablet ? 13 : 14),
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: hp('0.5%'),
  },
  compactLocation: {
    fontSize: RFValue(isTablet ? 10 : 11),
    color: colors.textSecondary,
  },
  compactRight: {
    alignItems: 'flex-end',
  },
  compactPrice: {
    fontSize: RFValue(isTablet ? 13 : 14),
    fontWeight: '700',
    color: colors.primary,
    marginBottom: hp('0.5%'),
  },
  compactStatus: {
    fontSize: RFValue(isTablet ? 9 : 10),
    fontWeight: '600',
  },

  // Detailed Card Styles - RESPONSIVE
  detailedCard: {
    marginHorizontal: isTablet ? wp('8%') : wp('4%'),
    marginBottom: hp('1%'),
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskInfo: {
    flex: 1,
    marginRight: wp('2%'),
  },
  taskTitle: {
    fontSize: RFValue(isTablet ? 13 : 14),
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: hp('0.5%'),
    lineHeight: RFValue(isTablet ? 16 : 18),
    paddingRight: wp('1%'),
  },
  taskLocation: {
    fontSize: RFValue(isTablet ? 10 : 11),
    color: colors.textSecondary,
    marginBottom: hp('0.5%'),
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
  },
  statusBadge: {
    fontSize: RFValue(10),
    fontWeight: '600',
  },
  taskDate: {
    fontSize: RFValue(10),
    color: colors.textTertiary,
  },
  taskPriceContainer: {
    alignItems: 'flex-end',
  },
  taskPrice: {
    fontSize: RFValue(isTablet ? 15 : 16),
    fontWeight: '700',
    color: colors.primary,
  },

  // Common Task Row Styles (Default) - RESPONSIVE
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
    gap: wp('1.5%'),
    paddingRight: wp('2%'),
  },
  taskRowText: {
    fontSize: RFValue(isTablet ? 10 : 11),
    color: colors.textSecondary,
    flex: 1,
    flexShrink: 1,
  },

  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: wp('1.5%'),
    marginBottom: hp('0.5%'),
  },
  categoryTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.3%'),
    borderRadius: getResponsiveValue(8, 10, 12),
  },
  categoryText: {
    fontSize: RFValue(9),
    color: '#1976d2',
    fontWeight: '500',
  },
  moreCategoriesText: {
    fontSize: RFValue(9),
    color: '#666',
    fontStyle: 'italic',
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp('0.5%'),
    marginBottom: hp('1%'),
    paddingRight: wp('1%'),
  },
  statusContainer: {
    flexDirection: 'column',
  },
  statusText: {
    fontSize: RFValue(isTablet ? 8 : 9),
    color: colors.textTertiary,
    marginBottom: hp('0.2%'),
  },
  offerText: {
    fontSize: RFValue(isTablet ? 10 : 11),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  priceText: {
    fontSize: RFValue(isTablet ? 15 : 16),
    fontWeight: '700',
    color: colors.primary,
  },

  // Map Button - RESPONSIVE
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1%'),
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('2%'),
    backgroundColor: colors.backgroundDark,
    borderRadius: getResponsiveValue(8, 10, 12),
    alignSelf: 'flex-start',
    marginBottom: hp('0.5%'),
  },
  viewMapButtonText: {
    fontSize: RFValue(9),
    color: colors.primary,
    fontWeight: '500',
  },

  // User Avatar - RESPONSIVE
  userAvatarContainer: {
    position: 'absolute',
    top: hp('1%'),
    right: wp('2%'),
    alignItems: 'center',
    width: isTablet ? 80 : wp('20%'),
    zIndex: 2,
  },
  userAvatar: {
    width: isTablet ? 50 : wp('10%'),
    height: isTablet ? 50 : wp('10%'),
    borderRadius: isTablet ? 25 : wp('5%'),
    backgroundColor: colors.backgroundDark,
  },
  posterName: {
    fontSize: RFValue(isTablet ? 9 : 7),
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: hp('0.3%'),
    maxWidth: isTablet ? 75 : wp('18%'),
    lineHeight: RFValue(isTablet ? 11 : 9),
    fontWeight: '500',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: wp('0.5%'),
    paddingVertical: hp('0.1%'),
    borderRadius: getResponsiveValue(2, 3, 4),
    overflow: 'hidden',
  },

  // Navigation Indicator - RESPONSIVE
  navigationIndicator: {
    position: 'absolute',
    bottom: hp('1%'),
    right: wp('2%'),
  },
});
