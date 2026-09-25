import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';
import { HS } from '@/src/shared/theme/homeStyle';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading tasks...' }: LoadingStateProps) {
  const { isDarkMode } = useTheme();
  return (
    <View style={[styles.loadingContainer, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <ActivityIndicator size="large" color={isDarkMode ? '#38BDF8' : HS.blue} />
      <Text style={[styles.loadingText, isDarkMode && { color: '#94A3B8' }]}>{message}</Text>
    </View>
  );
}

interface EmptyStateProps {
  searchText: string;
  selectedFilter: string;
  onRefresh: () => void;
}

export function EmptyState({ searchText, selectedFilter, onRefresh }: EmptyStateProps) {
  const { isDarkMode } = useTheme();
  return (
    <View style={[styles.emptyContainer, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <View style={[styles.emptyCircle, isDarkMode && { backgroundColor: '#1E293B' }]}>
        <Ionicons name="document-text-outline" size={44} color={isDarkMode ? '#94A3B8' : HS.blue} />
      </View>
      <Text style={[styles.emptyTitle, isDarkMode && { color: '#F8FAFC' }]}>No tasks found</Text>
      <Text style={[styles.emptySubtitle, isDarkMode && { color: '#94A3B8' }]}>
        {searchText
          ? `No tasks match "${searchText}"`
          : `You don't have any ${selectedFilter.toLowerCase()} yet`}
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: RFValue(16),
    color: HS.muted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: HS.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: HS.navy,
    marginTop: 20,
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
    backgroundColor: '#ff6b35',
    paddingHorizontal: 32,
    height: 48,
    justifyContent: 'center',
    borderRadius: 14,
    shadowColor: '#ff6b35',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '700',
  },
});
