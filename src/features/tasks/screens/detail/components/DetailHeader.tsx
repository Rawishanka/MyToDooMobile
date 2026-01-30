import { getIsTablet, hp, RFValue, wp } from '@/src/shared/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

export const DetailHeader: React.FC = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isTablet = useMemo(() => getIsTablet(width, height), [width, height]);

  return (
    <View style={[styles.header, isTablet && { paddingHorizontal: wp('12.5%') }]}>
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
    paddingHorizontal: wp('4%'),
    paddingTop: 50,
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
