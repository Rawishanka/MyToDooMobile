import { getHelpArticles, groupArticlesByCategory, HelpArticle, searchHelpArticles } from '@/src/api/help-support-api';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

interface HelpSupportProps {
  visible: boolean;
  onClose: () => void;
  onContactSupport?: () => void;
}

const HelpSupportScreen: React.FC<HelpSupportProps> = ({ visible, onClose, onContactSupport }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch help articles from API
  useEffect(() => {
    if (visible) {
      loadHelpArticles();
    }
  }, [visible]);

  const loadHelpArticles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("📖 Loading help articles from API...");
      const response = await getHelpArticles();
      
      if (response.data && response.data.length > 0) {
        // Filter only active articles
        const activeArticles = response.data.filter(article => article.isActive);
        setArticles(activeArticles);
        console.log("✅ Help articles loaded successfully:", activeArticles.length);
      } else {
        console.log("ℹ️ No help articles found");
        setArticles([]);
      }
    } catch (err: any) {
      console.error("❌ Failed to load help articles:", err);
      setError('Failed to load help articles. Please try again.');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // Map category names to icons
  const getCategoryIcon = (categoryName: string): string => {
    const lowerCategory = categoryName.toLowerCase();
    
    if (lowerCategory.includes('getting started') || lowerCategory.includes('general')) {
      return 'rocket-outline';
    } else if (lowerCategory.includes('post') || lowerCategory.includes('task')) {
      return 'create-outline';
    } else if (lowerCategory.includes('tasker') || lowerCategory.includes('becoming')) {
      return 'construct-outline';
    } else if (lowerCategory.includes('payment') || lowerCategory.includes('pricing')) {
      return 'card-outline';
    } else if (lowerCategory.includes('safety') || lowerCategory.includes('security')) {
      return 'shield-checkmark-outline';
    } else if (lowerCategory.includes('account') || lowerCategory.includes('setting')) {
      return 'settings-outline';
    } else {
      return 'help-circle-outline';
    }
  };

  // Group and filter articles
  const filteredArticles = searchQuery 
    ? searchHelpArticles(articles, searchQuery) 
    : articles;
  
  const groupedArticles = groupArticlesByCategory(filteredArticles);
  
  // Convert to categories format for UI
  const helpCategories = Object.entries(groupedArticles).map(([category, categoryArticles]) => ({
    id: category.toLowerCase().replace(/\s+/g, '-'),
    title: category,
    icon: getCategoryIcon(category),
    questions: categoryArticles.map(article => ({
      id: article._id,
      question: article.question,
      answer: article.answer,
    }))
  }));

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    setExpandedQuestion(null); // Close any open questions when switching categories
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#0052A2" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={60} color="#0052A2" style={styles.infoIcon} />
          <Text style={styles.infoTitle}>How can we help you?</Text>
          <Text style={styles.infoSubtitle}>
            Browse through our frequently asked questions to find answers to common queries about MyToDoo.
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              <ScrollView 
                style={styles.content}
                keyboardShouldPersistTaps="handled"
              >
          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0052A2" />
              <Text style={styles.loadingText}>Loading help articles...</Text>
            </View>
          )}

          {/* Error State */}
          {error && !loading && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#ff3b30" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadHelpArticles}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Categories */}
          {!loading && !error && helpCategories.map((category) => (
            <View key={category.id} style={styles.categoryContainer}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => toggleCategory(category.id)}
              >
                <View style={styles.categoryTitleContainer}>
                  <Ionicons name={category.icon as any} size={24} color="#0052A2" />
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.questionCount}>({category.questions.length} questions)</Text>
                </View>
                <Ionicons
                  name={expandedCategory === category.id ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>

              {expandedCategory === category.id && (
                <View style={styles.questionsContainer}>
                  {category.questions.map((item) => (
                    <View key={item.id} style={styles.questionItem}>
                      <TouchableOpacity
                        style={styles.questionHeader}
                        onPress={() => toggleQuestion(item.id)}
                      >
                        <Text style={styles.questionText}>{item.question}</Text>
                        <Ionicons
                          name={expandedQuestion === item.id ? "chevron-up" : "chevron-down"}
                          size={20}
                          color="#0052A2"
                        />
                      </TouchableOpacity>

                      {expandedQuestion === item.id && (
                        <View style={styles.answerContainer}>
                          <Text style={styles.answerText}>{item.answer}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* No Results */}
          {!loading && !error && helpCategories.length === 0 && searchQuery.length > 0 && (
            <View style={styles.noResults}>
              <Ionicons name="search" size={48} color="#ccc" />
              <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
              <Text style={styles.noResultsSubtext}>Try different keywords or browse categories</Text>
            </View>
          )}

          {/* Empty State (No Articles) */}
          {!loading && !error && articles.length === 0 && searchQuery.length === 0 && (
            <View style={styles.noResults}>
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text style={styles.noResultsText}>No help articles available</Text>
              <Text style={styles.noResultsSubtext}>Please check back later or contact support</Text>
            </View>
          )}

          {/* Contact Support */}
          <View style={styles.contactContainer}>
            <Text style={styles.contactTitle}>Still need help?</Text>
            <Text style={styles.contactText}>
              Can't find what you're looking for? Our support team is here to help!
            </Text>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => {
                if (onContactSupport) {
                  onContactSupport();
                }
              }}
            >
              <Ionicons name="mail-outline" size={20} color="#fff" />
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
            <Text style={styles.contactEmail}>support@mytodo.com</Text>
          </View>
        </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: hp('6.5%'),
    paddingBottom: hp('2%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  closeButton: {
    padding: wp('1%'),
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#0052A2',
  },
  placeholder: {
    width: wp('8%'),
  },
  infoBanner: {
    backgroundColor: '#fff',
    paddingVertical: hp('3%'),
    paddingHorizontal: wp('5%'),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    marginBottom: hp('1%'),
  },
  infoIcon: {
    marginBottom: hp('1.5%'),
  },
  infoTitle: {
    fontSize: RFValue(22),
    fontWeight: '700',
    color: '#333',
    marginBottom: hp('1%'),
    textAlign: 'center',
  },
  infoSubtitle: {
    fontSize: RFValue(14),
    color: '#666',
    textAlign: 'center',
    lineHeight: hp('2.5%'),
    paddingHorizontal: wp('4%'),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: wp('4%'),
    marginBottom: hp('1.5%'),
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.2%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  searchIcon: {
    marginRight: wp('2%'),
  },
  searchInput: {
    flex: 1,
    fontSize: RFValue(16),
    color: '#333',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('7.5%'),
  },
  loadingText: {
    fontSize: RFValue(16),
    color: '#666',
    marginTop: hp('2%'),
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('7.5%'),
    paddingHorizontal: wp('8%'),
  },
  errorText: {
    fontSize: RFValue(16),
    color: '#ff3b30',
    marginTop: hp('2%'),
    marginBottom: hp('2%'),
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0052A2',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
  },
  retryButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
  categoryContainer: {
    marginBottom: hp('1%'),
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    marginHorizontal: wp('4%'),
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: wp('4%'),
    backgroundColor: '#fff',
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryTitle: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#333',
    marginLeft: wp('3%'),
  },
  questionCount: {
    fontSize: RFValue(14),
    color: '#999',
    marginLeft: wp('2%'),
  },
  questionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  questionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: wp('4%'),
    paddingLeft: wp('13%'),
  },
  questionText: {
    flex: 1,
    fontSize: RFValue(15),
    color: '#0052A2',
    fontWeight: '500',
  },
  answerContainer: {
    paddingHorizontal: wp('13%'),
    paddingBottom: wp('4%'),
    backgroundColor: '#f9f9f9',
  },
  answerText: {
    fontSize: RFValue(14),
    color: '#666',
    lineHeight: hp('2.7%'),
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('7.5%'),
  },
  noResultsText: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#666',
    marginTop: hp('2%'),
  },
  noResultsSubtext: {
    fontSize: RFValue(14),
    color: '#999',
    marginTop: hp('1%'),
  },
  contactContainer: {
    backgroundColor: '#fff',
    marginHorizontal: wp('4%'),
    marginVertical: hp('2%'),
    padding: wp('5%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp('1%'),
  },
  contactText: {
    fontSize: RFValue(14),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp('2%'),
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0052A2',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
    marginBottom: hp('1.5%'),
  },
  contactButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '600',
    marginLeft: wp('2%'),
  },
  contactEmail: {
    fontSize: RFValue(14),
    color: '#0052A2',
    fontWeight: '500',
  },
});

export default HelpSupportScreen;
