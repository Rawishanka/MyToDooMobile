import { useSimulateVerification } from '@/src/shared/hooks/useRatifyIdApi';
import { useGetUserProfile } from '@/src/shared/hooks/useUserProfileApi';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface IDVerificationScreenProps {
  onBack: () => void;
  userData?: any;
}

export default function IDVerificationScreen({ onBack, userData }: IDVerificationScreenProps) {
  const { refetch } = useGetUserProfile();
  const simulateVerification = useSimulateVerification();

  // 🔧 **DEBUG: Log verification status**
  const isVerified = userData?.isVerified || userData?.verified || false;


  // 🔧 **TEMPORARY: Force show button for testing (remove this later)**
  const forceShowButton = true; // Change to false when API is integrated

  const handleStartVerification = () => {

    Alert.alert(
      'Start ID Verification',
      'This will start the ID verification process using Ratify ID service. You will need to provide a government-issued photo ID.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Verification', 
          onPress: () => {

            // For now, show a placeholder message until real API is provided
            Alert.alert(
              'Ratify ID Integration Ready',
              'The verification button is working! Ready to integrate with Ratify ID API when you provide the endpoint.',
              [
                { 
                  text: 'Simulate Success', 
                  onPress: () => {
                    // Simulate successful verification
                    const userId = userData?._id || userData?.id || 'current-user';
                    
                    simulateVerification.mutate(
                      { userId },
                      {
                        onSuccess: () => {
                          Alert.alert(
                            'Verification Completed!',
                            'Your ID has been successfully verified. You now have a verified badge on your profile.',
                            [{ 
                              text: 'OK', 
                              onPress: () => {
                                refetch(); // Refresh user profile data
                                onBack(); // Go back to profile screen
                              }
                            }]
                          );
                        },
                        onError: (error) => {
                          Alert.alert(
                            'Verification Failed',
                            'There was an error processing your verification. Please try again later.',
                            [{ text: 'OK' }]
                          );
                        }
                      }
                    );
                  }
                },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          }
        }
      ]
    );
  };

  const verificationStatus = isVerified ? 'verified' : 'not-verified';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="#0052A2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ID Verification</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Verification Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={[
            styles.statusIconContainer, 
            isVerified ? styles.verifiedIcon : styles.unverifiedIcon
          ]}>
            <Ionicons 
              name={isVerified ? "checkmark-circle" : "alert-circle"} 
              size={28} 
              color={isVerified ? "#28a745" : "#ffc107"} 
            />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>
              {isVerified ? 'Identity Verified' : 'Identity Not Verified'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {isVerified 
                ? 'Your identity has been successfully verified' 
                : 'Verify your identity to build trust with other users'
              }
            </Text>
          </View>
        </View>

        {/* Verification Badge */}
        <View style={[
          styles.verificationBadge,
          isVerified ? styles.verifiedBadge : styles.unverifiedBadge
        ]}>
          <Ionicons 
            name={isVerified ? "shield-checkmark" : "shield-outline"} 
            size={16} 
            color={isVerified ? "#28a745" : "#666"} 
          />
          <Text style={[
            styles.badgeText,
            isVerified ? styles.verifiedBadgeText : styles.unverifiedBadgeText
          ]}>
            {isVerified ? 'Verified' : 'Not Verified'}
          </Text>
        </View>
      </View>

      {/* Benefits Section */}
      <View style={styles.benefitsSection}>
        <Text style={styles.sectionTitle}>Benefits of ID Verification</Text>
        
        <View style={styles.benefitItem}>
          <MaterialIcons name="verified-user" size={24} color="#28a745" />
          <View style={styles.benefitText}>
            <Text style={styles.benefitTitle}>Build Trust</Text>
            <Text style={styles.benefitDescription}>
              Users are more likely to hire verified Taskers
            </Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <MaterialIcons name="trending-up" size={24} color="#0052A2" />
          <View style={styles.benefitText}>
            <Text style={styles.benefitTitle}>Get More Jobs</Text>
            <Text style={styles.benefitDescription}>
              Verified profiles appear higher in search results
            </Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <MaterialIcons name="security" size={24} color="#ffc107" />
          <View style={styles.benefitText}>
            <Text style={styles.benefitTitle}>Enhanced Security</Text>
            <Text style={styles.benefitDescription}>
              Protect your account and transactions
            </Text>
          </View>
        </View>
      </View>

      {/* Requirements Section */}
      <View style={styles.requirementsSection}>
        <Text style={styles.sectionTitle}>What You'll Need</Text>
        
        <View style={styles.requirementItem}>
          <Ionicons name="document-text-outline" size={20} color="#0052A2" />
          <Text style={styles.requirementText}>Government-issued photo ID</Text>
        </View>

        <View style={styles.requirementItem}>
          <Ionicons name="camera-outline" size={20} color="#0052A2" />
          <Text style={styles.requirementText}>Clear photos of your ID</Text>
        </View>

        <View style={styles.requirementItem}>
          <Ionicons name="time-outline" size={20} color="#0052A2" />
          <Text style={styles.requirementText}>5-10 minutes of your time</Text>
        </View>
      </View>

      {/* Action Section - ALWAYS SHOW BUTTON FOR NOW */}
      <View style={styles.actionSection}>
        {/* Show button if not verified OR if we're forcing it to show */}
        {(!isVerified || forceShowButton) && (
          <TouchableOpacity 
            style={[styles.startButton, simulateVerification.isPending && styles.disabledButton]} 
            onPress={handleStartVerification}
            disabled={simulateVerification.isPending}
          >
            {simulateVerification.isPending ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.buttonText}>Verifying...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Start Verification</Text>
            )}
          </TouchableOpacity>
        )}

        {isVerified && !forceShowButton && (
          <View style={styles.verifiedContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#28a745" />
            <Text style={styles.verifiedMessage}>
              Your identity has been verified successfully!
            </Text>
          </View>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Verification Process</Text>
        <Text style={styles.infoText}>
          • We use advanced security measures to protect your information{'\n'}
          • Your documents are encrypted and securely stored{'\n'}
          • Verification typically takes 1-2 business days{'\n'}
          • You'll be notified once verification is complete
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  verifiedIcon: {
    backgroundColor: '#e8f5e8',
  },
  unverifiedIcon: {
    backgroundColor: '#fff3cd',
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  verifiedBadge: {
    backgroundColor: '#e8f5e8',
    borderColor: '#28a745',
  },
  unverifiedBadge: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  verifiedBadgeText: {
    color: '#28a745',
  },
  unverifiedBadgeText: {
    color: '#666',
  },
  benefitsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  benefitText: {
    marginLeft: 15,
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  requirementsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requirementText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  actionSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#0052A2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  verifiedMessage: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
    marginLeft: 8,
  },
  infoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});