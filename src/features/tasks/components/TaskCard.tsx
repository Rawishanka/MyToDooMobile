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
import { BRAND_ORANGE } from '@/src/shared/theme/brandColors';
import { HS, homeCard } from '@/src/shared/theme/homeStyle';

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
    if (!isDarkMode) {
      // Home-style: readable semantic tones on the white card
      switch (status) {
        case 'completed':
          return HS.greenText;
        case 'assigned':
          return HS.blue;
        case 'open':
          return HS.amberText;
        default:
          return HS.muted;
      }
    }
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
        style={[cardStyles.card, styles.compactCard, !isDarkMode && styles.blueCard]}
        activeOpacity={0.7}
        onPress={() => onPress(task._id)}
      >
        <View style={styles.compactContent}>
          <View style={styles.compactLeft}>
            <Text style={[styles.compactTitle, !isDarkMode && styles.lightTextWhite]} numberOfLines={1}>
              {task.title}
            </Text>
            <Text style={[styles.compactLocation, !isDarkMode && styles.lightTextMuted]} numberOfLines={1}>
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
            <Text style={[styles.compactPrice, !isDarkMode && styles.lightPrice]}>{formattedBudget}</Text>
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
        style={[cardStyles.taskCard, styles.detailedCard, !isDarkMode && styles.blueCard]}
        activeOpacity={0.7}
        onPress={() => onPress(task._id)}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskInfo}>
            <Text style={[styles.taskTitle, !isDarkMode && styles.lightTextWhite]} numberOfLines={2}>
              {task.title}
            </Text>
            <Text style={[styles.taskLocation, !isDarkMode && styles.lightTextMuted]} numberOfLines={1}>
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
                <Text style={[styles.taskDate, !isDarkMode && styles.lightTextMuted]}>
                  {new Date(task.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.taskPriceContainer}>
            <Text style={[styles.taskPrice, !isDarkMode && styles.lightPrice]}>{formattedBudget}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Default variant (for browse/explore screens)
  return (
    <TouchableOpacity
      style={[cardStyles.taskCard, styles.defaultCard, isDarkMode ? { backgroundColor: '#1E293B', borderColor: '#334155', shadowColor: '#000000', shadowOpacity: 0.25 } : styles.blueCard]}
      activeOpacity={0.75}
      onPress={() => onPress(task._id)}
    >
      {/* Left accent strip */}
      <View style={[styles.accentStrip, !isDarkMode && { backgroundColor: HS.blue }]} />

      <View style={styles.cardBody}>
        {/* Header row: Title + Price */}
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.taskTitle, isDarkMode ? { color: '#F8FAFC' } : styles.lightTextWhite]} numberOfLines={2}>
            {task.title}
          </Text>
          <View style={[styles.priceBubble, !isDarkMode && styles.priceBubbleLight]}>
            <Text style={[styles.priceText, !isDarkMode && { color: HS.blue }]}>{formattedBudget}</Text>
          </View>
        </View>

        {/* Metadata with Logo-inspired colored badges */}
        <View style={styles.metaContainer}>
          {/* Location */}
          <View style={[styles.taskRow, styles.locationRow, !isDarkMode && styles.rowChipLight]}>
            <View style={[styles.iconBadge, styles.locationIconBadge, !isDarkMode && styles.iconBadgeLight]}>
              <Ionicons
                name={(locationInfo.icon === 'car-outline' ? 'car' : 'location-sharp') as any}
                size={14}
                color={isDarkMode ? '#0284C7' : HS.blue}
              />
            </View>
            <Text style={[styles.taskRowText, isDarkMode ? { color: '#94A3B8' } : styles.lightTextBody]} numberOfLines={1}>
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
            <View style={[styles.taskRow, !isDarkMode && styles.rowChipLight]}>
              <View style={[styles.iconBadge, styles.dateIconBadge, !isDarkMode && styles.iconBadgeLight]}>
                <Ionicons name="calendar" size={14} color={isDarkMode ? '#10B981' : HS.blue} />
              </View>
              <Text numberOfLines={1} style={[styles.taskRowText, styles.dateRowText, isDarkMode ? { color: '#94A3B8' } : styles.lightTextBody]}>{dateDisplay}</Text>
            </View>
          )}

          {/* Time / Flexibility */}
          <View style={[styles.taskRow, !isDarkMode && styles.rowChipLight]}>
            <View style={[styles.iconBadge, styles.timeIconBadge, !isDarkMode && styles.iconBadgeLight]}>
              <Ionicons name="time" size={14} color={isDarkMode ? '#FF6B00' : HS.blue} />
            </View>
            <Text numberOfLines={1} style={[styles.taskRowText, isDarkMode ? { color: '#94A3B8' } : styles.lightTextBody]}>{getTimePreference()}</Text>
          </View>
        </View>

        {/* Categories */}
        {task.categories && Array.isArray(task.categories) && task.categories.length > 0 && (
          <View style={styles.categoriesRow}>
            {task.categories.slice(0, 2).map((category, index) => (
              <View key={index} style={[styles.categoryTag, !isDarkMode && styles.categoryTagLight]}>
                <View style={[styles.categoryDot, !isDarkMode && { backgroundColor: HS.blue }]} />
                <Text style={[styles.categoryText, !isDarkMode && styles.lightTextBlue]}>{category}</Text>
              </View>
            ))}
            {task.categories.length > 2 && (
              <View style={[styles.moreCategoriesTag, !isDarkMode && styles.categoryTagLight]}>
                <Text style={[styles.moreCategoriesText, !isDarkMode && styles.lightTextBlue]}>
                  +{task.categories.length - 2}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Bottom: Dynamic Offer / Status chip + Poster */}
        <View style={[styles.bottomRow, !isDarkMode && { borderTopColor: HS.cardBorder }]}>
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
                <View style={[styles.statusChip, isDarkMode ? { backgroundColor: `${statusColor}14`, borderColor: `${statusColor}30` } : { backgroundColor: HS.tint, borderColor: HS.tintBorder }]}>
                  <Ionicons name="checkmark-circle" size={14} color={statusColor} />
                  <Text style={[styles.statusChipText, { color: statusColor }]}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ').replace('-', ' ')}
                  </Text>
                </View>
              );
            }

            const offerCount = task.offerCount || task.offers?.length || 0;
            if (offerCount > 0) {
              return (
                <View style={[styles.offerChipActive, !isDarkMode && styles.offerChipLight]}>
                  <Ionicons name="pricetag" size={13} color={isDarkMode ? '#FF6B00' : '#FFFFFF'} />
                  <Text style={[styles.offerTextActive, !isDarkMode && styles.offerTextLight]}>
                    {offerCount} {offerCount === 1 ? 'Offer' : 'Offers'}
                  </Text>
                </View>
              );
            }

            return (
              <View style={[styles.firstOfferChip, !isDarkMode && styles.firstOfferChipLight]}>
                <Ionicons name="sparkles" size={13} color={isDarkMode ? '#10B981' : HS.greenText} />
                <Text style={[styles.firstOfferText, !isDarkMode && { color: HS.greenText }]}>Be first to offer</Text>
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
              style={[styles.userAvatar, !isDarkMode && { borderColor: HS.tintBorder }]}
            />
            <Text style={[styles.posterName, isDarkMode ? { color: '#94A3B8' } : styles.lightTextBody]} numberOfLines={1}>
              {formatUserName(task.createdBy?.firstName, task.createdBy?.lastName)}
            </Text>
          </View>
        </View>
      </View>

      {/* Navigation indicator */}
      <View style={styles.navigationIndicator}>
        <View style={[styles.chevronCircle, !isDarkMode && styles.chevronCircleLight]}>
          <Ionicons name="chevron-forward" size={14} color={isDarkMode ? '#94A3B8' : HS.blue} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Light-mode blue card helpers (dark mode keeps its own surfaces)
  blueCard: {
    ...homeCard,
  },
  lightTextWhite: { color: HS.navy },
  lightTextMuted: { color: HS.muted },
  lightTextBody: { color: HS.text },
  lightTextBlue: { color: HS.blue },
  lightPrice: { color: HS.blue },
  priceBubbleLight: {
    backgroundColor: HS.tint,
    borderColor: HS.tintBorder,
  },
  iconBadgeLight: { backgroundColor: 'transparent' },
  rowChipLight: { backgroundColor: HS.tint },
  categoryTagLight: {
    backgroundColor: HS.tint,
    borderColor: HS.tintBorder,
  },
  offerChipLight: {
    backgroundColor: BRAND_ORANGE,
    borderColor: BRAND_ORANGE,
  },
  offerTextLight: { color: '#FFFFFF' },
  firstOfferChipLight: {
    backgroundColor: HS.greenBg,
    borderColor: HS.greenBg,
  },
  chevronCircleLight: {
    backgroundColor: HS.tint,
    borderColor: HS.tintBorder,
  },

  // Default Card Styles - 2026 PREMIUM (COMPACT & SLEEK)
  defaultCard: {
    marginHorizontal: isTablet ? wp('-2%') : wp('4%'),
    marginBottom: 12,
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
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
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
    paddingRight: 28, // Space for chevron
  },
  priceBubble: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  priceText: {
    fontSize: RFValue(isTablet ? 14 : 15),
    fontWeight: '800',
    color: '#003399',
    letterSpacing: 0.2,
  },

  // Compact Card Styles - RESPONSIVE
  compactCard: {
    marginHorizontal: isTablet ? wp('8%') : wp('4%'),
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
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
    marginBottom: 14,
    padding: 16,
    borderRadius: 20,
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
    fontSize: RFValue(isTablet ? 15 : 16),
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    lineHeight: RFValue(isTablet ? 19 : 21),
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 26,
    paddingRight: 10,
    borderRadius: 13,
    backgroundColor: 'rgba(148,163,184,0.12)',
    flexShrink: 1,
    maxWidth: '100%',
  },
  locationRow: {
    flexShrink: 1,
  },
  iconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
    fontSize: RFValue(isTablet ? 12 : 12.5),
    color: '#475569',
    fontWeight: '500',
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
    gap: 6,
    marginBottom: 8,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#0284C7',
  },
  categoryText: {
    fontSize: RFValue(11),
    color: '#334155',
    fontWeight: '600',
  },
  moreCategoriesTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  moreCategoriesText: {
    fontSize: RFValue(11),
    color: '#64748B',
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
    paddingTop: 8,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  offerTextActive: {
    fontSize: RFValue(isTablet ? 11.5 : 12),
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  firstOfferText: {
    fontSize: RFValue(isTablet ? 11.5 : 12),
    color: '#059669',
    fontWeight: '600',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusChipText: {
    fontSize: RFValue(isTablet ? 11.5 : 12),
    fontWeight: '700',
  },
  posterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  userAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  posterName: {
    fontSize: RFValue(isTablet ? 12 : 13),
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
    top: 12,
    right: 10,
  },
  chevronCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
