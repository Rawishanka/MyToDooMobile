import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TabsSectionProps {
  activeTab: 'offers' | 'questions';
  onTabChange: (tab: 'offers' | 'questions') => void;
}

export const TabsSection: React.FC<TabsSectionProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.tabs}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'offers' && styles.activeTab]}
        onPress={() => onTabChange('offers')}
      >
        <Text style={[styles.tabText, activeTab === 'offers' && styles.activeTabText]}>
          Offers
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'questions' && styles.activeTab]}
        onPress={() => onTabChange('questions')}
      >
        <Text style={[styles.tabText, activeTab === 'questions' && styles.activeTabText]}>
          Questions
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});
