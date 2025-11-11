import { Task } from '@/src/api/types/tasks';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TaskCardProps {
  task: Task;
  onPress?: (taskId: string) => void;
  status?: string;
  userRole?: string;
}

export default function TaskCard({ task, onPress, status, userRole }: TaskCardProps) {
  const router = useRouter();
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showPosterCancelModal, setShowPosterCancelModal] = useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState<number | null>(null);

  const handleMarkAsCompleted = () => {
    console.log('Mark as completed:', task._id);
    // TODO: API call to mark task as completed
  };

  const handleCancelTask = () => {
    // Check if this is a Poster cancelling their own posted task
    if (userRole === 'Poster' && (status === 'open' || !status)) {
      setShowPosterCancelModal(true);
    } else {
      console.log('Cancel task:', task._id);
      // TODO: API call to cancel task
    }
  };

  const handleConfirmPosterCancel = () => {
    if (selectedCancelReason === null) {
      return; // Don't proceed without a reason
    }
    console.log('Poster cancel task:', task._id, 'Reason:', selectedCancelReason);
    // TODO: API call to cancel task with reason
    setShowPosterCancelModal(false);
    setSelectedCancelReason(null);
  };

  const cancelReasons = [
    'The MyToDoo task is not longer needed',
    'The Tasker did not communicate in a timely manner.',
    'The tasker did not show up.',
    'The tasker did not have the right tools or the right skills for the job.',
    'Could not agree on a date and time that was convenient to complete the job.',
  ];

  const handleAcceptCancellation = () => {
    console.log('Accept cancellation:', task._id);
    // TODO: API call to accept cancellation
    setShowCancellationModal(false);
  };

  const handleRejectCancellation = () => {
    console.log('Reject cancellation:', task._id);
    // TODO: API call to reject cancellation
    setShowCancellationModal(false);
  };

  // Helper function to get time preference display
  const getTimePreference = () => {
    if (task.dateType === 'before') return '🕐 Before specific date';
    if (task.dateType === 'no-rush') return '⏰ No rush';
    if (task.time && task.time !== 'Anytime') return `🕒 ${task.time}`;
    return '⏰ Flexible timing';
  };

  // Helper function to get location type
  const getLocationType = () => {
    const address = task.location?.address || '';
    if (address.toLowerCase().includes('online') || address.toLowerCase().includes('remote')) {
      return '💻 Online';
    }
    if (address.includes(' → ') || address.includes(' to ')) {
      return '🚚 Moving/Delivery';
    }
    return '📍 In Person';
  };

  // Helper function to format location display
  const formatLocation = () => {
    const address = task.location?.address || 'Location not specified';
    if (address.includes(' → ') || address.includes(' to ')) {
      const parts = address.split(/\s*(?:→|to)\s*/);
      return `${parts[0]} → ${parts[1]}`;
    }
    return address;
  };

  // Get status color
  const getStatusColor = () => {
    switch (task.status) {
      case 'completed':
        return '#28a745';
      case 'assigned':
        return '#007bff';
      case 'open':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/task-detail?taskId=${task._id}`)}
    >
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.title}>{task.title}</Text>

          {/* Time and Date Information */}
          <View style={styles.metaRow}>
            <Text style={styles.timePreference}>{getTimePreference()}</Text>
          </View>

          {/* Location Information */}
          <View style={styles.metaRow}>
            <Text style={styles.locationType}>{getLocationType()}</Text>
            <Text style={styles.locationDivider}>•</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {formatLocation()}
            </Text>
          </View>

          {/* Task Status and Date */}
          <View style={styles.meta}>
            <Text style={[styles.status, { color: getStatusColor() }]}>
              {task.status?.charAt(0).toUpperCase() + task.status?.slice(1)}
            </Text>
            <Text style={styles.date}>
              {new Date(task.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {/* Categories */}
          {task.categories && Array.isArray(task.categories) && task.categories.length > 0 && (
            <View style={styles.categoriesContainer}>
              {task.categories.slice(0, 3).map((category, index) => (
                <View key={index} style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{category}</Text>
                </View>
              ))}
              {task.categories.length > 3 && (
                <Text style={styles.moreCategoriesText}>
                  +{task.categories.length - 3} more
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Price and User Info */}
        <View style={styles.price}>
          <Text style={styles.priceText}>
            {task.formattedBudget || `${task.currency || 'A$'}${task.budget}`}
          </Text>
          {task.createdBy && (
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${task.createdBy.firstName}+${task.createdBy.lastName}&background=random`,
              }}
              style={styles.userAvatar}
            />
          )}
        </View>
      </View>

      {/* Task Details */}
      {task.details && (
        <Text style={styles.description} numberOfLines={2}>
          {task.details}
        </Text>
      )}

      {/* Action Buttons */}
      <View 
        style={styles.actionButtons}
        onStartShouldSetResponder={() => true}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {status === 'accepted' ? (
          // Accepted Offers tab: Mark as Completed + Cancel
          <>
            <TouchableOpacity 
              style={styles.completedButton}
              onPress={handleMarkAsCompleted}
              activeOpacity={0.7}
            >
              <Text style={styles.completedButtonText}>Mark as Completed</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancelTask}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          // Posted tab: Edit + Cancel (removed Approve button)
          <>
            <TouchableOpacity 
              style={styles.actionButton} 
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => {
                console.log('✏️ Edit button pressed for task:', task._id);
                console.log('   Task data:', task);
                if (onPress) {
                  onPress(task._id);
                } else {
                  // Pass full task data to edit screen
                  router.push({
                    pathname: '/edit-task',
                    params: {
                      taskId: task._id,
                      task: JSON.stringify(task)
                    }
                  } as any);
                }
              }}
            >
              <MaterialIcons name="edit" size={20} color="#007bff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={handleCancelTask}
            >
              <MaterialIcons name="cancel" size={20} color="#dc3545" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Cancellation Notice for Cancelled Tab - Only for Tasker role */}
      {status === 'cancelled' && userRole === 'Tasker' && (
        <TouchableOpacity 
          style={styles.cancellationNotice}
          onPress={() => setShowCancellationModal(true)}
        >
          <MaterialIcons name="info-outline" size={16} color="#dc3545" />
          <Text style={styles.cancellationText}>Poster cancelled the task</Text>
        </TouchableOpacity>
      )}

      {/* Cancellation Confirmation Modal */}
      <Modal
        visible={showCancellationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancellationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialIcons name="cancel" size={48} color="#dc3545" style={styles.modalIcon} />
            
            <Text style={styles.modalTitle}>Task Cancelled</Text>
            <Text style={styles.modalMessage}>
              Poster has cancelled the task.
            </Text>
            <Text style={styles.modalQuestion}>
              Do you accept the cancellation?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalNoButton}
                onPress={handleRejectCancellation}
              >
                <Text style={styles.modalNoText}>No</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalYesButton}
                onPress={handleAcceptCancellation}
              >
                <Text style={styles.modalYesText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Poster Cancellation Reason Modal */}
      <Modal
        visible={showPosterCancelModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowPosterCancelModal(false);
          setSelectedCancelReason(null);
        }}
      >
        <View style={styles.posterCancelOverlay}>
          <View style={styles.posterCancelContent}>
            <View style={styles.posterCancelHeader}>
              <Text style={styles.posterCancelTitle}>Choose a reason</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowPosterCancelModal(false);
                  setSelectedCancelReason(null);
                }}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.warningContainer}>
              <MaterialIcons name="info-outline" size={20} color="#ff8c00" />
              <Text style={styles.warningText}>
                Cancelling tasks will incur fees.{' '}
                <Text style={styles.warningLink}>
                  Learn more about our Cancellation Policy
                </Text>
                .
              </Text>
            </View>

            <View style={styles.reasonsList}>
              {cancelReasons.map((reason, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.reasonItem,
                    selectedCancelReason === index && styles.reasonItemSelected
                  ]}
                  onPress={() => setSelectedCancelReason(index)}
                >
                  <Text style={styles.reasonNumber}>{index + 1}.</Text>
                  <Text style={styles.reasonText}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.confirmCancelButton,
                selectedCancelReason === null && styles.confirmCancelButtonDisabled
              ]}
              onPress={handleConfirmPosterCancel}
              disabled={selectedCancelReason === null}
            >
              <Text style={styles.confirmCancelButtonText}>
                Confirm Cancellation
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  completedButton: {
    flex: 1,
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancellationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff5f5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  cancellationText: {
    fontSize: 13,
    color: '#dc3545',
    marginLeft: 6,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  modalQuestion: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalNoButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalNoText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  modalYesButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#dc3545',
    alignItems: 'center',
  },
  modalYesText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  actionIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  timePreference: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '500',
  },
  locationType: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  locationDivider: {
    marginHorizontal: 6,
    color: '#ccc',
    fontSize: 12,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  price: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007bff',
    marginBottom: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginTop: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  categoryTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    color: '#1976d2',
    fontWeight: '500',
  },
  moreCategoriesText: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  posterCancelOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  posterCancelContent: {
    backgroundColor: '#f5f5f9',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '96%',
  },
  posterCancelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  posterCancelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff8e1',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff8c00',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    marginLeft: 12,
    lineHeight: 20,
  },
  warningLink: {
    color: '#2563eb',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  reasonsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  reasonItemSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2563eb',
    borderWidth: 2,
  },
  reasonNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
    minWidth: 24,
  },
  reasonText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  confirmCancelButton: {
    backgroundColor: '#dc3545',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmCancelButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  confirmCancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
