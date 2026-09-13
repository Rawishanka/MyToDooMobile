import { BRAND_BLUE } from '@/src/shared/theme/brandColors';
import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const DetailHeader: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 8 : 46 }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader} activeOpacity={0.8}>
        <View style={styles.backIconCircle}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Task Details</Text>
      <View style={styles.rightPlaceholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isTablet ? wp('12.5%') : wp('4%'),
    paddingBottom: hp('1.5%'),
    backgroundColor: BRAND_BLUE,
    borderBottomWidth: 0,
  },
  backButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rightPlaceholder: {
    width: 44,
  },
});
