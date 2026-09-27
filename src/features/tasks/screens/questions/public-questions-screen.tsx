import { useGetAllPublicQuestions } from '@/src/shared/hooks/useTaskApi';
import { formatUserName } from '@/src/utils/formatUserName';
import { BlueBackdrop } from '@/src/shared/components/custom_components/lightCard';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
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
import AppLoader from '@/src/shared/components/AppLoader';

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
        <BlueBackdrop />
        <AppLoader size={32} color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading public questions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <BlueBackdrop />
        <Ionicons name="alert-circle-outline" size={64} color="#FCA5A5" />
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
      <BlueBackdrop />
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
            <Ionicons name="help-circle-outline" size={40} color="#FFFFFF" />
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
    backgroundColor: '#003399',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#003399',
  },
  loadingText: {
    marginTop: 12,
    fontSize: RFValue(16),
    color: 'rgba(255,255,255,0.75)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#003399',
  },
  errorTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
  },
  errorSubtitle: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
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
    color: '#0B1B4D',
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
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    borderRadius: 20,
    marginBottom: 16,
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
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
    marginTop: 8,
    textAlign: 'center',
  },
});
