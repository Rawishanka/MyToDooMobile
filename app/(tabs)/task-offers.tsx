import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  FlatList,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGetTaskOffers } from '@/hooks/useTaskApi';

interface Offer {
  _id: string;
  taskId: string;
  taskTakerId: {
    _id: string;
    firstName: string;
    lastName: string;
    rating?: number;
  };
  offer: {
    amount: number;
    currency: string;
    message: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export default function TaskOffersScreen() {
  const router = useRouter();
  const { taskId, taskTitle } = useLocalSearchParams<{ taskId: string; taskTitle?: string }>();

  const {
    data: offersData,
    isLoading,
    error,
    refetch
  } = useGetTaskOffers(taskId || '', !!taskId);

  const task = offersData?.data;
  const offers = (task?.offers || []).map((offer: any) => ({
    ...offer,
    status: offer.status as 'pending' | 'accepted' | 'rejected'
  }));

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading offers...</Text>
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
        <Text style={styles.errorTitle}>Failed to load offers</Text>
        <Text style={styles.errorSubtitle}>
          Could not load offers for this task. Please check your connection and try again.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const renderOffer = ({ item }: { item: Offer }) => (
    <View style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <View style={styles.taskerInfo}>
          <Image
            source={{ 
              uri: `https://ui-avatars.com/api/?name=${item.taskTakerId.firstName}+${item.taskTakerId.lastName}&background=random` 
            }}
            style={styles.taskerAvatar}
          />
          <View style={styles.taskerDetails}>
            <Text style={styles.taskerName}>
              {item.taskTakerId.firstName} {item.taskTakerId.lastName}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#ffc107" />
              <Text style={styles.ratingText}>
                {item.taskTakerId.rating || 'No rating'} 
              </Text>
            </View>
            <Text style={styles.offerDate}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        
        <View style={styles.offerPriceContainer}>
          <Text style={styles.offerPrice}>
            {item.offer.currency}${item.offer.amount}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      {item.offer.message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>Message:</Text>
          <Text style={styles.messageText}>{item.offer.message}</Text>
        </View>
      )}

      {item.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => {
              Alert.alert(
                'Accept Offer',
                `Accept offer from ${item.taskTakerId.firstName} for ${item.offer.currency}$${item.offer.amount}?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Accept', 
                    onPress: () => {
                      Alert.alert('Success', 'Offer acceptance will be implemented in next phase');
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.rejectButton}
            onPress={() => {
              Alert.alert(
                'Reject Offer',
                `Reject offer from ${item.taskTakerId.firstName}?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Reject', 
                    style: 'destructive',
                    onPress: () => {
                      Alert.alert('Success', 'Offer rejection will be implemented in next phase');
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        style={styles.contactButton}
        onPress={() => {
          Alert.alert('Contact', 'Messaging will be implemented in next phase');
        }}
      >
        <Ionicons name="chatbubble-outline" size={16} color="#007bff" />
        <Text style={styles.contactButtonText}>Message</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Offers</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {taskTitle || task.title}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Task Summary */}
      <View style={styles.taskSummary}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
          <Text style={styles.taskBudget}>
            Budget: {task.formattedBudget || `${task.budgetInfo?.currency}${task.budgetInfo?.amount}`}
          </Text>
        </View>
        <View style={styles.offerStats}>
          <Text style={styles.offerCount}>{task.offerCount || offers.length}</Text>
          <Text style={styles.offerLabel}>Offers</Text>
        </View>
      </View>

      {/* Offers List */}
      {offers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="clipboard-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No offers yet</Text>
          <Text style={styles.emptySubtitle}>
            Your task is live! Offers will appear here when taskers make bids.
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={() => refetch()}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item._id}
          renderItem={renderOffer}
          contentContainerStyle={{ paddingBottom: 20 }}
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
    backgroundColor: '#f8f9fa',
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
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    width: 34,
  },
  taskSummary: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskInfo: {
    flex: 1,
    marginRight: 15,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  taskBudget: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  offerStats: {
    alignItems: 'center',
  },
  offerCount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007bff',
  },
  offerLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  offerCard: {
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
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskerInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  taskerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
  },
  taskerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  taskerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  offerDate: {
    fontSize: 12,
    color: '#999',
  },
  offerPriceContainer: {
    alignItems: 'flex-end',
  },
  offerPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007bff',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  messageContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007bff',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  contactButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
});