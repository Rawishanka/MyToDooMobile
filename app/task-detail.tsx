import { Task } from '@/api/types/tasks';
import { useGetTaskById } from '@/hooks/useTaskApi';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function TaskDetailScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [activeTab, setActiveTab] = useState<'offers' | 'questions'>('offers');

  const {
    data: taskData,
    isLoading,
    error,
    refetch
  } = useGetTaskById(taskId || '', !!taskId);

  const task = taskData?.data as Task;
  const user = taskData?.user;

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
          onPress={() => router.back()}
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
    router.push(`/make-offer-screen?taskId=${taskId}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
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
});