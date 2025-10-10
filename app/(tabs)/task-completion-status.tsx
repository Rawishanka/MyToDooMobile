import { useGetTaskCompletionStatus } from '@/hooks/useTaskApi';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CompletionStatusData {
  _id: string;
  taskId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'verified' | 'disputed';
  completedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    verified?: boolean;
  };
  completedAt?: string;
  verificationRequired: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  verifiedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  verifiedAt?: string;
  notes?: string;
  milestones?: {
    _id: string;
    title: string;
    description: string;
    completed: boolean;
    completedAt?: string;
  }[];
  evidence?: {
    type: 'image' | 'document' | 'video';
    url: string;
    uploadedAt: string;
  }[];
  rating?: {
    score: number;
    feedback: string;
    ratedBy: string;
    ratedAt: string;
  };
}

export default function TaskCompletionStatusScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [showMarkCompleteModal, setShowMarkCompleteModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  const {
    data: completionData,
    isLoading,
    error,
    refetch
  } = useGetTaskCompletionStatus(taskId || '');

  const completion: any = completionData?.data || null;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading completion status...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
        <Text style={styles.errorTitle}>Failed to load completion status</Text>
        <Text style={styles.errorSubtitle}>
          Could not load task completion information. Please check your connection and try again.
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'verified': return '#28a745';
      case 'in_progress': return '#007bff';
      case 'disputed': return '#dc3545';
      case 'not_started': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'verified': return 'shield-checkmark';
      case 'in_progress': return 'hourglass';
      case 'disputed': return 'warning';
      case 'not_started': return 'ellipse-outline';
      default: return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarkComplete = () => {
    Alert.alert(
      'Task Marked Complete',
      'The task has been marked as completed and is pending verification.',
      [
        {
          text: 'OK',
          onPress: () => {
            setCompletionNotes('');
            setShowMarkCompleteModal(false);
            refetch();
          }
        }
      ]
    );
  };

  const renderMilestone = (milestone: any, index: number) => (
    <View key={milestone._id} style={styles.milestoneItem}>
      <View style={styles.milestoneIndicator}>
        <View style={[
          styles.milestoneCircle, 
          { backgroundColor: milestone.completed ? '#28a745' : '#ddd' }
        ]}>
          {milestone.completed && (
            <Ionicons name="checkmark" size={16} color="#fff" />
          )}
        </View>
        {index < (completion?.milestones?.length || 0) - 1 && (
          <View style={[
            styles.milestoneLine,
            { backgroundColor: milestone.completed ? '#28a745' : '#ddd' }
          ]} />
        )}
      </View>
      
      <View style={styles.milestoneContent}>
        <Text style={[
          styles.milestoneTitle,
          { color: milestone.completed ? '#28a745' : '#333' }
        ]}>
          {milestone.title}
        </Text>
        <Text style={styles.milestoneDescription}>
          {milestone.description}
        </Text>
        {milestone.completed && milestone.completedAt && (
          <Text style={styles.milestoneDate}>
            Completed: {formatDate(milestone.completedAt)}
          </Text>
        )}
      </View>
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
        <Text style={styles.headerTitle}>Completion Status</Text>
        <TouchableOpacity style={styles.helpIcon}>
          <Ionicons 
            name="help-circle-outline" 
            size={24} 
            color="#666"
            onPress={() => {
              Alert.alert(
                'Completion Help',
                'This screen shows the completion status and progress of your task. Mark tasks complete when finished.',
                [{ text: 'OK' }]
              );
            }}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!completion ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="assignment" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No completion data</Text>
            <Text style={styles.emptySubtitle}>
              This task doesn't have completion tracking enabled or hasn't been started yet.
            </Text>
          </View>
        ) : (
          <>
            {/* Status Overview */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View style={styles.statusIndicator}>
                  <Ionicons 
                    name={getStatusIcon(completion.status) as any} 
                    size={32} 
                    color={getStatusColor(completion.status)} 
                  />
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(completion.status) }
                  ]}>
                    {completion.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>

              {completion.completedBy && (
                <View style={styles.completionInfo}>
                  <Text style={styles.completionLabel}>Completed by:</Text>
                  <Text style={styles.completionValue}>
                    {completion.completedBy.firstName} {completion.completedBy.lastName}
                    {completion.completedBy.verified && ' ✓'}
                  </Text>
                </View>
              )}

              {completion.completedAt && (
                <View style={styles.completionInfo}>
                  <Text style={styles.completionLabel}>Completed on:</Text>
                  <Text style={styles.completionValue}>
                    {formatDate(completion.completedAt)}
                  </Text>
                </View>
              )}

              {completion.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.notesLabel}>Completion Notes:</Text>
                  <Text style={styles.notesText}>{completion.notes}</Text>
                </View>
              )}
            </View>

            {/* Verification Status */}
            {completion.verificationRequired && (
              <View style={styles.verificationCard}>
                <Text style={styles.cardTitle}>Verification Status</Text>
                
                <View style={styles.verificationStatus}>
                  <View style={styles.verificationIndicator}>
                    <Ionicons 
                      name={
                        completion.verificationStatus === 'approved' ? 'shield-checkmark' :
                        completion.verificationStatus === 'rejected' ? 'shield' :
                        'shield-outline'
                      } 
                      size={24} 
                      color={
                        completion.verificationStatus === 'approved' ? '#28a745' :
                        completion.verificationStatus === 'rejected' ? '#dc3545' :
                        '#ffc107'
                      } 
                    />
                    <Text style={styles.verificationText}>
                      {completion.verificationStatus?.toUpperCase() || 'PENDING'}
                    </Text>
                  </View>
                </View>

                {completion.verifiedBy && (
                  <View style={styles.completionInfo}>
                    <Text style={styles.completionLabel}>Verified by:</Text>
                    <Text style={styles.completionValue}>
                      {completion.verifiedBy.firstName} {completion.verifiedBy.lastName}
                    </Text>
                  </View>
                )}

                {completion.verifiedAt && (
                  <View style={styles.completionInfo}>
                    <Text style={styles.completionLabel}>Verified on:</Text>
                    <Text style={styles.completionValue}>
                      {formatDate(completion.verifiedAt)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Milestones */}
            {completion.milestones && completion.milestones.length > 0 && (
              <View style={styles.milestonesCard}>
                <Text style={styles.cardTitle}>Project Milestones</Text>
                
                <View style={styles.milestonesProgress}>
                  <Text style={styles.progressText}>
                    {completion.milestones?.filter((m: any) => m.completed).length || 0} of {completion.milestones?.length || 0} completed
                  </Text>
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill,
                      { 
                        width: `${((completion.milestones?.filter((m: any) => m.completed).length || 0) / (completion.milestones?.length || 1)) * 100}%` 
                      }
                    ]} />
                  </View>
                </View>

                <View style={styles.milestonesList}>
                  {completion.milestones?.map((milestone: any, index: number) =>
                    renderMilestone(milestone, index)
                  )}
                </View>
              </View>
            )}

            {/* Rating */}
            {completion.rating && (
              <View style={styles.ratingCard}>
                <Text style={styles.cardTitle}>Task Rating</Text>
                
                <View style={styles.ratingDisplay}>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= completion.rating!.score ? "star" : "star-outline"}
                        size={24}
                        color="#ffc107"
                      />
                    ))}
                  </View>
                  <Text style={styles.ratingScore}>
                    {completion.rating.score}/5
                  </Text>
                </View>

                {completion.rating.feedback && (
                  <Text style={styles.ratingFeedback}>
                    "{completion.rating.feedback}"
                  </Text>
                )}

                <Text style={styles.ratingDate}>
                  Rated on {formatDate(completion.rating.ratedAt)}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Action Button */}
      {completion && completion.status === 'in_progress' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={() => setShowMarkCompleteModal(true)}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.completeButtonText}>Mark as Complete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Mark Complete Modal */}
      <Modal
        visible={showMarkCompleteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMarkCompleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mark Task Complete</Text>
              <TouchableOpacity onPress={() => setShowMarkCompleteModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              Add any notes about the task completion (optional):
            </Text>
            
            <TextInput
              style={styles.notesInput}
              placeholder="Completion notes..."
              placeholderTextColor="#999"
              value={completionNotes}
              onChangeText={setCompletionNotes}
              multiline={true}
              textAlignVertical="top"
              maxLength={500}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowMarkCompleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleMarkComplete}
              >
                <Text style={styles.confirmButtonText}>Mark Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  helpIcon: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 100,
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
  },
  statusCard: {
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
  statusHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
  },
  completionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  completionLabel: {
    fontSize: 14,
    color: '#666',
  },
  completionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  notesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  verificationCard: {
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
  verificationStatus: {
    alignItems: 'center',
    marginBottom: 16,
  },
  verificationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verificationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  milestonesCard: {
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
  milestonesProgress: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 3,
  },
  milestonesList: {
    gap: 16,
  },
  milestoneItem: {
    flexDirection: 'row',
    gap: 12,
  },
  milestoneIndicator: {
    alignItems: 'center',
  },
  milestoneCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  milestoneDate: {
    fontSize: 12,
    color: '#999',
  },
  ratingCard: {
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
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingScore: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  ratingFeedback: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  ratingDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  actionContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});