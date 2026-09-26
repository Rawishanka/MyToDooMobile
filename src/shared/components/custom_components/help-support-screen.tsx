import { getHelpArticles, groupArticlesByCategory, HelpArticle, searchHelpArticles } from '@/src/api/help-support-api';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { BRAND_ORANGE } from '@/src/shared/theme/brandColors';
import { IconChip, LightHeader } from '@/src/shared/components/custom_components/lightCard';

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
        <LightHeader solid title="Frequently Asked Questions" onBack={onClose} backIcon="close" topPadding={Platform.OS === 'ios' ? 18 : 24} />

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <IconChip name="help-buoy-outline" size={48} style={styles.infoIcon} />
          <Text style={styles.infoTitle}>How can we help you?</Text>
          <Text style={styles.infoSubtitle}>
            Browse through our frequently asked questions to find answers to common queries about MyToDoo.
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.content}>
          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Loading help articles...</Text>
            </View>
          )}

          {/* Error State */}
          {error && !loading && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#FCA5A5" />
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
                  <IconChip name={category.icon as any} />
                  <Text style={styles.categoryTitle} numberOfLines={2}>{category.title}</Text>
                  <Text style={styles.questionCount}>({category.questions.length} questions)</Text>
                </View>
                <Ionicons
                  name={expandedCategory === category.id ? "chevron-up" : "chevron-down"}
                  size={22}
                  color="rgba(255,255,255,0.7)"
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
                          color="rgba(255,255,255,0.7)"
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
              <Ionicons name="search" size={48} color="rgba(255,255,255,0.6)" />
              <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
              <Text style={styles.noResultsSubtext}>Try different keywords or browse categories</Text>
            </View>
          )}

          {/* Empty State (No Articles) */}
          {!loading && !error && articles.length === 0 && searchQuery.length === 0 && (
            <View style={styles.noResults}>
              <Ionicons name="document-text-outline" size={48} color="rgba(255,255,255,0.6)" />
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
    backgroundColor: '#003399',
  },
  infoBanner: {
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  infoIcon: {
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  infoSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 14,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#00114D',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: RFValue(15),
    color: '#0F172A',
    paddingVertical: 0,
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
    fontSize: RFValue(16),
    color: 'rgba(255,255,255,0.75)',
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: RFValue(16),
    color: '#FCA5A5',
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 28,
    height: 48,
    justifyContent: 'center',
    borderRadius: 14,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
  categoryContainer: {
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#00114D',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryTitle: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  questionCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginLeft: 8,
  },
  questionsContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
  },
  questionItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.18)',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    paddingLeft: 16,
  },
  questionText: {
    flex: 1,
    fontSize: RFValue(15),
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 8,
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  answerText: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 22,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
    marginTop: 8,
  },
  contactContainer: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 32,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    shadowColor: '#00114D',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  contactText: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_ORANGE,
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: BRAND_ORANGE,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '600',
    marginLeft: 8,
  },
  contactEmail: {
    fontSize: RFValue(14),
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default HelpSupportScreen;
