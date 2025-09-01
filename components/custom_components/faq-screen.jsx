import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Image,
  Modal 
} from 'react-native';

const FAQModal = ({ visible, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('main'); // 'main', 'customer', 'tasker', 'guidelines'

  const faqCategories = [
    {
      id: 'promoted',
      title: 'Promoted articles',
      articles: [
        { title: 'How to get started on Airtasker?', created: '2 months ago', comments: 0 },
        { title: 'How to get started on Airtasker?', created: '2 months ago', comments: 0 },
        { title: 'What are the Community Guidelines?', created: '2 months ago', comments: 0 },
        { title: 'What are the posting guidelines?', created: '2 months ago', comments: 0 },
      ]
    },
    {
      id: 'tips',
      title: 'Tips for Taskers',
      articles: [
        { title: 'Can I prevent a customer from messaging me again?', created: '2 months ago', comments: 0 },
      ]
    },
    {
      id: 'partnerships',
      title: 'Airtasker Partnerships',
      articles: [
        { title: 'Oscillot UK Voucher Terms and Conditions', created: '2 months ago', comments: 0 },
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      articles: [
        { title: "I'm facing an error when making an offer. What should I do?", created: '3 months ago', comments: 0 },
      ]
    },
    {
      id: 'fees',
      title: 'Fees & Taxes',
      articles: [
        { title: 'What are Tasker Tiers?', created: '6 months ago', comments: 0 },
        { title: 'What is my TIN?', created: '7 months ago', comments: 0 },
      ]
    }
  ]; // <-- Close faqCategories array properly

  const customerCategories = [
    {
      title: 'Understanding Airtasker',
      articles: []
    },
    {
      title: 'Login/Account management',
      articles: []
    },
    {
      title: 'Payments & Refunds',
      articles: []
    },
    {
      title: 'Managing Tasks',
      articles: []
    },
    {
      title: 'Tips for Customers',
      articles: []
    },
    {
      title: 'Trust & Safety',
      articles: []
    },
    {
      title: 'Contact Support',
      articles: []
    }
  ];

  const taskerCategories = [
    {
      title: 'Understanding Airtasker',
      articles: []
    },
    {
      title: 'Start Earning at Airtasker',
      articles: []
    },
    {
      title: 'Payments & Earnings',
      articles: []
    },
    {
      title: 'Managing Tasks',
      articles: []
    },
    {
      title: 'Trust & Safety',
      articles: []
    },
    {
      title: 'Tips for Taskers',
      articles: []
    },
    {
      title: 'Contact Support',
      articles: []
    }
  ];

  const guidelinesCategories = [
    {
      title: 'Platform Guidelines',
      articles: []
    },
    {
      title: 'Platform Safety',
      articles: []
    }
  ];

  const renderBreadcrumb = (view) => {
    let breadcrumbText = '';
    switch(view) {
      case 'customer':
        breadcrumbText = 'Airtasker Support Centre > I am a Customer';
        break;
      case 'tasker':
        breadcrumbText = 'Airtasker Support Centre > I am a Tasker';
        break;
      case 'guidelines':
        breadcrumbText = 'Airtasker Support Centre > Airtasker Guidelines';
        break;
      default:
        return null;
    }
    
    return (
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText}>{breadcrumbText}</Text>
      </View>
    );
  };

  const renderCategoryView = (categories, title) => (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.doneButton}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
        <Text style={styles.headerUrl}>support.airtasker.com</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="copy-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="refresh" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Simple Header */}
      <View style={styles.simpleHeader}>
        <View style={styles.helpHeader}>
          <Text style={styles.helpTitle}>Airtasker Help</Text>
          <Text style={styles.languageSelector}>English (GB) ⌄</Text>
          <TouchableOpacity>
            <Ionicons name="menu" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {renderBreadcrumb(currentView)}
        
        {/* Search Bar */}
        <View style={styles.searchContainerSimple}>
          <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ask a question"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Page Title */}
        <Text style={styles.pageTitle}>{title}</Text>

        {/* Categories */}
        {categories.map((category, index) => (
          <View key={index} style={styles.simpleCategorySection}>
            <TouchableOpacity style={styles.simpleCategoryItem}>
              <Text style={styles.simpleCategoryTitle}>{category.title}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Support */}
      <View style={styles.bottomSupport}>
        <Text style={styles.supportText}>Airtasker Support Centre</Text>
        <TouchableOpacity onPress={() => setCurrentView('main')}>
          <Text style={styles.backToApp}>Back to Airtasker</Text>
        </TouchableOpacity>
      </View>

      {/* Help Chat Button */}
      <TouchableOpacity style={styles.helpChatButton}>
        <Ionicons name="chatbubble" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Need Help Dialog */}
      <View style={styles.needHelpDialog}>
        <TouchableOpacity style={styles.closeDialog}>
          <Ionicons name="close" size={18} color="#666" />
        </TouchableOpacity>
        <Text style={styles.needHelpText}>Need help?</Text>
      </View>
    </View>
  );
  // Main screen rendering function
  const renderMainScreen = () => (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.doneButton}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
        <Text style={styles.headerUrl}>support.airtasker.com</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="copy-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="refresh" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Airtasker Help Banner */}
      <View style={styles.helpBanner}>
        <View style={styles.helpHeader}>
          <Text style={styles.helpTitle}>Airtasker Help</Text>
          <Text style={styles.languageSelector}>English (GB) ⌄</Text>
          <TouchableOpacity>
            <Ionicons name="menu" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        {/* 3D Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustration3D}>
            {/* Simple representation of the 3D blocks */}
            <View style={[styles.block, styles.block1]} />
            <View style={[styles.block, styles.block2]} />
            <View style={[styles.block, styles.block3]} />
            <View style={[styles.block, styles.block4]} />
            <View style={[styles.block, styles.house]} />
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ask a question"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Category Buttons */}
        <View style={styles.categoryButtons}>
          <TouchableOpacity style={styles.categoryButton} onPress={() => setCurrentView('customer')}>
            <Text style={styles.categoryButtonText}>I am a Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryButton} onPress={() => setCurrentView('tasker')}>
            <Text style={styles.categoryButtonText}>I am a Tasker</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryButton} onPress={() => setCurrentView('guidelines')}>
            <Text style={styles.categoryButtonText}>Airtasker Guidelines</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Categories */}
        {faqCategories.map((category) => (
          <View key={category.id} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            {category.articles.map((article, index) => (
              <TouchableOpacity key={index} style={styles.articleItem}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <View style={styles.articleMeta}>
                  <Text style={styles.articleMetaText}>
                    Article created {article.created}
                  </Text>
                  <View style={styles.commentContainer}>
                    <Ionicons name="chatbubble-outline" size={14} color="#999" />
                    <Text style={styles.commentCount}>{article.comments}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* See More */}
        <TouchableOpacity style={styles.seeMoreButton}>
          <Text style={styles.seeMoreText}>See more</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Support */}
      <View style={styles.bottomSupport}>
        <Text style={styles.supportText}>Airtasker Support Centre</Text>
        <TouchableOpacity>
          <Text style={styles.backToApp}>Back to App</Text>
        </TouchableOpacity>
      </View>

      {/* Help Chat Button */}
      <TouchableOpacity style={styles.helpChatButton}>
        <Ionicons name="chatbubble" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Need Help Dialog */}
      <View style={styles.needHelpDialog}>
        <TouchableOpacity style={styles.closeDialog}>
          <Ionicons name="close" size={18} color="#666" />
        </TouchableOpacity>
        <Text style={styles.needHelpText}>Need help?</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      {currentView === 'main' && renderMainScreen()}
      {currentView === 'customer' && renderCategoryView(customerCategories, 'I am a Customer')}
      {currentView === 'tasker' && renderCategoryView(taskerCategories, 'I am a Tasker')}
      {currentView === 'guidelines' && renderCategoryView(guidelinesCategories, 'Airtasker Guidelines')}
    </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  doneButton: {
    paddingVertical: 4,
  },
  doneText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  headerUrl: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 12,
    padding: 4,
  },
  helpBanner: {
    backgroundColor: '#0052A2',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  helpTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  languageSelector: {
    color: '#fff',
    fontSize: 14,
  },
  illustrationContainer: {
    height: 120,
    marginVertical: 20,
    position: 'relative',
  },
  illustration3D: {
    flex: 1,
    position: 'relative',
  },
  block: {
    position: 'absolute',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  block1: {
    width: 40,
    height: 30,
    top: 20,
    left: 30,
    backgroundColor: '#5CB3FF',
  },
  block2: {
    width: 35,
    height: 25,
    top: 60,
    left: 80,
    backgroundColor: '#4A90E2',
  },
  block3: {
    width: 30,
    height: 20,
    top: 40,
    right: 60,
    backgroundColor: '#87CEEB',
  },
  block4: {
    width: 25,
    height: 35,
    top: 70,
    right: 30,
    backgroundColor: '#B0E0E6',
  },
  house: {
    width: 35,
    height: 30,
    top: 30,
    left: '50%',
    marginLeft: -17.5,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 0,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },
  categoryButtons: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  categoryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  categorySection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  articleItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  articleTitle: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 8,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  articleMetaText: {
    fontSize: 12,
    color: '#666',
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  seeMoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  seeMoreText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomSupport: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e1e4e8',
  },
  supportText: {
    fontSize: 14,
    color: '#333',
  },
  backToApp: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  helpChatButton: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  needHelpDialog: {
    position: 'absolute',
    bottom: 140,
    right: 80,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeDialog: {
    marginRight: 8,
  },
  needHelpText: {
    fontSize: 14,
    color: '#333',
  },
  // New styles for category views
  simpleHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  breadcrumb: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#007AFF',
  },
  searchContainerSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  simpleCategorySection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  simpleCategoryItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  simpleCategoryTitle: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
});

export default FAQModal;