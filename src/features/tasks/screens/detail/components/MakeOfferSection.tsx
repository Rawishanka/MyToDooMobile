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
    backgroundColor: '#f8f9fa',
    padding: isTablet ? wp('3%') : wp('4%'),
    marginBottom: hp('2%'),
    borderRadius: 8,
  },
  makeOfferTitle: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('0.5%'),
  },
  viewersText: {
    fontSize: RFValue(11),
    color: '#666',
    marginBottom: hp('1.5%'),
  },
  makeOfferButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: hp('1.5%'),
    borderRadius: 8,
    alignItems: 'center',
  },
  makeOfferButtonText: {
    color: '#fff',
    fontSize: RFValue(14),
    fontWeight: '600',
  },
});
