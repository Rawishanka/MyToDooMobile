import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MakeOfferSectionProps {
  onMakeOffer: () => void;
}

export const MakeOfferSection: React.FC<MakeOfferSectionProps> = ({ onMakeOffer }) => {
  return (
    <View style={styles.makeOfferSection}>
      <Text style={styles.makeOfferTitle}>Make an offer now</Text>
      <Text style={styles.viewersText}>31 Taskers have viewed this task already</Text>

      <TouchableOpacity style={styles.makeOfferButton} onPress={onMakeOffer}>
        <Text style={styles.makeOfferButtonText}>Make offer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  makeOfferSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  makeOfferTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  viewersText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  makeOfferButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  makeOfferButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
