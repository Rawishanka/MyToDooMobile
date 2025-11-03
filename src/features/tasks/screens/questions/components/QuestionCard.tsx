import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface QuestionItem {
  _id: string;
  question: string | {text: string; images?: any[]; timestamp?: string};
  answer?: string | {text: string; images?: any[]; timestamp?: string};
  askedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    verified?: boolean;
  };
  answeredBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    verified?: boolean;
  };
  createdAt: string;
  answeredAt?: string;
  status: 'pending' | 'answered';
}

interface QuestionCardProps {
  question: QuestionItem;
  onAnswerPress?: (questionId: string) => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getQuestionText = (question: QuestionItem['question']): string => {
  if (typeof question === 'string') return question;
  return question?.text || 'No question text';
};

const getAnswerText = (answer: QuestionItem['answer']): string => {
  if (!answer) return '';
  if (typeof answer === 'string') return answer;
  return answer?.text || 'No answer text';
};

export default function QuestionCard({ question, onAnswerPress }: QuestionCardProps) {
  return (
    <View style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {question.askedBy.firstName} {question.askedBy.lastName}
          </Text>
          {question.askedBy.verified && (
            <MaterialIcons name="verified" size={14} color="#007bff" style={styles.verifiedIcon} />
          )}
        </View>
        <Text style={styles.questionDate}>{formatDate(question.createdAt)}</Text>
      </View>

      <Text style={styles.questionText}>{getQuestionText(question.question)}</Text>

      {question.status === 'answered' && question.answer ? (
        <View style={styles.answerContainer}>
          <View style={styles.answerHeader}>
            <Text style={styles.answerLabel}>Answer:</Text>
            {question.answeredBy && (
              <Text style={styles.answeredBy}>
                by {question.answeredBy.firstName} {question.answeredBy.lastName}
              </Text>
            )}
          </View>
          <Text style={styles.answerText}>{getAnswerText(question.answer)}</Text>
          {question.answeredAt && (
            <Text style={styles.answeredDate}>
              {formatDate(question.answeredAt)}
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.pendingContainer}>
          <Ionicons name="time-outline" size={14} color="#ffc107" />
          <Text style={styles.pendingText}>Waiting for answer...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  questionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  questionDate: {
    fontSize: 12,
    color: '#999',
  },
  questionText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  answerContainer: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#28a745',
  },
  answeredBy: {
    fontSize: 11,
    color: '#666',
    marginLeft: 6,
  },
  answerText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 4,
  },
  answeredDate: {
    fontSize: 10,
    color: '#999',
    textAlign: 'right',
  },
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pendingText: {
    fontSize: 13,
    color: '#ffc107',
    fontStyle: 'italic',
  },
});
