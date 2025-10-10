import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGetTaskById, useGetTaskOffers } from '@/hooks/useTaskApi';
import { useAcceptOffer } from '@/hooks/useTaskApi';

export default function AcceptOfferScreen() {
  const router = useRouter();
  const { taskId, offerId } = useLocalSearchParams<{ 
    taskId: string; 
    offerId?: string;
  }>();
  
  const [selectedOfferId, setSelectedOfferId] = useState<string>(offerId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: taskData, isLoading: isTaskLoading } = useGetTaskById(taskId || '', !!taskId);
  const { data: offersData, isLoading: isOffersLoading } = useGetTaskOffers(taskId || '', !!taskId);
  const acceptOfferMutation = useAcceptOffer();

  const task = taskData?.data;
  const offers = offersData?.data?.offers || [];
  const selectedOffer = offers.find((offer: any) => offer._id === selectedOfferId);
  const isLoading = isTaskLoading || isOffersLoading;

  const handleAcceptOffer = async () => {
    try {
      if (!selectedOfferId) {
        Alert.alert('No Offer Selected', 'Please select an offer to accept.');
        return;
      }

      setIsSubmitting(true);

      console.log('✅ Accepting offer:', selectedOfferId);

      const result = await acceptOfferMutation.mutateAsync({
        taskId: taskId!,
        offerId: selectedOfferId,
      });

      console.log('✅ Offer accepted successfully:', result);

      Alert.alert(
        'Offer Accepted! 🎉',
        'The offer has been accepted. The task performer has been notified.',
        [
          {
            text: 'View My Tasks',
            onPress: () => router.push('./mytasks-screen')
          },
          {
            text: 'Back to Task',
            onPress: () => router.push(`./task-detail?taskId=${taskId}`)
          }
        ]
      );

    } catch (error: any) {
      console.error('❌ Failed to accept offer:', error);
      Alert.alert(
        'Failed to Accept Offer',
        error?.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading offers...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
        <Text style={styles.errorTitle}>Task Not Found</Text>
        <Text style={styles.errorSubtitle}>Could not load task details.</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (offers.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Accept Offer</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Offers Yet</Text>
          <Text style={styles.emptySubtitle}>
            No offers have been submitted for this task yet. Check back later!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accept Offer</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Summary */}
        <View style={styles.taskSummary}>
          <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
          <Text style={styles.taskLocation}>
            {task.location?.address || 'Location not specified'}
          </Text>
        </View>

        {/* Offers List */}
        <View style={styles.offersContainer}>
          <Text style={styles.sectionTitle}>Available Offers ({offers.length})</Text>
          
          {offers.map((offer: any) => (
            <TouchableOpacity
              key={offer._id}
              style={[
                styles.offerCard,
                selectedOfferId === offer._id && styles.selectedOfferCard
              ]}
              onPress={() => setSelectedOfferId(offer._id)}
            >
              <View style={styles.offerHeader}>
                <View style={styles.offerUserInfo}>
                  <Text style={styles.offerUserName}>
                    {offer.taskTakerId?.firstName} {offer.taskTakerId?.lastName}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#ffc107" />
                    <Text style={styles.ratingText}>{offer.taskTakerId?.rating || 4.8} (24 reviews)</Text>
                  </View>
                </View>
                <View style={styles.offerAmount}>
                  <Text style={styles.offerPrice}>${offer.offer.amount}</Text>
                  {selectedOfferId === offer._id && (
                    <Ionicons name="checkmark-circle" size={24} color="#28a745" />
                  )}
                </View>
              </View>

              {offer.offer.message && (
                <View style={styles.offerMessage}>
                  <Text style={styles.offerMessageText}>{offer.offer.message}</Text>
                </View>
              )}

              <View style={styles.offerFooter}>
                <Text style={styles.offerDate}>
                  Submitted {new Date(offer.createdAt).toLocaleDateString()}
                </Text>
                <View style={styles.offerStatus}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: offer.status === 'pending' ? '#ffc107' : '#28a745' }
                  ]}>
                    <Text style={styles.statusText}>
                      {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Selection Info */}
          {selectedOffer && (
            <View style={styles.selectionInfo}>
              <Text style={styles.selectionTitle}>✅ Selected Offer Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Task Performer:</Text>
                <Text style={styles.summaryValue}>
                  {selectedOffer.taskTakerId?.firstName} {selectedOffer.taskTakerId?.lastName}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Offer Amount:</Text>
                <Text style={styles.summaryAmount}>${selectedOffer.offer.amount}</Text>
              </View>
              {selectedOffer.offer.message && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Message:</Text>
                  <Text style={styles.summaryValue}>{selectedOffer.offer.message}</Text>
                </View>
              )}
            </View>
          )}

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsTitle}>📋 By accepting this offer, you agree to:</Text>
            <Text style={styles.termItem}>• Pay the agreed amount upon task completion</Text>
            <Text style={styles.termItem}>• Provide clear task instructions and requirements</Text>
            <Text style={styles.termItem}>• Be available for communication during task execution</Text>
            <Text style={styles.termItem}>• Follow MyToDoo's terms of service and community guidelines</Text>
          </View>
        </View>
      </ScrollView>

      {/* Accept Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.acceptButton, (!selectedOfferId || isSubmitting) && styles.disabledButton]}
          onPress={handleAcceptOffer}
          disabled={!selectedOfferId || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.acceptButtonText}>
                Accept Offer {selectedOffer ? `($${selectedOffer.offer.amount})` : ''}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backIcon: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  taskSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  taskLocation: {
    fontSize: 14,
    color: '#666',
  },
  offersContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  offerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedOfferCard: {
    borderColor: '#28a745',
    backgroundColor: '#f8fff9',
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  offerUserInfo: {
    flex: 1,
  },
  offerUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  offerAmount: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
  },
  offerPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#28a745',
  },
  offerMessage: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  offerMessageText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  offerStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  selectionInfo: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#2e7d32',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  summaryAmount: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '700',
  },
  termsContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  termItem: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  acceptButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});