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
    <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
        <Ionicons name="arrow-back" size={24} color="#000" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isTablet ? wp('12.5%') : wp('4%'),
    // paddingTop is applied dynamically via insets.top for iOS notch support
    paddingBottom: hp('1.5%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: wp('2%'),
    fontSize: RFValue(14),
    color: '#000',
  },
});
