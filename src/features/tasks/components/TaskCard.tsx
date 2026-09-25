import { cardStyles, colors, useTheme } from '@/src/shared/theme';
import { formatCurrency, getCurrencySymbol } from '@/src/shared/utils/currency';
import { resolveTaskBudget } from '@/src/shared/utils/resolveTaskBudget';
import { formatUserName, formatAvatarName } from '@/src/utils/formatUserName';
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
  const { isDarkMode } = useTheme();
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

  // Helper: Format date for display
  const formatTaskDate = (date: string | undefined) => {
    if (!date) return null;
    try {
      const dateObj = new Date(date);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Reset hours for date comparison
      today.setHours(0, 0, 0, 0);
      tomorrow.setHours(0, 0, 0, 0);
      const compareDate = new Date(dateObj);
      compareDate.setHours(0, 0, 0, 0);
      
      if (compareDate.getTime() === today.getTime()) {
        return 'Today';
      } else if (compareDate.getTime() === tomorrow.getTime()) {
        return 'Tomorrow';
      } else {
        return dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: dateObj.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch {
      return null;
    }
  };

  // Helper: Get date display text
  const getDateDisplay = () => {
    if (!task.dateRange) return null;
    
    const { start, end } = task.dateRange;
    const dateType = task.dateType?.toLowerCase();
    
    if (dateType === 'doneby' && end) {
      // "Before" or "By" specific date
      const formattedDate = formatTaskDate(end);
      return formattedDate ? `By ${formattedDate}` : null;
    } else if (dateType === 'doneon' && start) {
      // "On" specific date
      const formattedDate = formatTaskDate(start);
      return formattedDate ? `On ${formattedDate}` : null;
    } else if (dateType === 'easy' || dateType === 'flexible') {
      // Flexible - no specific date
      return null;
    }
    
    return null;
  };

  const dateDisplay = getDateDisplay();

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
  const taskBudget = resolveTaskBudget(task);
  const formattedBudget = task.formattedBudget || 
    (taskBudget && task.currency ? formatCurrency(taskBudget, { code: task.currency, symbol: getCurrencySymbol(task.currency) }) : 
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
      style={[cardStyles.taskCard, styles.defaultCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
      activeOpacity={0.75}
      onPress={() => onPress(task._id)}
    >
      {/* Left accent strip */}
      <View style={styles.accentStrip} />

      <View style={styles.cardBody}>
        {/* Header row: Title + Price */}
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.taskTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={2}>
            {task.title}
          </Text>
          <View style={styles.priceBubble}>
            <Text style={styles.priceText}>{formattedBudget}</Text>
          </View>
        </View>

        {/* Metadata with Logo-inspired colored badges */}
        <View style={styles.metaContainer}>
          {/* Location */}
          <View style={styles.taskRow}>
            <View style={[styles.iconBadge, styles.locationIconBadge]}>
              <Ionicons
                name={(locationInfo.icon === 'car-outline' ? 'car' : 'location-sharp') as any}
                size={RFValue(11)}
                color="#0284C7"
              />
            </View>
            <Text style={[styles.taskRowText, isDarkMode && { color: '#94A3B8' }]} numberOfLines={1}>
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

          {/* Date Display - Show when specific date is set */}
          {dateDisplay && (
            <View style={styles.taskRow}>
              <View style={[styles.iconBadge, styles.dateIconBadge]}>
                <Ionicons name="calendar" size={RFValue(11)} color="#10B981" />
              </View>
              <Text style={[styles.taskRowText, styles.dateRowText, isDarkMode && { color: '#94A3B8' }]}>{dateDisplay}</Text>
            </View>
          )}

          {/* Time / Flexibility */}
          <View style={styles.taskRow}>
            <View style={[styles.iconBadge, styles.timeIconBadge]}>
              <Ionicons name="time" size={RFValue(11)} color="#FF6B00" />
            </View>
            <Text style={[styles.taskRowText, isDarkMode && { color: '#94A3B8' }]}>{getTimePreference()}</Text>
          </View>
        </View>

        {/* Categories */}
        {task.categories && Array.isArray(task.categories) && task.categories.length > 0 && (
          <View style={styles.categoriesRow}>
            {task.categories.slice(0, 2).map((category, index) => (
              <View key={index} style={styles.categoryTag}>
                <View style={styles.categoryDot} />
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            ))}
            {task.categories.length > 2 && (
              <View style={styles.moreCategoriesTag}>
                <Text style={styles.moreCategoriesText}>
                  +{task.categories.length - 2}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Bottom: Dynamic Offer / Status chip + Poster */}
        <View style={styles.bottomRow}>
          {/* Dynamic Offer Chip */}
          {(() => {
            const isAcceptedOrComplete =
              task.status === 'accepted' ||
              task.status === 'completed' ||
              task.status === 'assigned' ||
              task.status === 'in_progress' ||
              task.status === 'in-progress';

            if (isAcceptedOrComplete) {
              const statusColor = getStatusColor(task.status);
              return (
                <View style={[styles.statusChip, { backgroundColor: `${statusColor}14`, borderColor: `${statusColor}30` }]}>
                  <Ionicons name="checkmark-circle" size={RFValue(11)} color={statusColor} />
                  <Text style={[styles.statusChipText, { color: statusColor }]}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ').replace('-', ' ')}
                  </Text>
                </View>
              );
            }

            const offerCount = task.offerCount || task.offers?.length || 0;
            if (offerCount > 0) {
              return (
                <View style={styles.offerChipActive}>
                  <Ionicons name="pricetag" size={RFValue(10)} color="#FF6B00" />
                  <Text style={styles.offerTextActive}>
                    {offerCount} {offerCount === 1 ? 'Offer' : 'Offers'}
                  </Text>
                </View>
              );
            }

            return (
              <View style={styles.firstOfferChip}>
                <Ionicons name="sparkles" size={RFValue(10)} color="#10B981" />
                <Text style={styles.firstOfferText}>Be first to offer</Text>
              </View>
            );
          })()}

          {/* Poster */}
          <View style={styles.posterRow}>
            <Image
              source={{
                uri: task.createdBy?.avatar ||
                     task.createdBy?.profilePicture ||
                     `https://ui-avatars.com/api/?name=${formatAvatarName(task.createdBy?.firstName, task.createdBy?.lastName)}&background=003399&color=fff&size=80`,
              }}
              style={styles.userAvatar}
            />
            <Text style={[styles.posterName, isDarkMode && { color: '#94A3B8' }]} numberOfLines={1}>
              {formatUserName(task.createdBy?.firstName, task.createdBy?.lastName)}
            </Text>
          </View>
        </View>
      </View>

      {/* Navigation indicator */}
      <View style={styles.navigationIndicator}>
        <View style={styles.chevronCircle}>
          <Ionicons name="chevron-forward" size={RFValue(11)} color="#94A3B8" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Default Card Styles - 2026 PREMIUM (COMPACT & SLEEK)
  defaultCard: {
    marginHorizontal: isTablet ? wp('-2%') : wp('4%'),
    marginBottom: 10,
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#003399',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  accentStrip: {
    width: 4,
    backgroundColor: '#003399',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    paddingRight: wp('2%'),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 5,
    paddingRight: 24, // Space for chevron
  },
  priceBubble: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  priceText: {
    fontSize: RFValue(isTablet ? 13.5 : 14.5),
    fontWeight: '800',
    color: '#003399',
    letterSpacing: 0.2,
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

  // Common Task Row Styles (Default) - COMPACT & 2026 SLEEK
  taskTitle: {
    fontSize: RFValue(isTablet ? 13.5 : 14.5),
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    lineHeight: RFValue(isTablet ? 17.5 : 19.5),
  },
  metaContainer: {
    gap: 3.5,
    marginBottom: 4,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  iconBadge: {
    width: 20,
    height: 20,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  locationIconBadge: {
    backgroundColor: '#EFF6FF',
  },
  dateIconBadge: {
    backgroundColor: '#ECFDF5',
  },
  timeIconBadge: {
    backgroundColor: '#FFF7ED',
  },
  taskRowText: {
    fontSize: RFValue(isTablet ? 10.5 : 11.5),
    color: '#475569',
    fontWeight: '500',
    flex: 1,
    flexShrink: 1,
  },
  dateRowText: {
    color: '#047857',
    fontWeight: '600',
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
    marginTop: 2,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 7.5,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  categoryDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: '#0284C7',
  },
  categoryText: {
    fontSize: RFValue(9),
    color: '#334155',
    fontWeight: '600',
  },
  moreCategoriesTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5.5,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  moreCategoriesText: {
    fontSize: RFValue(8.5),
    color: '#64748B',
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  offerChipActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF4ED',
    borderWidth: 1,
    borderColor: '#FFE2D1',
    paddingHorizontal: 8.5,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  offerTextActive: {
    fontSize: RFValue(isTablet ? 10 : 10.5),
    color: '#EA580C',
    fontWeight: '700',
  },
  firstOfferChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    paddingHorizontal: 8.5,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  firstOfferText: {
    fontSize: RFValue(isTablet ? 10 : 10.5),
    color: '#059669',
    fontWeight: '600',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 8.5,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  statusChipText: {
    fontSize: RFValue(isTablet ? 10 : 10.5),
    fontWeight: '700',
  },
  posterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  userAvatar: {
    width: isTablet ? 34 : 32,
    height: isTablet ? 34 : 32,
    borderRadius: isTablet ? 17 : 16,
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  posterName: {
    fontSize: RFValue(isTablet ? 10.5 : 11.5),
    color: '#334155',
    fontWeight: '600',
    flexShrink: 1,
    maxWidth: isTablet ? 130 : 110,
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

  // Navigation Indicator - RESPONSIVE
  navigationIndicator: {
    position: 'absolute',
    top: 10,
    right: 12,
  },
  chevronCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
