import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
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
}

const HelpSupportScreen: React.FC<HelpSupportProps> = ({ visible, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const helpCategories = [
    {
      id: 'customer',
      title: 'I am a Customer',
      icon: 'person-outline',
      questions: [
        {
          id: 'c1',
          question: 'How do I post a task?',
          answer: `To post a task:

1. Tap "Get Done" at the bottom of the screen
2. Describe what you need done
3. Set your budget and location
4. Add photos (optional but recommended)
5. Review and post your task

You'll start receiving offers from taskers right away!`
        },
        {
          id: 'c2',
          question: 'How do I choose a tasker?',
          answer: `When choosing a tasker:

1. Review all offers received
2. Check their ratings and reviews
3. Read their profile and experience
4. Look at their completion rate
5. Compare prices and timelines
6. Message them if you have questions
7. Accept the best offer

Take your time to choose the right person for your task!`
        },
        {
          id: 'c3',
          question: 'How do I make a payment?',
          answer: `Payment process:

1. When you accept an offer, you'll be asked to make payment
2. We securely hold your payment until task is complete
3. Once the tasker completes the work, mark it as complete
4. Payment is released to the tasker

Your payment is protected and only released when you're satisfied with the work.`
        },
        {
          id: 'c4',
          question: 'What if I\'m not happy with the work?',
          answer: `If you're not satisfied:

1. First, communicate with your tasker about the issue
2. Give them a chance to fix the problem
3. If unresolved, contact our support team
4. We'll help mediate and find a solution
5. In valid cases, you may be eligible for a refund

Contact: support@mytodo.com`
        },
      ]
    },
    {
      id: 'tasker',
      title: 'I am a Tasker',
      icon: 'construct-outline',
      questions: [
        {
          id: 't1',
          question: 'How do I make an offer on a task?',
          answer: `To make an offer:

1. Browse tasks in the "Browse" tab
2. Find a task that matches your skills
3. Tap on the task to view details
4. Tap "Make an Offer"
5. Enter your price
6. Write a personalized message explaining why you're the best fit
7. Submit your offer

Pro tip: Personalized offers get more responses!`
        },
        {
          id: 't2',
          question: 'How do I set up my payout account?',
          answer: `To receive payments:

1. Go to your Profile
2. Tap "Account settings"
3. Tap "Payment options"
4. Tap "Setup Payout Account"
5. Enter your bank account details
6. Verify your email
7. You're ready to receive payments!

Payments are processed within 2-3 business days after task completion.`
        },
        {
          id: 't3',
          question: 'When do I get paid?',
          answer: `Payment timeline:

1. Customer accepts your offer and pays
2. We hold the payment securely
3. You complete the task
4. Customer marks task as complete
5. Payment is released to your account
6. Funds appear in 2-3 business days

You can track all payments in Profile → Payment options → Payment history.`
        },
        {
          id: 't4',
          question: 'What are the tasker fees?',
          answer: `Tasker fees:

- Service fee: 15% of the task price
- This covers insurance, payment processing, and platform maintenance
- You'll see the exact fee before accepting a task

Example: For a $100 task, you receive $85.

Building your reputation can unlock lower fees through our tier system!`
        },
        {
          id: 't5',
          question: 'What is the cancellation policy?',
          answer: `Cancellation policy for taskers:

If you cancel after accepting:
- Within 24 hours of acceptance: Warning
- Less than 24 hours before start: Cancellation fee may apply
- After task starts: Full cancellation fee

Valid cancellation reasons (no fee):
- Customer requests cancellation
- Safety concerns
- Task details significantly different

Multiple cancellations affect your account standing.`
        },
      ]
    },
    {
      id: 'account',
      title: 'Account & Settings',
      icon: 'settings-outline',
      questions: [
        {
          id: 'a1',
          question: 'How do I reset my password?',
          answer: `To reset your password:

1. On the login screen, tap "Forgot password?"
2. Enter your email address
3. Check your email for reset link
4. Click the link and enter new password
5. You can now login with your new password

Didn't receive the email? Check your spam folder or try again.`
        },
        {
          id: 'a2',
          question: 'How do I update my profile?',
          answer: `To update your profile:

1. Go to Profile (Account tab)
2. Tap your profile picture or "Edit Profile"
3. Update your information
4. Add skills and experience (for taskers)
5. Upload a profile picture
6. Save changes

A complete profile helps build trust!`
        },
        {
          id: 'a3',
          question: 'How do I verify my account?',
          answer: `Account verification:

1. Email verification: Click link sent to your email
2. Phone verification: Enter code sent via SMS
3. ID verification: Go to Profile → Account settings → ID Verification

Verified accounts:
- Get more trust from users
- Can access higher-value tasks
- Better visibility in search`
        },
      ]
    },
    {
      id: 'safety',
      title: 'Safety & Guidelines',
      icon: 'shield-checkmark-outline',
      questions: [
        {
          id: 's1',
          question: 'What are the community guidelines?',
          answer: `Community guidelines:

✓ Be respectful and professional
✓ Communicate clearly and honestly
✓ Complete tasks as agreed
✓ Pay/work on time
✓ Leave honest reviews

✗ No harassment or discrimination
✗ No off-platform payments
✗ No fake profiles or reviews
✗ No illegal activities

Violations may result in account suspension.`
        },
        {
          id: 's2',
          question: 'How do I report a problem?',
          answer: `To report an issue:

1. In the task or chat, tap the menu (⋮)
2. Select "Report"
3. Choose the issue type
4. Provide details
5. Submit report

Or contact support directly:
Email: support@mytodo.com
Response time: Within 24 hours

We take all reports seriously and investigate promptly.`
        },
        {
          id: 's3',
          question: 'Is my payment information safe?',
          answer: `Payment security:

✓ All payments processed through secure Stripe
✓ We never store your full card details
✓ Bank-level encryption (256-bit SSL)
✓ PCI DSS compliant
✓ Two-factor authentication available

Your payment information is protected with industry-leading security standards.`
        },
      ]
    },
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    setExpandedQuestion(null); // Close any open questions when switching categories
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const filteredCategories = helpCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      searchQuery === '' ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

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
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.placeholder} />
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
          {/* Categories */}
          {filteredCategories.map((category) => (
            <View key={category.id} style={styles.categoryContainer}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => toggleCategory(category.id)}
              >
                <View style={styles.categoryTitleContainer}>
                  <Ionicons name={category.icon as any} size={24} color="#0052A2" />
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.questionCount}>({category.questions.length})</Text>
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

          {filteredCategories.length === 0 && searchQuery.length > 0 && (
            <View style={styles.noResults}>
              <Ionicons name="search" size={48} color="#ccc" />
              <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
              <Text style={styles.noResultsSubtext}>Try different keywords or browse categories</Text>
            </View>
          )}

          {/* Contact Support */}
          <View style={styles.contactContainer}>
            <Text style={styles.contactTitle}>Still need help?</Text>
            <Text style={styles.contactText}>
              Can't find what you're looking for? Our support team is here to help!
            </Text>
            <TouchableOpacity style={styles.contactButton}>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
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
