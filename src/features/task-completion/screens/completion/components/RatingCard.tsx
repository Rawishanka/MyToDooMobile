import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CompletionRating } from '../hooks/useCompletionStatus';

interface RatingCardProps {
  rating: CompletionRating;
  formatDate: (date: string) => string;
}

export default function RatingCard({ rating, formatDate }: RatingCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Task Rating</Text>

      <View style={styles.display}>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= rating.score ? 'star' : 'star-outline'}
              size={24}
              color="#ffc107"
            />
          ))}
        </View>
        <Text style={styles.score}>{rating.score}/5</Text>
      </View>

      {rating.feedback && <Text style={styles.feedback}>"{rating.feedback}"</Text>}

      <Text style={styles.date}>Rated on {formatDate(rating.ratedAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  display: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
  },
  score: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  feedback: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
