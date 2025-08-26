import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert } from 'react-native';

export default function TaskAlerts({ onBack }) {
  const [keywords, setKeywords] = useState(['']);
  const [keywordAlertsEnabled, setKeywordAlertsEnabled] = useState(false);
  const [recommendedAlertsEnabled, setRecommendedAlertsEnabled] = useState(false);

  const addKeyword = () => {
    // Simple keyword addition - in a real app you might have a more sophisticated input system
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
              setKeywords([...keywords.filter(k => k !== ''), keyword.trim()]);
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

  const toggleKeywordAlerts = () => {
    setKeywordAlertsEnabled(!keywordAlertsEnabled);
  };

  const toggleRecommendedAlerts = () => {
    setRecommendedAlertsEnabled(!recommendedAlertsEnabled);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0052A2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task alerts</Text>
      </View>

      <View style={styles.content}>
        {/* Keyword Task Alerts Section */}
        <Text style={styles.sectionTitle}>KEYWORD TASK ALERTS</Text>
        
        <View style={styles.descriptionSection}>
          <Text style={styles.description}>
            Add your own keywords and get notified for matching tasks. It helps you to make offers early and stay ahead of competition.
          </Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addKeyword}>
          <Text style={styles.addButtonText}>Add keyword</Text>
        </TouchableOpacity>

        {/* Keywords List */}
        {keywords.filter(k => k !== '').length > 0 && (
          <View style={styles.keywordsContainer}>
            {keywords.filter(k => k !== '').map((keyword, index) => (
              <View key={index} style={styles.keywordTag}>
                <Text style={styles.keywordText}>{keyword}</Text>
                <TouchableOpacity onPress={() => removeKeyword(index)}>
                  <Ionicons name="close" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity 
          style={styles.alertToggle} 
          onPress={toggleKeywordAlerts}
        >
          <Text style={[
            styles.toggleText, 
            keywordAlertsEnabled ? styles.enabledText : styles.disabledText
          ]}>
            {keywordAlertsEnabled ? 'Disable alerts' : 'Enable or disable alerts'}
          </Text>
        </TouchableOpacity>

        {/* Recommended Task Alerts Section */}
        <Text style={styles.sectionTitle}>RECOMMENDED TASK ALERTS</Text>
        
        <View style={styles.descriptionSection}>
          <Text style={styles.description}>
            Get notified about tasks we think you'd be interested in based on your activity on Airtasker.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.alertToggle} 
          onPress={toggleRecommendedAlerts}
        >
          <Text style={[
            styles.toggleText, 
            recommendedAlertsEnabled ? styles.enabledText : styles.disabledText
          ]}>
            {recommendedAlertsEnabled ? 'Disable alerts' : 'Enable or disable alerts'}
          </Text>
        </TouchableOpacity>
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
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#003366',
    flex: 1,
    textAlign: 'center',
    marginRight: 32, // To center the title accounting for back button
  },
  content: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 25,
    marginBottom: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  descriptionSection: {
    paddingVertical: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#0052A2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
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
  },
  keywordText: {
    fontSize: 14,
    color: '#333',
    marginRight: 6,
  },
  alertToggle: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '500',
  },
  enabledText: {
    backgroundColor: '#3d7fc2ff',
    color: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginBottom: 20
  },
  disabledText: {
    color: '#2351f8ff',
    backgroundColor: '#ebf2f8ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
});