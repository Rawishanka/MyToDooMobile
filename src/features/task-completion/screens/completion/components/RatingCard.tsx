import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CompletionRating } from '../hooks/useCompletionStatus';
import { CARD_BG, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
import { RFValue } from '@/src/shared/utils/responsive';

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
              color="#FBBF24"
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
    backgroundColor: CARD_BG,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#001A66',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: CARD_TEXT,
    marginBottom: 14,
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
    fontSize: 20,
    fontWeight: '700',
    color: CARD_TEXT,
  },
  feedback: {
    fontSize: RFValue(14),
    color: CARD_TEXT_MUTED,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  date: {
    fontSize: RFValue(12),
    color: CARD_TEXT_MUTED,
    textAlign: 'center',
  },
});
