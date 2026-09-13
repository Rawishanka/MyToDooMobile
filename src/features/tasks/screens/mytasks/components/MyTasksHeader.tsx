import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, hp('1%')) }]}>
      {/* Left spacer to balance the right icons */}
      <View style={styles.headerSpacer} />

      {/* Centered Title */}
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>My Tasks</Text>
      </View>

      <View style={styles.headerIcons}>
        <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
          <Ionicons name="search-outline" size={isTablet ? 26 : 20} color="#fff" />
        </TouchableOpacity>
        
        {/* Payment Summary Button */}
        <TouchableOpacity
          onPress={() => router.push('/payment-summary' as any)}
          style={styles.iconButton}
        >
          <Ionicons name="card-outline" size={isTablet ? 26 : 20} color="#FF7A00" />
        </TouchableOpacity>
        
        {/* Notification Button */}
        <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={isTablet ? 26 : 20} color="#fff" />
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
    paddingHorizontal: isTablet ? wp('12.5%') : wp('4%'),
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: hp('1.5%'),
    backgroundColor: '#1A2980',
  },
  headerSpacer: {
    flex: 1,
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcons: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerTitle: {
    fontSize: RFValue(isTablet ? 22 : 18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  iconButton: {
    marginLeft: isTablet ? wp('3%') : wp('4%'),
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF7A00',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: RFValue(isTablet ? 13 : 12),
    fontWeight: 'bold',
  },
});
