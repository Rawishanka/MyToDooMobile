import React from 'react';
import { useTheme } from '@/src/shared/theme';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { Ionicons } from '@expo/vector-icons';

interface TabsSectionProps {
  activeTab: 'offers' | 'questions';
  onTabChange: (tab: 'offers' | 'questions') => void;
}

export const TabsSection: React.FC<TabsSectionProps> = ({ activeTab, onTabChange }) => {
  const { isDarkMode } = useTheme();
  return (
    <View style={[styles.tabsContainer, isDarkMode && { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' }]}>
      <TouchableOpacity
        style={[styles.tabBtn, activeTab === 'offers' && styles.activeTabBtn, isDarkMode && activeTab === 'offers' && { backgroundColor: '#1E293B' }]}
        onPress={() => onTabChange('offers')}
        activeOpacity={0.85}
      >
        <Ionicons
          name="pricetag-outline"
          size={16}
          color={activeTab === 'offers' ? (isDarkMode ? '#38BDF8' : '#003399') : (isDarkMode ? '#94A3B8' : '#64748B')}
        />
        <Text style={[styles.tabText, isDarkMode && { color: '#94A3B8' }, activeTab === 'offers' && (isDarkMode ? { color: '#38BDF8', fontWeight: '700' } : styles.activeTabText)]}>
          Offers
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabBtn, activeTab === 'questions' && styles.activeTabBtn, isDarkMode && activeTab === 'questions' && { backgroundColor: '#1E293B' }]}
        onPress={() => onTabChange('questions')}
        activeOpacity={0.85}
      >
        <Ionicons
          name="chatbubbles-outline"
          size={16}
          color={activeTab === 'questions' ? (isDarkMode ? '#38BDF8' : '#003399') : (isDarkMode ? '#94A3B8' : '#64748B')}
        />
        <Text style={[styles.tabText, isDarkMode && { color: '#94A3B8' }, activeTab === 'questions' && (isDarkMode ? { color: '#38BDF8', fontWeight: '700' } : styles.activeTabText)]}>
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
