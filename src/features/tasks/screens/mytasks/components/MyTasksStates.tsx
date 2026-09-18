import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading tasks...' }: LoadingStateProps) {
  const { isDarkMode } = useTheme();
  return (
    <View style={[styles.loadingContainer, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <ActivityIndicator size="large" color={isDarkMode ? '#38BDF8' : '#007bff'} />
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
      <Ionicons name="document-outline" size={64} color={isDarkMode ? '#475569' : '#ccc'} />
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
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: RFValue(20),
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: RFValue(16),
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
});
