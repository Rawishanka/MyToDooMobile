import { RFValue } from '@/src/shared/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

export interface VerifiedBadgesData {
  mobile?: boolean;
  email?: boolean;
  abn?: boolean;
  stripe?: boolean;
  id?: boolean;
}

interface VerifiedBadgesProps {
  badges?: VerifiedBadgesData | null;
  /** 'center' for profile-style headers, 'start' inside cards */
  align?: 'center' | 'start';
  style?: StyleProp<ViewStyle>;
}

/** Verification chips (same look as the Account profile header). Renders nothing when badges are unknown. */
export const VerifiedBadges: React.FC<VerifiedBadgesProps> = ({ badges, align = 'start', style }) => {
  if (!badges) return null;
  const items = [
    { key: 'mobile', label: 'Mobile', on: !!badges.mobile },
    { key: 'email', label: 'Email', on: !!badges.email },
    { key: 'abn', label: 'ABN', on: !!badges.abn },
    { key: 'stripe', label: 'Stripe', on: !!badges.stripe },
    { key: 'id', label: 'ID Verified', on: !!badges.id },
  ];
  return (
    <View style={[styles.row, align === 'center' && styles.center, style]}>
      {items.map((b) => (
        <View key={b.key} style={[styles.chip, b.on ? styles.chipOn : styles.chipOff]}>
          <Ionicons
            name={b.on ? 'shield-checkmark' : 'shield-outline'}
            size={13}
            color={b.on ? '#4ADE80' : 'rgba(255,255,255,0.65)'}
          />
          <Text style={[styles.text, b.on ? styles.textOn : styles.textOff]}>
            {b.label}
            {b.on ? ' ✓' : ''}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  center: { justifyContent: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  chipOn: {
    backgroundColor: 'rgba(74, 222, 128, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.5)',
  },
  chipOff: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  text: { fontSize: RFValue(11), color: '#fff' },
  textOn: { fontWeight: '700' },
  textOff: { color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
});
