import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Clipboard, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RequestReviewModal } from './RequestReviewModal';

interface GetMoreReviewsProps {
  userId: string;
}

export const GetMoreReviewsSection: React.FC<GetMoreReviewsProps> = ({ userId }) => {
  const [showRequestModal, setShowRequestModal] = useState(false);

  const handleShareReviewLink = async () => {
    try {
      // Generate review link - you can customize this URL based on your hosting
      const reviewLink = `${__DEV__ ? 'http://localhost:5173' : 'https://mytodoo.app'}/review/${userId}`;
      
      // Try to share using React Native's built-in Share API
      const result = await Share.share({
        message: `Check out my profile and leave a review: ${reviewLink}`,
        url: reviewLink,
        title: 'Share Review Link',
      });

      if (result.action === Share.sharedAction) {
        Alert.alert('Success', 'Review link shared successfully!');
      } else if (result.action === Share.dismissedAction) {
        // User dismissed the share dialog, copy to clipboard as fallback
        await Clipboard.setString(reviewLink);
        Alert.alert('Link Copied', 'Review link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
      // Fallback: try to copy to clipboard
      try {
        const reviewLink = `${__DEV__ ? 'http://localhost:5173' : 'https://mytodoo.app'}/review/${userId}`;
        await Clipboard.setString(reviewLink);
        Alert.alert('Link Copied', 'Review link copied to clipboard!');
      } catch (clipboardError) {
        Alert.alert('Error', 'Failed to share or copy review link');
      }
    }
  };

  const handleRequestReview = () => {
    setShowRequestModal(true);
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Get More Reviews</Text>
        <Text style={styles.subtitle}>
          Share your profile or request reviews from people you've worked with
        </Text>

        <View style={styles.actionsContainer}>
          {/* Share Review Link */}
          <TouchableOpacity style={styles.shareButton} onPress={handleShareReviewLink}>
            <View style={styles.iconContainer}>
              <Ionicons name="link" size={24} color="#007AFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Share Review Link</Text>
              <Text style={styles.actionSubtitle}>Copy link to share</Text>
            </View>
          </TouchableOpacity>

          {/* Request Review */}
          <TouchableOpacity style={styles.requestButton} onPress={handleRequestReview}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail" size={24} color="#28A745" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Request Review</Text>
              <Text style={styles.actionSubtitle}>Send email/SMS request</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* How it works */}
        <View style={styles.howItWorksContainer}>
          <View style={styles.howItWorksHeader}>
            <Ionicons name="information-circle" size={20} color="#007AFF" />
            <Text style={styles.howItWorksTitle}>How it works</Text>
          </View>
          
          <View style={styles.stepsList}>
            <View style={styles.step}>
              <Text style={styles.stepBullet}>•</Text>
              <Text style={styles.stepText}>
                <Text style={styles.stepLabel}>Share Link:</Text> Anyone with the link can leave you a review
              </Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepBullet}>•</Text>
              <Text style={styles.stepText}>
                <Text style={styles.stepLabel}>Request Review:</Text> Send a personalized request via email or SMS
              </Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepBullet}>•</Text>
              <Text style={styles.stepText}>
                Reviews help build trust and credibility in the community
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Request Review Modal */}
      <RequestReviewModal
        visible={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        userId={userId}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  requestButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6FFE6',
  },
  iconContainer: {
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  howItWorksContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  howItWorksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  howItWorksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  stepsList: {
    gap: 8,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepBullet: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 8,
    marginTop: 2,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  stepLabel: {
    fontWeight: '600',
    color: '#007AFF',
  },
});