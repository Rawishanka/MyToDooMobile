import { CARD_BG, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
import React from 'react';
import { useTheme } from '@/src/shared/theme';
import { StyleSheet, Text, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';

export const TipsSection: React.FC = () => {
  const { isDarkMode } = useTheme();
  return (
    <View style={[styles.tipsContainer, isDarkMode && { backgroundColor: "#1E293B", borderWidth: 1, borderColor: "#334155" }]}>
      <Text style={[styles.tipsTitle, isDarkMode && { color: "#38BDF8" }]}>💡 Tips for a great offer:</Text>
      <Text style={[styles.tip, isDarkMode && { color: "#94A3B8" }]}>• Be clear about what's included in your price</Text>
      <Text style={[styles.tip, isDarkMode && { color: "#94A3B8" }]}>• Mention your relevant experience</Text>
      <Text style={[styles.tip, isDarkMode && { color: "#94A3B8" }]}>• Include your availability</Text>
      <Text style={[styles.tip, isDarkMode && { color: "#94A3B8" }]}>• Ask questions if anything is unclear</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tipsContainer: {
    backgroundColor: CARD_BG,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: CARD_TEXT,
    marginBottom: 8,
  },
  tip: {
    fontSize: RFValue(12),
    color: CARD_TEXT_MUTED,
    marginBottom: 4,
  },
});
