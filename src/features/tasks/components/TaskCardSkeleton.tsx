import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';

export interface TaskCardSkeletonProps {
  delay?: number;
}

/**
 * 2026 High-Performance Shimmer Skeleton Task Card
 * Matches the exact layout, geometry, and rounded edges of MyToDoo TaskCard
 */
export const TaskCardSkeleton: React.FC<TaskCardSkeletonProps> = ({ delay = 0 }) => {
  const shimmerOpacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation;
    const timeout = setTimeout(() => {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerOpacity, {
            toValue: 0.9,
            duration: 750,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(shimmerOpacity, {
            toValue: 0.35,
            duration: 750,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (animation) animation.stop();
    };
  }, [delay]);

  return (
    <View style={styles.card}>
      {/* Left accent stripe */}
      <Animated.View style={[styles.accentStripe, { opacity: shimmerOpacity }]} />

      <View style={styles.cardBody}>
        {/* Title + Price Row */}
        <View style={styles.headerRow}>
          <View style={styles.titleColumn}>
            <Animated.View style={[styles.titleLineLong, { opacity: shimmerOpacity }]} />
            <Animated.View style={[styles.titleLineShort, { opacity: shimmerOpacity }]} />
          </View>
          <Animated.View style={[styles.priceBadge, { opacity: shimmerOpacity }]} />
        </View>

        {/* Metadata Rows (Location, Date, Time) */}
        <View style={styles.metaContainer}>
          {/* Location row */}
          <View style={styles.metaRow}>
            <Animated.View style={[styles.iconDot, styles.locDot, { opacity: shimmerOpacity }]} />
            <Animated.View style={[styles.metaTextLine, { width: '42%', opacity: shimmerOpacity }]} />
          </View>

          {/* Date row */}
          <View style={styles.metaRow}>
            <Animated.View style={[styles.iconDot, styles.dateDot, { opacity: shimmerOpacity }]} />
            <Animated.View style={[styles.metaTextLine, { width: '32%', opacity: shimmerOpacity }]} />
          </View>

          {/* Time row */}
          <View style={styles.metaRow}>
            <Animated.View style={[styles.iconDot, styles.timeDot, { opacity: shimmerOpacity }]} />
            <Animated.View style={[styles.metaTextLine, { width: '25%', opacity: shimmerOpacity }]} />
          </View>
        </View>

        {/* Category tags row */}
        <View style={styles.tagsRow}>
          <Animated.View style={[styles.tagPill, { width: 95, opacity: shimmerOpacity }]} />
          <Animated.View style={[styles.tagPill, { width: 75, opacity: shimmerOpacity }]} />
        </View>

        {/* Footer: Offers tag + User Avatar placeholder */}
        <View style={styles.footerRow}>
          <Animated.View style={[styles.offerPill, { opacity: shimmerOpacity }]} />
          <View style={styles.userSection}>
            <Animated.View style={[styles.avatarCircle, { opacity: shimmerOpacity }]} />
            <Animated.View style={[styles.userNameLine, { opacity: shimmerOpacity }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

export const TaskCardSkeletonList: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <TaskCardSkeleton key={index} delay={index * 120} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: isTablet ? wp('12.5%') : 0,
    paddingTop: 8,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: isTablet ? 0 : wp('4.5%'),
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EBF0F5',
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#1A2980',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  accentStripe: {
    width: 5,
    backgroundColor: '#3B82F6',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  cardBody: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleColumn: {
    flex: 1,
    marginRight: 12,
    gap: 6,
  },
  titleLineLong: {
    height: 16,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    width: '85%',
  },
  titleLineShort: {
    height: 14,
    borderRadius: 6,
    backgroundColor: '#EDF2F7',
    width: '55%',
  },
  priceBadge: {
    width: 68,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EBF3FE',
  },
  metaContainer: {
    marginBottom: 12,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  locDot: {
    backgroundColor: '#E0F2FE',
  },
  dateDot: {
    backgroundColor: '#D1FAE5',
  },
  timeDot: {
    backgroundColor: '#FFEDD5',
  },
  metaTextLine: {
    height: 11,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tagPill: {
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  offerPill: {
    width: 72,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF1E6',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatarCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1E3A8A',
  },
  userNameLine: {
    width: 50,
    height: 10,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
});

export default TaskCardSkeleton;
