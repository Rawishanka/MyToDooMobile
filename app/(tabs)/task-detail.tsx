import { Task } from '@/api/types/tasks';
import { useGetTaskById, useGetTaskOffers } from '@/hooks/useTaskApi';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function TaskDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  // @ts-ignore
  const { taskId } = route.params || {};
  const [activeTab, setActiveTab] = useState<'offers' | 'questions'>('offers');

  const {
    data: taskData,
    isLoading,
    error,
    refetch
  } = useGetTaskById(taskId || '', !!taskId);

  // Fetch offers for this task
  const {
    data: offersData,
    isLoading: isLoadingOffers,
  } = useGetTaskOffers(taskId || '', !!taskId);

  const task = taskData?.data as Task;
  const user = taskData?.user;
  const offers = offersData?.data?.offers || [];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading task details...</Text>
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
        <Text style={styles.errorTitle}>Failed to load task</Text>
        <Text style={styles.errorSubtitle}>
          Could not load task details. Please check your connection and try again.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getLocationIcon = (): "location-outline" | "desktop-outline" | "car-outline" => {
    const address = task.location?.address || '';
    if (address.toLowerCase().includes('online') || address.toLowerCase().includes('remote')) {
      return 'desktop-outline';
    } else if (address.includes(' → ') || address.includes(' to ')) {
      return 'car-outline';
    }
    return 'location-outline';
  };

  const getTimeDisplay = () => {
    if (task.dateType === 'before') return 'Before specific date';
    if (task.dateType === 'no-rush') return 'No rush';
    if (task.time && task.time !== 'Anytime') return task.time;
    return 'Flexible';
  };

  const handleMakeOffer = () => {
    // @ts-ignore
    navigation.navigate('make-offer-screen', { taskId });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonHeader}>
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Make Offer Section */}
        <View style={styles.makeOfferSection}>
          <Text style={styles.makeOfferTitle}>Make an offer now</Text>
          <Text style={styles.viewersText}>31 Taskers have viewed this task already</Text>
          
          <TouchableOpacity style={styles.makeOfferButton} onPress={handleMakeOffer}>
            <Text style={styles.makeOfferButtonText}>Make offer</Text>
          </TouchableOpacity>
        </View>

        {/* Task Details Card */}
        <View style={styles.taskCard}>
          {/* User Avatar */}
          <View style={styles.avatarContainer}>
            <Image
              source={{ 
                uri: `https://ui-avatars.com/api/?name=${task.createdBy?.firstName}+${task.createdBy?.lastName}&background=random&size=60` 
              }}
              style={styles.userAvatar}
            />
          </View>

          {/* Task Title */}
          <Text style={styles.taskTitle}>{task.title}</Text>

          {/* Poster Info */}
          <View style={styles.posterInfo}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.posterName}>
              {task.createdBy?.firstName} {task.createdBy?.lastName}
            </Text>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New!</Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.detailRow}>
            <Ionicons name={getLocationIcon()} size={16} color="#666" />
            <Text style={styles.detailText}>
              {task.location?.address?.includes('remote') || task.location?.address?.includes('Remote') 
                ? 'Remote' 
                : task.location?.address || 'Location not specified'}
            </Text>
          </View>

          {/* Timing */}
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{getTimeDisplay()}</Text>
          </View>

          {/* Budget */}
          <View style={styles.budgetRow}>
            <Text style={styles.budgetSymbol}>$</Text>
            <View style={styles.budgetInfo}>
              <Text style={styles.budgetAmount}>
                {task.budget || 10} SGD
              </Text>
              <Text style={styles.budgetLabel}>Budget</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            {task.details || 'No description provided.'}
          </Text>

          {/* Note */}
          <Text style={styles.note}>
            Note: It is equity share not the 10 dollar listed above
          </Text>
        </View>

        {/* Offers/Questions Section */}
        {activeTab === 'offers' && (
          <View style={styles.offersSection}>
            <Text style={styles.sectionTitle}>Offers ({offers.length})</Text>
            
            {isLoadingOffers ? (
              <View style={styles.loadingOffersContainer}>
                <ActivityIndicator size="small" color="#007bff" />
                <Text style={styles.loadingOffersText}>Loading offers...</Text>
              </View>
            ) : offers.length === 0 ? (
              <View style={styles.emptyOffersContainer}>
                <Ionicons name="document-outline" size={48} color="#ccc" />
                <Text style={styles.emptyOffersText}>No offers yet</Text>
                <Text style={styles.emptyOffersSubtext}>Be the first to make an offer!</Text>
              </View>
            ) : (
              <FlatList
                data={offers}
                scrollEnabled={false}
                keyExtractor={(item: any) => item._id}
                renderItem={({ item: offer }: { item: any }) => (
                  <View style={styles.offerCard}>
                    {/* Offer User Info */}
                    <View style={styles.offerHeader}>
                      <View style={styles.offerUserInfo}>
                        <Image
                          source={{ 
                            uri: `https://ui-avatars.com/api/?name=${offer.taskTakerId?.firstName || 'User'}+${offer.taskTakerId?.lastName || ''}&background=007bff&color=fff&size=40` 
                          }}
                          style={styles.offerUserAvatar}
                        />
                        <View>
                          <Text style={styles.offerUserName}>
                            {offer.taskTakerId?.firstName || 'User'} {offer.taskTakerId?.lastName || ''}
                          </Text>
                          {offer.taskTakerId?.rating && (
                            <View style={styles.offerRating}>
                              <Ionicons name="star" size={14} color="#FFB800" />
                              <Text style={styles.offerRatingText}>
                                {offer.taskTakerId.rating.toFixed(1)} ({offer.taskTakerId.completedTasks || 0} jobs)
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      {offer.status && (
                        <View style={[
                          styles.offerStatusBadge,
                          offer.status === 'accepted' && styles.offerStatusAccepted,
                          offer.status === 'rejected' && styles.offerStatusRejected,
                        ]}>
                          <Text style={styles.offerStatusText}>
                            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Offer Amount */}
                    <View style={styles.offerAmountContainer}>
                      <Text style={styles.offerAmountLabel}>Offer Amount:</Text>
                      <Text style={styles.offerAmount}>
                        ${offer.offer?.amount || offer.amount || 0} {offer.offer?.currency || 'SGD'}
                      </Text>
                    </View>

                    {/* Offer Message */}
                    {(offer.offer?.message || offer.message) && (
                      <View style={styles.offerMessageContainer}>
                        <Text style={styles.offerMessageLabel}>Message:</Text>
                        <Text style={styles.offerMessage}>
                          {offer.offer?.message || offer.message}
                        </Text>
                      </View>
                    )}

                    {/* Offer Date */}
                    <Text style={styles.offerDate}>
                      Offered {new Date(offer.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                )}
              />
            )}
          </View>
        )}

        {activeTab === 'questions' && (
          <View style={styles.questionsSection}>
            <Text style={styles.sectionTitle}>Questions</Text>
            <View style={styles.emptyQuestionsContainer}>
              <Ionicons name="help-circle-outline" size={48} color="#ccc" />
              <Text style={styles.emptyQuestionsText}>No questions yet</Text>
              <Text style={styles.emptyQuestionsSubtext}>Ask a question about this task</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Tabs */}
      <View style={styles.bottomTabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'offers' && styles.activeTab]}
          onPress={() => setActiveTab('offers')}
        >
          <Text style={[styles.tabText, activeTab === 'offers' && styles.activeTabText]}>
            Offers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'questions' && styles.activeTab]}
          onPress={() => setActiveTab('questions')}
        >
          <Text style={[styles.tabText, activeTab === 'questions' && styles.activeTabText]}>
            Questions
          </Text>
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
  },
  backButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 5,
  },
  moreButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  makeOfferSection: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 25,
    marginBottom: 20,
  },
  makeOfferTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  viewersText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  makeOfferButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  makeOfferButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  taskCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  posterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  posterName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
    marginRight: 10,
  },
  newBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  budgetSymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginRight: 8,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  budgetLabel: {
    fontSize: 12,
    color: '#666',
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 15,
  },
  note: {
    fontSize: 12,
    color: '#ff6b6b',
    fontStyle: 'italic',
  },
  bottomTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  // Offers Section Styles
  offersSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  questionsSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  loadingOffersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingOffersText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyOffersContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyOffersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptyOffersSubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 4,
  },
  emptyQuestionsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyQuestionsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptyQuestionsSubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 4,
  },
  offerCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  offerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  offerUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  offerUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  offerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerRatingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  offerStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFC107',
  },
  offerStatusAccepted: {
    backgroundColor: '#4CAF50',
  },
  offerStatusRejected: {
    backgroundColor: '#F44336',
  },
  offerStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  offerAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  offerAmountLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  offerAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007bff',
  },
  offerMessageContainer: {
    marginBottom: 12,
  },
  offerMessageLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  offerMessage: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  offerDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});