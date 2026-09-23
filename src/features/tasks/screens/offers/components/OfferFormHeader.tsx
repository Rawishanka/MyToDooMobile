import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from '@/src/shared/utils/responsive';
import { BRAND_BLUE } from '@/src/shared/theme/brandColors';

export const OfferFormHeader: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
      <TouchableOpacity
        style={styles.backIcon}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Make an Offer</Text>
      <View style={styles.placeholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    // paddingTop is applied dynamically via insets.top for iOS notch support
    paddingBottom: 15,
    backgroundColor: BRAND_BLUE,
    borderBottomWidth: 0,
  },
  backIcon: {
    padding: 5,
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 34,
  },
});
