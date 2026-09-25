import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { formatUserName } from '@/src/utils/formatUserName';
import { RFValue } from '@/src/shared/utils/responsive';
import { HS, homeCard } from '@/src/shared/theme/homeStyle';

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  rating: number;
  totalReviews: number;
  verified: boolean;
  joinedDate: string;
  lastActive: string;
  completedTasks: number;
  activeOffers: number;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  skills?: string[];
  bio?: string;
}

interface UserInfoCardProps {
  user: UserProfile;
  formatDate: (date: string) => string;
  actualRating?: number;
  actualTotalReviews?: number;
}

export const UserInfoCard: React.FC<UserInfoCardProps> = ({ user, formatDate, actualRating, actualTotalReviews }) => {
  // Use actual rating data if available, otherwise fall back to user data
  const displayRating = actualRating !== undefined ? actualRating : (user.rating || 0);
  const displayReviews = actualTotalReviews !== undefined ? actualTotalReviews : (user.totalReviews || 0);
  
  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color="#FBBF24"
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={40} color={HS.blue} />
            </View>
          )}
          {user.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#003399" />
            </View>
          )}
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.userName}>
            {formatUserName(user.firstName, user.lastName)}
          </Text>

          <View style={styles.ratingContainer}>
            {renderStars(displayRating)}
            <Text style={styles.ratingText}>
              {displayRating.toFixed(1)} ({displayReviews} review{displayReviews !== 1 ? 's' : ''})
            </Text>
          </View>

          <View style={styles.userMeta}>
            <Text style={styles.metaText}>
              <Ionicons name="calendar-outline" size={14} color={HS.muted} /> Joined{' '}
              {formatDate(user.joinedDate)}
            </Text>
            <Text style={styles.metaText}>
              <Ionicons name="time-outline" size={14} color={HS.muted} /> Last active{' '}
              {formatDate(user.lastActive)}
            </Text>
          </View>

          {user.location && (
            <Text style={styles.locationText}>
              <Ionicons name="location-outline" size={14} color={HS.muted} /> {user.location.city},{' '}
              {user.location.state}
            </Text>
          )}
        </View>
      </View>

      {user.bio && (
        <View style={styles.bioSection}>
          <Text style={styles.bioText}>{user.bio}</Text>
        </View>
      )}

      {user.skills && user.skills.length > 0 && (
        <View style={styles.skillsSection}>
          <Text style={styles.skillsTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {user.skills.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    ...homeCard,
    padding: 16,
    marginBottom: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: HS.tintStrong,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: HS.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: HS.navy,
    marginBottom: 8,
    flexShrink: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: RFValue(14),
    color: HS.muted,
  },
  userMeta: {
    marginBottom: 4,
  },
  metaText: {
    fontSize: RFValue(12),
    color: HS.muted,
    marginBottom: 4,
  },
  locationText: {
    fontSize: RFValue(12),
    color: HS.muted,
  },
  bioSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: HS.cardBorder,
  },
  bioText: {
    fontSize: RFValue(14),
    color: HS.text,
    lineHeight: 20,
  },
  skillsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: HS.cardBorder,
  },
  skillsTitle: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: HS.navy,
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: HS.tint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: RFValue(12),
    color: HS.blue,
    fontWeight: '500',
  },
});
