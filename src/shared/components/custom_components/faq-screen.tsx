import { getHelpArticles, groupArticlesByCategory, HelpArticle, searchHelpArticles } from '@/src/api/help-support-api';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface FAQScreenProps {
  visible: boolean;
  onClose: () => void;
  onContactSupport?: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

const FAQScreen: React.FC<FAQScreenProps> = ({ visible, onClose, onContactSupport }) => {
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
      console.log("📖 Loading FAQ articles from API...");
      const response = await getHelpArticles();
      
      if (response.data && response.data.length > 0) {
        // Filter only active articles
        const activeArticles = response.data.filter(article => article.isActive);
        setArticles(activeArticles);
        console.log("✅ FAQ articles loaded successfully:", activeArticles.length);
      } else {
        console.log("ℹ️ No FAQ articles found");
        setArticles([]);
      }
    } catch (err: any) {
      console.error("❌ Failed to load FAQ articles:", err);
      setError('Failed to load FAQ articles. Please try again.');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // Map category names to icons
  const getCategoryIcon = (categoryName: string): any => {
    const lowerCategory = categoryName.toLowerCase();
    
    if (lowerCategory.includes('getting started') || lowerCategory.includes('general')) {
      return 'rocket-outline';
    } else if (lowerCategory.includes('post') || lowerCategory.includes('task')) {
      return 'create-outline';
    } else if (lowerCategory.includes('tasker') || lowerCategory.includes('becoming')) {
      return 'briefcase-outline';
    } else if (lowerCategory.includes('payment') || lowerCategory.includes('pricing')) {
      return 'card-outline';
    } else if (lowerCategory.includes('safety') || lowerCategory.includes('security') || lowerCategory.includes('trust')) {
      return 'shield-checkmark-outline';
    } else if (lowerCategory.includes('account') || lowerCategory.includes('profile') || lowerCategory.includes('setting')) {
      return 'person-outline';
    } else {
      return 'help-circle-outline';
    }
  };

  const toggleItem = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Group articles by category from API
  const groupedArticles = groupArticlesByCategory(articles);
  
  // Convert to categories format for UI
  const categories = Object.entries(groupedArticles).map(([category, categoryArticles]) => ({
    id: category.toLowerCase().replace(/\s+/g, '-'),
    title: category,
    icon: getCategoryIcon(category),
    faqs: categoryArticles.map(article => ({
      question: article.question,
      answer: article.answer,
    }))
  }));

  // Old hardcoded data - removed, now using API
  const oldCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: 'rocket-outline' as const,
      faqs: [
        {
          question: 'What is MyToDoo?',
          answer: 'MyToDoo is a platform that connects people who need tasks done with skilled taskers who can complete them. Whether you need help with home repairs, deliveries, cleaning, or any other service, MyToDoo makes it easy to find trusted help in your local community.'
        },
        {
          question: 'How do I create an account?',
          answer: 'Creating an account is simple! Download the MyToDoo app, tap "Sign Up", and follow the prompts to enter your details. You can sign up using your email or Google account. Once verified, you can start posting tasks or offering your services immediately.'
        },
        {
          question: 'Is MyToDoo free to use?',
          answer: 'Yes! Creating an account and browsing tasks is completely free. As a customer, you only pay for the tasks you post. As a tasker, MyToDoo takes a small service fee from your earnings to maintain and improve the platform.'
        },
        {
          question: 'How do I verify my account?',
          answer: 'Account verification helps build trust in our community. You can verify your account by uploading a valid ID document through the app. Go to Profile > Account Information > ID Verification to complete this process. Verified accounts get priority in task assignments.'
        }
      ]
    },
    {
      id: 'posting-tasks',
      title: 'Posting Tasks',
      icon: 'create-outline' as const,
      faqs: [
        {
          question: 'How do I post a task?',
          answer: 'Tap the "Post Task" button on the home screen. Describe your task in detail, set your budget, add photos if needed, and choose your preferred date and location. Once posted, taskers in your area will be notified and can make offers to complete your task.'
        },
        {
          question: 'How much should I budget for my task?',
          answer: 'Task pricing varies based on complexity, time required, and location. Check similar completed tasks for reference, or post your task and let taskers suggest their rates. Remember to factor in materials, travel time, and the skill level required.'
        },
        {
          question: 'Can I edit my task after posting?',
          answer: 'Yes! You can edit task details, budget, and requirements before accepting an offer. Once you\'ve accepted a tasker\'s offer, major changes should be discussed with the tasker directly to ensure they can still complete the work.'
        },
        {
          question: 'How long does it take to find a tasker?',
          answer: 'Most tasks receive offers within a few hours. Popular tasks or urgent requests often get offers within minutes! Response time depends on your location, task type, and budget. Setting a competitive budget helps attract taskers faster.'
        }
      ]
    },
    {
      id: 'becoming-tasker',
      title: 'Becoming a Tasker',
      icon: 'briefcase-outline' as const,
      faqs: [
        {
          question: 'How do I become a tasker?',
          answer: 'Anyone can become a tasker! Complete your profile with your skills, experience, and availability. Add a professional photo and verify your ID to build trust. Browse available tasks, make competitive offers, and start earning when your offers are accepted.'
        },
        {
          question: 'What skills can I offer?',
          answer: 'MyToDoo supports a wide range of services including handyman work, cleaning, delivery, gardening, tutoring, tech support, event help, and much more. List all your skills in your profile - the more skills you have, the more tasks you can bid on!'
        },
        {
          question: 'How do I get paid?',
          answer: 'Once you complete a task, the customer releases payment through the app. Funds are transferred to your linked bank account within 2-5 business days. You can track all your earnings and payment history in the app\'s payment section.'
        },
        {
          question: 'What if a customer cancels?',
          answer: 'If a customer cancels before you start work, no payment is required. If cancellation happens after work has begun, you may be entitled to partial payment for work completed. Contact support to resolve cancellation disputes fairly.'
        }
      ]
    },
    {
      id: 'payments',
      title: 'Payments & Pricing',
      icon: 'card-outline' as const,
      faqs: [
        {
          question: 'How does payment work?',
          answer: 'Customers pay upfront when accepting a tasker\'s offer. The payment is held securely by MyToDoo until the task is completed and approved. This ensures both parties are protected - taskers are guaranteed payment, and customers only pay when satisfied.'
        },
        {
          question: 'What payment methods are accepted?',
          answer: 'We accept all major credit and debit cards, as well as digital payment methods like Google Pay and Apple Pay. All transactions are encrypted and secure. Your payment information is never shared with other users.'
        },
        {
          question: 'Are there any fees?',
          answer: 'For customers, the price you see is the price you pay - no hidden fees! For taskers, MyToDoo charges a service fee (typically 10-15%) from your earnings to cover platform maintenance, payment processing, insurance, and customer support.'
        },
        {
          question: 'Can I get a refund?',
          answer: 'Refunds are handled case-by-case. If a tasker doesn\'t show up or work is unsatisfactory, you can request a refund through the app. Our support team reviews all refund requests and mediates disputes to ensure fair outcomes for everyone.'
        }
      ]
    },
    {
      id: 'safety',
      title: 'Safety & Trust',
      icon: 'shield-checkmark-outline' as const,
      faqs: [
        {
          question: 'How does MyToDoo ensure safety?',
          answer: 'Safety is our top priority. All users undergo ID verification, and we encourage reviews and ratings to build transparency. We provide insurance coverage for eligible tasks, secure payment processing, and 24/7 customer support to handle any concerns.'
        },
        {
          question: 'What should I do if something goes wrong?',
          answer: 'Contact our support team immediately through the app\'s Help Center. You can also report users or tasks that violate our Community Guidelines. We investigate all reports promptly and take appropriate action to maintain a safe community.'
        },
        {
          question: 'Are taskers insured?',
          answer: 'MyToDoo provides basic liability coverage for eligible tasks completed through the platform. However, we recommend taskers maintain their own insurance for professional services. Always verify a tasker\'s credentials and insurance for specialized work.'
        },
        {
          question: 'Can I see reviews before hiring?',
          answer: 'Yes! Every tasker\'s profile shows their ratings, reviews from previous customers, tasks completed, and verification status. Read reviews carefully and choose taskers with proven track records in the type of work you need.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Profile',
      icon: 'person-outline' as const,
      faqs: [
        {
          question: 'How do I update my profile?',
          answer: 'Go to Profile > Edit Profile to update your information, photo, bio, and skills. Keeping your profile complete and up-to-date helps build trust and increases your chances of getting tasks (for taskers) or finding great taskers (for customers).'
        },
        {
          question: 'Can I delete my account?',
          answer: 'Yes, you can delete your account at any time through Profile > Account Information > Delete Account. Please note that deletion is permanent and you\'ll lose access to your task history, messages, and earnings information. Complete any ongoing tasks first.'
        },
        {
          question: 'How do I change my password?',
          answer: 'Go to Profile > Account Information > Change Password. Enter your current password and choose a new one. If you\'ve forgotten your password, use the "Forgot Password" option on the login screen to reset it via email.'
        },
        {
          question: 'Why should I verify my ID?',
          answer: 'ID verification builds trust and credibility in our community. Verified users are more likely to get their offers accepted and tend to receive better reviews. It also helps protect everyone from fraud and ensures you\'re dealing with real people.'
        }
      ]
    }
  ]; // End of old hardcoded data - now removed and using API

  const renderHeader = (title: string, showBack: boolean = false) => (
    <View style={styles.header}>
      <TouchableOpacity 
        onPress={showBack ? () => setSelectedCategory(null) : onClose} 
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  const renderCategoryList = () => (
    <View style={styles.container}>
      {renderHeader('Frequently Asked Questions')}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Ionicons name="information-circle" size={48} color="#0052A2" />
          <Text style={styles.welcomeTitle}>How can we help you?</Text>
          <Text style={styles.welcomeSubtext}>
            Browse through our frequently asked questions to find answers to common queries about MyToDoo.
          </Text>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0052A2" />
            <Text style={styles.loadingText}>Loading FAQ articles...</Text>
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

        {/* Empty State */}
        {!loading && !error && categories.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No FAQ articles available</Text>
            <Text style={styles.emptySubtext}>Please check back later or contact support</Text>
          </View>
        )}

        {/* Categories */}
        {!loading && !error && categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => setSelectedCategory(category.id)}
            activeOpacity={0.7}
          >
            <View style={styles.categoryIconContainer}>
              <Ionicons name={category.icon} size={24} color="#0052A2" />
            </View>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categorySubtext}>
                {category.faqs.length} questions
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactSubtext}>
            Can't find what you're looking for? Our support team is here to help.
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
        </View>
      </ScrollView>
    </View>
  );

  const renderFAQList = () => {
    const category = categories.find(cat => cat.id === selectedCategory);
    if (!category) return null;

    return (
      <View style={styles.container}>
        {renderHeader(category.title, true)}
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.faqList}>
            {category.faqs.map((faq, index) => {
              const itemId = `${category.id}-${index}`;
              const isExpanded = expandedItems[itemId];

              return (
                <View key={itemId} style={styles.faqItem}>
                  <TouchableOpacity
                    style={styles.faqQuestion}
                    onPress={() => toggleItem(itemId)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.faqQuestionContent}>
                      <View style={styles.questionNumber}>
                        <Text style={styles.questionNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.faqQuestionText}>{faq.question}</Text>
                    </View>
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#0052A2" 
                    />
                  </TouchableOpacity>
                  
                  {isExpanded && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Contact Support Section in FAQ Detail View */}
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Still need help?</Text>
            <Text style={styles.contactSubtext}>
              Can't find what you're looking for? Our support team is here to help.
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
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      {selectedCategory ? renderFAQList() : renderCategoryList()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categorySubtext: {
    fontSize: 13,
    color: '#666',
  },
  contactSection: {
    backgroundColor: '#fff',
    padding: 24,
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  contactSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0052A2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  faqList: {
    padding: 16,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0052A2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questionNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingLeft: 56,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  bottomPadding: {
    height: 40,
  },
});

export default FAQScreen;
