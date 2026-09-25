import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/shared/theme';
import { RFValue } from '@/src/shared/utils/responsive';

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
    <ScrollView
      style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 },
          isDarkMode && { backgroundColor: '#0F172A', borderBottomColor: '#334155' },
        ]}
      >
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={isDarkMode ? '#38BDF8' : '#003399'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>
          Task Alerts
        </Text>
      </View>

      <View
        style={[
          styles.content,
          isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
        ]}
      >
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#94A3B8' }]}>
          KEYWORD TASK ALERTS
        </Text>

        <View style={styles.descriptionSection}>
          <Text style={[styles.description, isDarkMode && { color: '#CBD5E1' }]}>
            Add your own keywords and get notified for matching tasks. It helps you make offers early and stay ahead of the competition.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={addKeyword}
          activeOpacity={0.85}
        >
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
                  <Text style={[styles.keywordText, isDarkMode && { color: '#F8FAFC' }]}>
                    {keyword}
                  </Text>
                  <TouchableOpacity onPress={() => removeKeyword(index)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Ionicons name="close" size={16} color={isDarkMode ? '#94A3B8' : '#666'} />
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: RFValue(17),
    fontWeight: '700',
    color: '#003399',
    flex: 1,
    textAlign: 'center',
    marginRight: 32,
  },
  content: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: RFValue(12),
    color: '#999',
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  descriptionSection: {
    paddingVertical: 6,
  },
  description: {
    fontSize: RFValue(13),
    color: '#666',
    lineHeight: 20,
    marginBottom: 18,
  },
  addButton: {
    backgroundColor: '#003399',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: RFValue(13),
    fontWeight: '600',
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  keywordTag: {
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  keywordText: {
    fontSize: RFValue(13),
    color: '#333',
    marginRight: 6,
  },
});
