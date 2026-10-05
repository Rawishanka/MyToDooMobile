import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/shared/theme';
import { BlueBackdrop, LightHeader, SectionCard } from '@/src/shared/components/custom_components/lightCard';

export default function TaskAlerts({ onBack }) {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [keywords, setKeywords] = useState(['']);

  const addKeyword = () => {
    Alert.prompt(
      'Add Keyword',
      'Enter a keyword for task alerts',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Add',
          onPress: (keyword) => {
            if (keyword && keyword.trim()) {
              setKeywords([...keywords.filter((k) => k !== ''), keyword.trim()]);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const removeKeyword = (index) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords.length > 0 ? newKeywords : ['']);
  };

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <BlueBackdrop />
      <LightHeader title="Task Alerts" onBack={onBack} />
      <ScrollView keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionCard title="Keyword task alerts" icon="notifications-outline">
          <Text style={[styles.description, isDarkMode && { color: '#94A3B8' }]}>
            Add your own keywords and get notified for matching tasks. It helps you make offers early and stay ahead of the competition.
          </Text>

          <TouchableOpacity style={styles.addButton} onPress={addKeyword} activeOpacity={0.85}>
            <Ionicons name="add" size={18} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.addButtonText}>Add keyword</Text>
          </TouchableOpacity>

          {keywords.filter((k) => k !== '').length > 0 && (
            <View style={styles.keywordsContainer}>
              {keywords
                .filter((k) => k !== '')
                .map((keyword, index) => (
                  <View
                    key={index}
                    style={[
                      styles.keywordTag,
                      isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' },
                    ]}
                  >
                    <Text style={[styles.keywordText, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>
                      {keyword}
                    </Text>
                    <TouchableOpacity onPress={() => removeKeyword(index)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <Ionicons name="close" size={16} color={isDarkMode ? '#94A3B8' : '#FFFFFF'} />
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
          )}
        </SectionCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003399',
  },
  description: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 22,
    height: 44,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    shadowColor: '#ff6b35',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  keywordTag: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    maxWidth: '100%',
  },
  keywordText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 6,
    flexShrink: 1,
  },
});
