import { useGetAllPublicQuestions } from '@/src/shared/hooks/useTaskApi';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

interface PublicQuestion {
  _id: string;
  question: string | { text: string };
  answer?: string | { text: string };
  askedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  answeredBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  answeredAt?: string;
  status: 'pending' | 'answered';
  taskId: string;
  taskTitle: string;
  taskLocation: string;
  taskBudget: string;
  taskCategory: string;
}

export default function PublicQuestionsScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const {
    data: questionsData,
    isLoading,
    error,
    refetch
  } = useGetAllPublicQuestions();

  const allQuestions: PublicQuestion[] = questionsData?.data || [];

  // Filter questions based on search and category
  const filteredQuestions = allQuestions.filter(question => {
    const matchesSearch = searchText === '' || 
      (typeof question.question === 'string' ? question.question : question.question?.text || '')
        .toLowerCase().includes(searchText.toLowerCase()) ||
      question.taskTitle.toLowerCase().includes(searchText.toLowerCase()) ||
      question.taskCategory.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || question.taskCategory === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ['all', ...Array.from(new Set(allQuestions.map(q => q.taskCategory)))];

  const renderQuestionCard = ({ item: question }: { item: PublicQuestion }) => (
    <TouchableOpacity 
      style={styles.questionCard}
      onPress={() => {
        // Navigate to task detail to see full context
        router.push(`/tasks/task-detail?taskId=${question.taskId}` as any);
      }}
    >
      {/* Task Context Header */}
      <View style={styles.taskContext}>
        <Text style={styles.taskTitle} numberOfLines={1}>{question.taskTitle}</Text>
        <View style={styles.taskMeta}>
          <Text style={styles.taskCategory}>{question.taskCategory}</Text>
          <Text style={styles.taskBudget}>{question.taskBudget}</Text>
        </View>
        <Text style={styles.taskLocation} numberOfLines={1}>📍 {question.taskLocation}</Text>
      </View>

      {/* Question */}
      <View style={styles.questionSection}>
        <View style={styles.questionHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={16} color="#666" />
            </View>
            <Text style={styles.userName}>
              {question.askedBy?.firstName} {question.askedBy?.lastName}
            </Text>
            <Text style={styles.timestamp}>
              asked {new Date(question.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            question.status === 'answered' ? styles.statusAnswered : styles.statusPending
          ]}>
            <Text style={[
              styles.statusText,
              question.status === 'answered' ? styles.statusAnsweredText : styles.statusPendingText
            ]}>
              {question.status}
            </Text>
          </View>
        </View>
        
        <Text style={styles.questionText}>
          {typeof question.question === 'string' ? question.question : question.question?.text || 'No question text'}
        </Text>
      </View>

      {/* Answer */}
      {question.answer && (
        <View style={styles.answerSection}>
          <Text style={styles.answerLabel}>
            Answer{question.answeredBy?.firstName ? ` by ${question.answeredBy.firstName}` : ''}:
          </Text>
          <Text style={styles.answerText}>
            {typeof question.answer === 'string' ? question.answer : question.answer?.text || 'No answer text'}
          </Text>
          {question.answeredAt && (
            <Text style={styles.answerTime}>
              Answered {new Date(question.answeredAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading public questions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
        <Text style={styles.errorTitle}>Failed to Load Questions</Text>
        <Text style={styles.errorSubtitle}>Please check your connection and try again.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Public Q&A</Text>
        <View style={styles.headerRight}>
          <Text style={styles.questionCount}>{filteredQuestions.length} questions</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* Search and Filter */}
            <View style={styles.searchSection}>
              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#666" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search questions..."
                  placeholderTextColor="#999"
                  value={searchText}
                  onChangeText={setSearchText}
                />
                {searchText.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchText('')}>
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
              
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={categories}
                keyExtractor={(item) => item}
                style={styles.categoryFilter}
                renderItem={({ item: category }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      filterCategory === category && styles.categoryChipActive
                    ]}
                    onPress={() => setFilterCategory(category)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      filterCategory === category && styles.categoryChipTextActive
                    ]}>
                      {category === 'all' ? 'All Categories' : category}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* Questions List */}
            {filteredQuestions.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="help-circle-outline" size={64} color="#ccc" />
                <Text style={styles.emptyStateTitle}>
                  {searchText || filterCategory !== 'all' ? 'No matching questions' : 'No questions yet'}
                </Text>
                <Text style={styles.emptyStateSubtitle}>
                  {searchText || filterCategory !== 'all' 
                    ? 'Try adjusting your search or filter'
                    : 'Be the first to ask a question on a task!'
                  }
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredQuestions}
                keyExtractor={(item) => item._id}
                renderItem={renderQuestionCard}
                contentContainerStyle={styles.questionsList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                refreshing={isLoading}
                onRefresh={refetch}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    padding: 8,
  },
  questionCount: {
    fontSize: 12,
    color: '#666',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  categoryFilter: {
    flexGrow: 0,
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  questionsList: {
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  taskContext: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskCategory: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  taskBudget: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  taskLocation: {
    fontSize: 12,
    color: '#666',
  },
  questionSection: {
    padding: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusAnswered: {
    backgroundColor: '#E8F5E8',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusAnsweredText: {
    color: '#4CAF50',
  },
  statusPendingText: {
    color: '#FF9800',
  },
  questionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  answerSection: {
    backgroundColor: '#f8f9fa',
    margin: 12,
    marginTop: 0,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  answerTime: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});