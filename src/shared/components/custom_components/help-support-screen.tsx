import { getHelpArticles, groupArticlesByCategory, HelpArticle, searchHelpArticles } from '@/src/api/help-support-api';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

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

        <ScrollView style={styles.content}>
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
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0052A2',
  },
  placeholder: {
    width: 32,
  },
  infoBanner: {
    backgroundColor: '#fff',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    marginBottom: 8,
  },
  infoIcon: {
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
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
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0052A2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryContainer: {
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  questionCount: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
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
    padding: 16,
    paddingLeft: 52,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    color: '#0052A2',
    fontWeight: '500',
  },
  answerContainer: {
    paddingHorizontal: 52,
    paddingBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  answerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  contactContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0052A2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactEmail: {
    fontSize: 14,
    color: '#0052A2',
    fontWeight: '500',
  },
});

export default HelpSupportScreen;
