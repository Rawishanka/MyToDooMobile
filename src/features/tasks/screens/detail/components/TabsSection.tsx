import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { Ionicons } from '@expo/vector-icons';

interface TabsSectionProps {
  activeTab: 'offers' | 'questions';
  onTabChange: (tab: 'offers' | 'questions') => void;
}

export const TabsSection: React.FC<TabsSectionProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tabBtn, activeTab === 'offers' && styles.activeTabBtn]}
        onPress={() => onTabChange('offers')}
        activeOpacity={0.85}
      >
        <Ionicons
          name="pricetag-outline"
          size={16}
          color={activeTab === 'offers' ? '#003399' : '#64748B'}
        />
        <Text style={[styles.tabText, activeTab === 'offers' && styles.activeTabText]}>
          Offers
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabBtn, activeTab === 'questions' && styles.activeTabBtn]}
        onPress={() => onTabChange('questions')}
        activeOpacity={0.85}
      >
        <Ionicons
          name="chatbubbles-outline"
          size={16}
          color={activeTab === 'questions' ? '#003399' : '#64748B'}
        />
        <Text style={[styles.tabText, activeTab === 'questions' && styles.activeTabText]}>
          Questions
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  activeTabBtn: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: RFValue(14),
    color: '#64748B',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#003399',
    fontWeight: '700',
  },
});
