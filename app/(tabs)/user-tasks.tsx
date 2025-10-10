import { Task } from '@/api/types/tasks';
import { useGetUserTasks } from '@/hooks/useTaskApi';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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

interface UserTasksData {
  user: UserProfile;
  tasks: {
    created: Task[];
    completed: Task[];
    inProgress: Task[];
  };
  stats: {
    totalTasksCreated: number;
    totalTasksCompleted: number;
    averageRating: number;
    totalEarnings: number;
    responseTime: string;
  };
}

export default function UserTasksScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [activeTab, setActiveTab] = useState<'created' | 'completed' | 'progress'>('created');

  const {
    data: userTasksData,
    isLoading,
    error,
    refetch
  } = useGetUserTasks(userId || '');

  const userData: UserTasksData | null = userTasksData?.data ? {
    user: {
      _id: userId || '',
      firstName: 'John',
      lastName: 'Doe',
      email: 'user@example.com',
      rating: 4.5,
      totalReviews: 10,
      verified: true,
      joinedDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      completedTasks: 0,
      activeOffers: 0
    },
    tasks: {
      created: Array.isArray(userTasksData.data) ? userTasksData.data : [],
      completed: [],
      inProgress: []
    },
    stats: {
      totalTasksCreated: 0,
      totalTasksCompleted: 0,
      averageRating: 4.5,
      totalEarnings: 0,
      responseTime: '2 hours'
    }
  } : null;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading user profile...</Text>
      </View>
    );
  }

  if (error || !userData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="person-circle-outline" size={64} color="#ff4444" />
        <Text style={styles.errorTitle}>Failed to load user profile</Text>
        <Text style={styles.errorSubtitle}>
          Could not load user information. Please check your connection and try again.
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
      year: 'numeric'
    });
  };

  const getTasksByTab = () => {
    switch (activeTab) {
      case 'created':
        return userData.tasks.created;
      case 'completed':
        return userData.tasks.completed;
      case 'progress':
        return userData.tasks.inProgress;
      default:
        return [];
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity 
      style={styles.taskCard}
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: "/(tabs)/task-detail",
        params: { taskId: item._id }
      })}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.taskLocation}>
            {item.location?.address || 'Location not specified'}
          </Text>
          <View style={styles.taskMeta}>
            <Text style={[styles.taskStatus, 
              { color: item.status === 'completed' ? '#28a745' : 
                       item.status === 'assigned' ? '#007bff' : 
                       item.status === 'open' ? '#ffc107' : '#6c757d' }
            ]}>
              {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
            </Text>
            <Text style={styles.taskDate}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        <View style={styles.taskPrice}>
          <Text style={styles.priceText}>
            {item.formattedBudget || `${item.currency || 'A$'}${item.budget}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={16}
            color="#ffc107"
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Profile</Text>
        <TouchableOpacity style={styles.shareIcon}>
          <Ionicons 
            name="share-outline" 
            size={24} 
            color="#666"
            onPress={() => {
              Alert.alert(
                'Share Profile',
                'Profile sharing functionality will be implemented in the next phase.',
                [{ text: 'OK' }]
              );
            }}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              {userData.user.profileImage ? (
                <Image source={{ uri: userData.user.profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person" size={40} color="#666" />
                </View>
              )}
              {userData.user.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#007bff" />
                </View>
              )}
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {userData.user.firstName} {userData.user.lastName}
              </Text>
              
              <View style={styles.ratingContainer}>
                {renderStars(userData.user.rating)}
                <Text style={styles.ratingText}>
                  {userData.user.rating.toFixed(1)} ({userData.user.totalReviews} reviews)
                </Text>
              </View>
              
              <View style={styles.userMeta}>
                <Text style={styles.metaText}>
                  <Ionicons name="calendar-outline" size={14} color="#666" /> 
                  Joined {formatDate(userData.user.joinedDate)}
                </Text>
                <Text style={styles.metaText}>
                  <Ionicons name="time-outline" size={14} color="#666" /> 
                  Last active {formatDate(userData.user.lastActive)}
                </Text>
              </View>

              {userData.user.location && (
                <Text style={styles.locationText}>
                  <Ionicons name="location-outline" size={14} color="#666" /> 
                  {userData.user.location.city}, {userData.user.location.state}
                </Text>
              )}
            </View>
          </View>

          {userData.user.bio && (
            <View style={styles.bioSection}>
              <Text style={styles.bioText}>{userData.user.bio}</Text>
            </View>
          )}

          {userData.user.skills && userData.user.skills.length > 0 && (
            <View style={styles.skillsSection}>
              <Text style={styles.skillsTitle}>Skills</Text>
              <View style={styles.skillsContainer}>
                {userData.user.skills.map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Statistics Section */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Performance Stats</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.stats.totalTasksCreated}</Text>
              <Text style={styles.statLabel}>Tasks Created</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.stats.totalTasksCompleted}</Text>
              <Text style={styles.statLabel}>Tasks Completed</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.stats.averageRating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>${userData.stats.totalEarnings}</Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
            </View>
          </View>

          <View style={styles.responseTimeContainer}>
            <Text style={styles.responseTimeLabel}>Average Response Time</Text>
            <Text style={styles.responseTimeValue}>{userData.stats.responseTime}</Text>
          </View>
        </View>

        {/* Tasks Section */}
        <View style={styles.tasksCard}>
          <Text style={styles.cardTitle}>Task History</Text>
          
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'created' && styles.activeTab]}
              onPress={() => setActiveTab('created')}
            >
              <Text style={[styles.tabText, activeTab === 'created' && styles.activeTabText]}>
                Created ({userData.tasks.created.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
              onPress={() => setActiveTab('completed')}
            >
              <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
                Completed ({userData.tasks.completed.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
              onPress={() => setActiveTab('progress')}
            >
              <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>
                In Progress ({userData.tasks.inProgress.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tasks List */}
          {getTasksByTab().length === 0 ? (
            <View style={styles.emptyTasksContainer}>
              <MaterialIcons name="assignment" size={48} color="#ccc" />
              <Text style={styles.emptyTasksText}>No tasks in this category</Text>
            </View>
          ) : (
            <FlatList
              data={getTasksByTab()}
              keyExtractor={(item) => item._id}
              renderItem={renderTaskItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.messageButton}
          onPress={() => {
            Alert.alert(
              'Send Message',
              'Messaging functionality will be implemented in the next phase.',
              [{ text: 'OK' }]
            );
          }}
        >
          <Ionicons name="mail-outline" size={20} color="#007bff" />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={() => {
            Alert.alert(
              'Report User',
              'Are you sure you want to report this user?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Report', style: 'destructive' }
              ]
            );
          }}
        >
          <Ionicons name="flag-outline" size={20} color="#dc3545" />
          <Text style={styles.reportButtonText}>Report</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  shareIcon: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  userMeta: {
    gap: 4,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  bioSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bioText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  skillsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  skillsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '500',
  },
  statsCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007bff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  responseTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  responseTimeLabel: {
    fontSize: 14,
    color: '#666',
  },
  responseTimeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  tasksCard: {
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
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: '600',
  },
  emptyTasksContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTasksText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  taskCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  taskLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  taskStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  taskDate: {
    fontSize: 12,
    color: '#999',
  },
  taskPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007bff',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  reportButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
  },
});