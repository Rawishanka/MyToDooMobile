import { BRAND_ORANGE, CARD_BG, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';
import React from 'react';
import { useTheme } from '@/src/shared/theme/ThemeContext';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MakeOfferSectionProps {
  onMakeOffer: () => void;
  offerCount?: number;
}

export const MakeOfferSection: React.FC<MakeOfferSectionProps> = ({ onMakeOffer, offerCount = 0 }) => {
  const { isDarkMode } = useTheme();
  // Generate appropriate text based on offer count
  const getOfferText = () => {
    if (offerCount === 0) {
      return "Be the first to make an offer!";
    } else if (offerCount === 1) {
      return "1 offer has been submitted";
    } else {
      return `${offerCount} offers have been submitted`;
    }
  };

  return (
    <View style={[styles.makeOfferSection, isDarkMode && { backgroundColor: "#1E293B", borderWidth: 1, borderColor: "#334155" }]}>
      <Text style={[styles.makeOfferTitle, isDarkMode && { color: "#F8FAFC" }]}>Make an offer now</Text>
      <Text style={[styles.viewersText, isDarkMode && { color: "#94A3B8" }]}>{getOfferText()}</Text>

      <TouchableOpacity style={styles.makeOfferButton} onPress={onMakeOffer}>
        <Text style={styles.makeOfferButtonText}>Make offer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  makeOfferSection: {
    backgroundColor: CARD_BG,
    padding: 18,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#001A66',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  makeOfferTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: CARD_TEXT,
    marginBottom: 4,
  },
  viewersText: {
    fontSize: 13,
    lineHeight: 18,
    color: CARD_TEXT_MUTED,
    marginBottom: 14,
  },
  makeOfferButton: {
    backgroundColor: BRAND_ORANGE,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND_ORANGE,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  makeOfferButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
