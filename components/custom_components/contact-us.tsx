import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type ContactUsProps = { 
  onBack: () => void;
};

const ContactUs = ({ onBack }: ContactUsProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const helpOptions = [
    'I need help with a task',
    'I need help with my Airtasker account',
    'I need help with a payment OR I have a question about a task payment',
    'I need to submit supporting documents'
  ];

  const handleOptionSelect = (option: React.SetStateAction<string>) => {
    setSelectedOption(option);
    setShowDropdown(false);
  };

  const renderDropdown = () => (
    <View style={styles.dropdownContainer}>
      {helpOptions.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.dropdownItem,
            index === helpOptions.length - 1 && styles.lastDropdownItem
          ]}
          onPress={() => handleOptionSelect(option)}
        >
          <Text style={styles.dropdownText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact us</Text>
        <View style={styles.headerSpacer} />
      </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Airtasker Help Header */}
          <View style={styles.helpHeader}>
            <View style={styles.helpTitleContainer}>
              <Text style={styles.airtaskerText}>Airtasker</Text>
              <Text style={styles.helpText}>Help</Text>
            </View>
            <View style={styles.languageSelector}>
              <Text style={styles.languageText}>English (GB)</Text>
              <Ionicons name="chevron-down" size={16} color="#007AFF" />
            </View>
            <TouchableOpacity style={styles.menuButton}>
              <View style={styles.menuIcon}>
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Breadcrumb */}
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbText}>Airtasker Support Centre</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
            <Text style={styles.breadcrumbText}>Submit a request</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Ask a question"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Submit a request section */}
          <View style={styles.requestSection}>
            <Text style={styles.requestTitle}>Submit a request</Text>
            
            <Text style={styles.questionText}>What can we help you with?</Text>
            
            {/* Dropdown */}
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Text style={[styles.dropdownPlaceholder, selectedOption && styles.selectedText]}>
                {selectedOption || '-'}
              </Text>
              <Ionicons 
                name={showDropdown ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>

            {showDropdown && renderDropdown()}
          </View>
        </ScrollView>

        {/* Chat Support Button */}
        <View style={styles.chatSupportContainer}>
          <TouchableOpacity style={styles.closeChatButton}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
          <View style={styles.chatContent}>
            <Text style={styles.chatTitle}>Need help?</Text>
          </View>
          <TouchableOpacity style={styles.chatButton}>
            <View style={styles.chatIcon}>
              <Ionicons name="chatbubble" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
  },
  helpTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  airtaskerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 4,
  },
  helpText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  languageText: {
    fontSize: 14,
    color: '#007AFF',
    marginRight: 4,
  },
  menuButton: {
    padding: 4,
  },
  menuIcon: {
    width: 20,
    height: 16,
    justifyContent: 'space-between',
  },
  menuLine: {
    height: 2,
    backgroundColor: '#666',
    borderRadius: 1,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#007AFF',
    marginHorizontal: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  requestSection: {
    padding: 20,
  },
  requestTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 24,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#999',
    flex: 1,
  },
  selectedText: {
    color: '#333',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 4,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastDropdownItem: {
    borderBottomWidth: 0,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 20,
  },
  chatSupportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e4e8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  closeChatButton: {
    padding: 4,
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chatButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ContactUs;