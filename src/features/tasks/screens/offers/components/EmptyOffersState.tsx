import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BRAND_ORANGE } from '@/src/shared/theme/brandColors';
import { HS } from '@/src/shared/theme/homeStyle';
import { RFValue } from '@/src/shared/utils/responsive';

interface EmptyOffersStateProps {
  onRefresh: () => void;
}

export default function EmptyOffersState({ onRefresh }: EmptyOffersStateProps) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.iconCircle}>
        <Ionicons name="clipboard-outline" size={44} color={HS.blue} />
      </View>
      <Text style={styles.emptyTitle}>No offers yet</Text>
      <Text style={styles.emptySubtitle}>
        Your task is live! Offers will appear here when taskers make bids.
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: HS.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: HS.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: RFValue(16),
    color: HS.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: BRAND_ORANGE,
    paddingHorizontal: 32,
    height: 50,
    justifyContent: 'center',
    borderRadius: 14,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
