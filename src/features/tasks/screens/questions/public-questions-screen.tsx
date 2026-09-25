import { useGetAllPublicQuestions } from '@/src/shared/hooks/useTaskApi';
import { formatUserName } from '@/src/utils/formatUserName';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from '@/src/shared/utils/responsive';

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
  const insets = useSafeAreaInsets();
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
              <Ionicons name="person" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.userName}>
              {formatUserName(question.askedBy?.firstName, question.askedBy?.lastName)}
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
        <ActivityIndicator size="large" color="#003399" />
        <Text style={styles.loadingText}>Loading public questions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
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
      <StatusBar barStyle="light-content" backgroundColor="#003399" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Public Q&A</Text>
        <View style={styles.headerRight}>
          <Text style={styles.questionCount}>{filteredQuestions.length} questions</Text>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions..."
            placeholderTextColor="#94A3B8"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#94A3B8" />
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
          <View style={styles.emptyIconChip}>
            <Ionicons name="help-circle-outline" size={40} color="#003399" />
          </View>
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
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6FB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: RFValue(16),
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#F4F6FB',
  },
  errorTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
  },
  errorSubtitle: {
    fontSize: RFValue(14),
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 28,
    height: 48,
    justifyContent: 'center',
    borderRadius: 14,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#003399',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    minWidth: 36,
    alignItems: 'flex-end',
  },
  questionCount: {
    fontSize: RFValue(12),
    color: 'rgba(255,255,255,0.78)',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#003399',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: RFValue(16),
    color: '#0F172A',
  },
  categoryFilter: {
    flexGrow: 0,
  },
  categoryChip: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#FFFFFF',
  },
  categoryChipText: {
    fontSize: RFValue(12),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoryChipTextActive: {
    color: '#003399',
  },
  questionsList: {
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#003399',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#001A66',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  taskContext: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.22)',
  },
  taskTitle: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskCategory: {
    fontSize: RFValue(12),
    color: '#BFD4FF',
    fontWeight: '600',
  },
  taskBudget: {
    fontSize: RFValue(12),
    color: '#FFFFFF',
    fontWeight: '700',
  },
  taskLocation: {
    fontSize: RFValue(12),
    color: 'rgba(255,255,255,0.78)',
  },
  questionSection: {
    padding: 14,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userName: {
    fontSize: RFValue(12),
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  timestamp: {
    fontSize: RFValue(11),
    color: 'rgba(255,255,255,0.78)',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusAnswered: {
    backgroundColor: 'rgba(74,222,128,0.2)',
  },
  statusPending: {
    backgroundColor: 'rgba(251,191,36,0.2)',
  },
  statusText: {
    fontSize: RFValue(10),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusAnsweredText: {
    color: '#86EFAC',
  },
  statusPendingText: {
    color: '#FCD34D',
  },
  questionText: {
    fontSize: RFValue(14),
    color: '#FFFFFF',
    lineHeight: 20,
  },
  answerSection: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    margin: 14,
    marginTop: 0,
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4ADE80',
  },
  answerLabel: {
    fontSize: RFValue(12),
    fontWeight: '700',
    color: '#86EFAC',
    marginBottom: 4,
  },
  answerText: {
    fontSize: RFValue(13),
    color: '#FFFFFF',
    lineHeight: 18,
  },
  answerTime: {
    fontSize: RFValue(10),
    color: 'rgba(255,255,255,0.78)',
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconChip: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E3EAF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: RFValue(14),
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
});
