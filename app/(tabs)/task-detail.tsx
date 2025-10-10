import { Task } from '@/api/types/tasks';
import { useGetTaskById } from '@/hooks/useTaskApi';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function TaskDetailScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <TouchableOpacity style={styles.shareIcon}>
          <Ionicons name="share-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Title & Status */}
        <View style={styles.titleSection}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { 
              backgroundColor: task.status === 'completed' ? '#28a745' : 
                             task.status === 'assigned' ? '#007bff' : 
                             task.status === 'open' ? '#ffc107' : '#6c757d' 
            }]}>
              <Text style={styles.statusText}>
                {task.status?.charAt(0).toUpperCase() + task.status?.slice(1)}
              </Text>
            </View>
            <Text style={styles.taskDate}>
              Posted {formatDate(task.createdAt)}
            </Text>
          </View>
        </View>

        {/* Budget */}
        <View style={styles.budgetSection}>
          <Text style={styles.budgetLabel}>Budget</Text>
          <Text style={styles.budgetAmount}>
            {task.formattedBudget || `${task.currency || 'A$'}${task.budget}`}
          </Text>
        </View>

        {/* Location */}
        <View style={styles.locationSection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="location-on" size={20} color="#007bff" />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <Text style={styles.locationText}>
            {task.location?.address || 'Location not specified'}
          </Text>
          {task.dateType && (
            <Text style={styles.dateTypeText}>
              Date: {task.formattedDate || task.dateType}
            </Text>
          )}
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="description" size={20} color="#007bff" />
            <Text style={styles.sectionTitle}>Description</Text>
          </View>
          <Text style={styles.descriptionText}>
            {task.details || 'No description provided.'}
          </Text>
        </View>

        {/* Categories */}
        {task.categories && task.categories.length > 0 && (
          <View style={styles.categoriesSection}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="category" size={20} color="#007bff" />
              <Text style={styles.sectionTitle}>Categories</Text>
            </View>
            <View style={styles.categoriesContainer}>
              {task.categories.map((category, index) => (
                <View key={index} style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{category}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Task Creator */}
        {task.createdBy && (
          <View style={styles.creatorSection}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="person" size={20} color="#007bff" />
              <Text style={styles.sectionTitle}>Posted by</Text>
            </View>
            <TouchableOpacity 
              style={styles.creatorInfo}
              onPress={() => router.push({
                pathname: "/user-tasks" as any,
                params: { userId: task.createdBy._id }
              })}
              activeOpacity={0.7}
            >
              <Image
                source={{ 
                  uri: `https://ui-avatars.com/api/?name=${task.createdBy.firstName}+${task.createdBy.lastName}&background=random` 
                }}
                style={styles.creatorAvatar}
              />
              <View style={styles.creatorDetails}>
                <Text style={styles.creatorName}>
                  {task.createdBy.firstName} {task.createdBy.lastName}
                </Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#ffc107" />
                  <Text style={styles.ratingText}>
                    {task.createdBy.rating || 'No rating'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* Images */}
        {task.images && task.images.length > 0 && (
          <View style={styles.imagesSection}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="photo" size={20} color="#007bff" />
              <Text style={styles.sectionTitle}>Photos</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {task.images.map((imageUrl, index) => (
                <Image
                  key={index}
                  source={{ uri: imageUrl }}
                  style={styles.taskImage}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push({
              pathname: "/task-questions" as any,
              params: { taskId: task._id }
            })}
          >
            <Ionicons name="help-circle-outline" size={20} color="#007bff" />
            <Text style={styles.secondaryButtonText}>Q&A</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push({
              pathname: "/(tabs)/task-offers",
              params: { taskId: task._id }
            })}
          >
            <Ionicons name="people-outline" size={20} color="#007bff" />
            <Text style={styles.secondaryButtonText}>View Offers</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push({
              pathname: "/task-completion-status" as any,
              params: { taskId: task._id }
            })}
          >
            <Ionicons name="checkmark-done-outline" size={20} color="#007bff" />
            <Text style={styles.secondaryButtonText}>Status</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => {
              Alert.alert(
                'Payment History',
                'Payment history functionality will be implemented in the next phase.',
                [{ text: 'OK' }]
              );
            }}
          >
            <Ionicons name="card-outline" size={20} color="#007bff" />
            <Text style={styles.secondaryButtonText}>Payments</Text>
          </TouchableOpacity>
        </View>
        
        {task.status === 'open' && (
          <TouchableOpacity 
            style={styles.makeOfferButton}
            onPress={() => router.push(`./make-offer-screen?taskId=${taskId}`)}
          >
            <Text style={styles.makeOfferButtonText}>Make an Offer</Text>
          </TouchableOpacity>
        )}

        {/* Accept Offer Button - Show if there are offers */}
        <TouchableOpacity 
          style={[styles.actionButton, { marginTop: 10 }]}
          onPress={() => router.push(`./accept-offer-screen?taskId=${taskId}`)}
        >
          <Text style={styles.actionButtonText}>Accept Offer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={() => router.push(`./ask-question-screen?taskId=${taskId}`)}
        >
          <Ionicons name="help-circle-outline" size={20} color="#007bff" />
          <Text style={styles.contactButtonText}>Ask Question</Text>
        </TouchableOpacity>

        {/* Additional Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push(`./accept-task-screen?taskId=${taskId}`)}
          >
            <Text style={styles.actionButtonText}>Accept Task</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push(`./complete-payment-screen?taskId=${taskId}`)}
          >
            <Text style={styles.actionButtonText}>Complete Payment</Text>
          </TouchableOpacity>
        </View>
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
  shareIcon: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    lineHeight: 30,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  taskDate: {
    fontSize: 14,
    color: '#666',
  },
  budgetSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  budgetLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007bff',
  },
  locationSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  dateTypeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  descriptionSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  categoriesSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  creatorSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
  },
  creatorDetails: {
    marginLeft: 12,
    flex: 1,
  },
  creatorName: {
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
  imagesSection: {
    paddingVertical: 20,
  },
  taskImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
    gap: 6,
  },
  secondaryButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '600',
  },
  makeOfferButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  makeOfferButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
    gap: 8,
  },
  contactButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  actionButtonText: {
    color: '#495057',
    fontSize: 14,
    fontWeight: '600',
  },
});