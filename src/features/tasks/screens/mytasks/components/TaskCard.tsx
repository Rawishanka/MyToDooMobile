import { Task } from '@/src/api/types/tasks';
import StripePaymentModal from '@/src/shared/components/StripePaymentModal';
import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { useAcceptOffer, useCancelTask, useCompleteTask, useDeleteTask } from '@/src/shared/hooks/useTaskApi';
import { formatCurrency, getCurrencyFromLocation, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TaskCardProps {
  task: Task;
  onPress?: (taskId: string) => void;
  status?: string;
  userRole?: string;
  onTaskCancelled?: (taskId: string) => void;
  onTaskDeleted?: (taskId: string) => void;
  onTaskCompleted?: (taskId: string) => void;
}

export default function TaskCard({ task, onPress, status, userRole, onTaskCancelled, onTaskDeleted, onTaskCompleted }: TaskCardProps) {
  const router = useRouter();
  
  // Use current user's location for currency auto-detection
  const { countryInfo } = useLocationCountry();
  
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showPosterCancelModal, setShowPosterCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [selectedCancelReason, setSelectedCancelReason] = useState<number | null>(null);
  
  // Debug logging for offer data
  console.log(`💳 TaskCard [${task._id}] offer data:`, {
    title: task.title,
    offersArray: task.offers?.length || 0,
    offerCount: task.offerCount || 0,
    hasOffers: !!(task.offers?.length || task.offerCount),
    userRole
  });
  
  // Debouncing state to prevent multiple rapid clicks
  const lastClickTime = useRef<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // API hooks
  const deleteTaskMutation = useDeleteTask();
  const cancelTaskMutation = useCancelTask();
  const acceptOfferMutation = useAcceptOffer();
  const completeTaskMutation = useCompleteTask();

  // Debouncing helper function to prevent multiple rapid clicks
  const withDebounce = useCallback((callback: () => void, delay: number = 300) => {
    const now = Date.now();
    if (now - lastClickTime.current < delay) {
      console.log('🛡️ Button click debounced - preventing rapid taps');
      return;
    }
    lastClickTime.current = now;
    callback();
  }, []);

  // Helper function to validate MongoDB ObjectId format (24-character hexadecimal)
  const isValidMongoId = useCallback((id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }, []);

  const handleMarkAsCompleted = useCallback(async () => {
    if (completeTaskMutation.isPending || isProcessing) {
      console.log('🛡️ Complete operation already in progress');
      return;
    }

    // Validate task ID format before making API call
    if (!isValidMongoId(task._id)) {
      Alert.alert(
        'Invalid Task',
        'This is a demo/placeholder task and cannot be completed. Please use real tasks from the backend.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsProcessing(true);
      console.log('✅ Marking task as completed:', task._id);
      
      // Call the API to mark task as completed
      await completeTaskMutation.mutateAsync(task._id);
      
      console.log('✅ Task marked as completed successfully');
      
      // Notify parent component to refresh and move to Completed tab
      if (onTaskCompleted) {
        onTaskCompleted(task._id);
      }
      
      // Show success message
      Alert.alert(
        'Task Completed',
        'The task has been marked as completed and moved to the Completed tab.',
        [{ text: 'OK' }]
      );
      
    } catch (error: any) {
      console.error('❌ Error marking task as completed:', error);
      console.error('❌ Error response:', error?.response?.data);
      console.error('❌ Error message:', error?.message);
      
      let errorMessage = 'Failed to mark task as completed. Please try again.';
      let errorTitle = 'Completion Failed';
      
      // Check for backend error message first (most specific)
      if (error?.response?.data?.message || error?.response?.data?.error) {
        errorMessage = error.response.data.message || error.response.data.error;
        errorTitle = 'Cannot Complete Task';
      } else if (error?.message?.includes('Authentication') || error?.isAuthError || error?.response?.status === 401) {
        errorMessage = 'Your session has expired. Please login again to complete this task.';
        errorTitle = 'Authentication Required';
      } else if (error?.response?.status === 400) {
        errorMessage = 'This task cannot be completed in its current state. Please ensure the task has been accepted first.';
        errorTitle = 'Invalid Task Status';
      } else if (error?.message?.includes('Network') || error?.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
        errorTitle = 'Connection Error';
      } else if (error?.response?.status === 404) {
        errorMessage = 'This task was not found. It may have been deleted.';
        errorTitle = 'Task Not Found';
      } else if (error?.response?.status === 403) {
        errorMessage = 'You don\'t have permission to complete this task.';
        errorTitle = 'Permission Denied';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsProcessing(false);
    }
  }, [task._id, completeTaskMutation, onTaskCompleted, isProcessing, isValidMongoId]);

  const handleCancelTask = useCallback(() => {
    console.log('🔥 Cancel button touched!'); // Debug log
    if (isProcessing) {
      console.log('🛡️ Cancel operation already in progress');
      return;
    }
    
    // Validate task ID format before making API call
    if (!isValidMongoId(task._id)) {
      Alert.alert(
        'Invalid Task',
        'This is a demo/placeholder task and cannot be cancelled. Please use real tasks from the backend.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    console.log('❌ Handling cancel task:', task._id);
    
    // Check if this is a Poster cancelling their own posted task
    if (userRole === 'Poster' && (status === 'open' || status === 'posted' || !status)) {
      setShowPosterCancelModal(true);
    } else {
      // For Tasker role or other cases
      console.log('❌ Cancel task:', task._id);
      // TODO: API call to cancel task
      if (onTaskCancelled) {
        onTaskCancelled(task._id);
      }
    }
  }, [userRole, status, task._id, onTaskCancelled, isProcessing, isValidMongoId]);

  const handleDeleteTask = useCallback(() => {
    console.log('🔥 Delete button touched!'); // Debug log
    if (deleteTaskMutation.isPending || isProcessing) {
      console.log('🛡️ Delete operation already in progress');
      return;
    }

    // Validate task ID format before making API call
    if (!isValidMongoId(task._id)) {
      Alert.alert(
        'Demo Task',
        'This is a demo/placeholder task and cannot be deleted. Please use real tasks from your backend.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('🗑️ Opening delete confirmation modal');
    setShowDeleteModal(true);
  }, [deleteTaskMutation.isPending, isProcessing, isValidMongoId, task._id]);

  const confirmDeleteTask = useCallback(async () => {
    try {
      if (deleteTaskMutation.isPending || isProcessing) {
        console.log('🛡️ Delete operation already in progress');
        return;
      }

      // Validate task ID format before making API call
      if (!isValidMongoId(task._id)) {
        Alert.alert(
          'Demo Task',
          'This is a demo/placeholder task and cannot be deleted. Please use real tasks from your backend.',
          [{ text: 'OK' }]
        );
        setShowDeleteModal(false);
        return;
      }

      setIsProcessing(true);
      console.log('🗑️ Attempting to delete task:', task._id);
      console.log('🔍 Task details:', { 
        id: task._id, 
        title: task.title, 
        status: task.status 
      });
      
      // Check mutation state before calling
      console.log('🔍 Delete mutation state:', { 
        isPending: deleteTaskMutation.isPending,
        isError: deleteTaskMutation.isError,
        error: deleteTaskMutation.error
      });
      
      // Use the React Query mutation to delete the task
      const result = await deleteTaskMutation.mutateAsync(task._id);
      
      console.log('✅ Delete API response:', result);
      console.log('✅ Task deleted successfully');
      setShowDeleteModal(false);
      
      // Notify parent component to refresh the task list
      if (onTaskDeleted) {
        console.log('🔄 Notifying parent component to refresh task list');
        onTaskDeleted(task._id);
      }
      
      // Show success message
      Alert.alert(
        "Task Deleted",
        result?.message || "Your task has been deleted successfully.",
        [{ text: "OK" }]
      );
      
    } catch (error: any) {
      console.error('❌ Error deleting task:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
        isAuthError: error?.isAuthError
      });
      
      setShowDeleteModal(false);
      
      // Show detailed error message to user
      let errorMessage = "Failed to delete task. Please try again.";
      let errorTitle = "Delete Failed";
      
      if (error?.message?.includes("Authentication") || error?.isAuthError || error?.response?.status === 401) {
        errorMessage = "Your session has expired. Please login again to delete this task.";
        errorTitle = "Authentication Required";
      } else if (error?.message?.includes("Network") || error?.code === 'NETWORK_ERROR') {
        errorMessage = "Network error. Please check your internet connection and try again.";
        errorTitle = "Connection Error";
      } else if (error?.response?.status === 404) {
        errorMessage = "This task was not found. It may have already been deleted.";
        errorTitle = "Task Not Found";
      } else if (error?.response?.status === 403) {
        errorMessage = "You don't have permission to delete this task.";
        errorTitle = "Permission Denied";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert(
        errorTitle,
        errorMessage,
        [{ text: "OK" }]
      );
    } finally {
      setIsProcessing(false);
    }
  }, [task._id, task.status, task.title, deleteTaskMutation, onTaskDeleted, isProcessing, isValidMongoId]);

  const handleConfirmPosterCancel = async () => {
    if (selectedCancelReason === null) {
      Alert.alert('Reason Required', 'Please select a reason for cancelling this task.');
      return;
    }
    
    if (cancelTaskMutation.isPending || isProcessing) {
      console.log('🛡️ Cancel operation already in progress');
      return;
    }
    
    try {
      setIsProcessing(true);
      const reasonText = cancelReasons[selectedCancelReason];
      console.log('❌ Poster cancelling task:', task._id);
      console.log('   Reason:', reasonText);
      console.log('   Reason Index:', selectedCancelReason);
      
      // Call the API to cancel the task
      await cancelTaskMutation.mutateAsync(task._id);
      
      console.log('✅ Task cancelled successfully via API');
      
      // Close modal and reset state
      setShowPosterCancelModal(false);
      setSelectedCancelReason(null);
      
      // Notify parent component to refresh task list
      if (onTaskCancelled) {
        onTaskCancelled(task._id);
      }
      
      // Show success message
      Alert.alert(
        'Task Cancelled',
        'Your task has been cancelled successfully and moved to the Cancelled tab.',
        [{ text: 'OK' }]
      );
      
      console.log('✅ Task moved to Cancelled tab');
    } catch (error: any) {
      console.error('❌ Error cancelling task:', error);
      
      // Close modal on error
      setShowPosterCancelModal(false);
      setSelectedCancelReason(null);
      
      // Show error message to user
      let errorMessage = 'Failed to cancel task. Please try again.';
      let errorTitle = 'Cancellation Failed';
      
      if (error?.message?.includes('Authentication') || error?.isAuthError || error?.response?.status === 401) {
        errorMessage = 'Your session has expired. Please login again to cancel this task.';
        errorTitle = 'Authentication Required';
      } else if (error?.message?.includes('Network') || error?.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
        errorTitle = 'Connection Error';
      } else if (error?.response?.status === 404) {
        errorMessage = 'This task was not found. It may have already been cancelled or deleted.';
        errorTitle = 'Task Not Found';
      } else if (error?.response?.status === 403) {
        errorMessage = 'You don\'t have permission to cancel this task.';
        errorTitle = 'Permission Denied';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsProcessing(false);
    }
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

  // Accept Offer functionality - now integrates with Stripe payment
  const handleAcceptOffer = async (offerId: string, taskerId: string) => {
    try {
      setIsProcessing(true);
      console.log('✅ Preparing to accept offer with payment:', { 
        taskId: task._id, 
        offerId, 
        taskerId,
        offerExists: !!offerId,
        taskerExists: !!taskerId 
      });
      
      if (!offerId || !taskerId) {
        throw new Error('Missing offer ID or tasker ID');
      }
      
      // Find the offer details
      const offer = task.offers?.find(o => o._id === offerId);
      if (!offer) {
        throw new Error('Offer not found');
      }
      
      // Set selected offer and show payment modal
      setSelectedOffer({
        ...offer,
        taskId: task._id,
        taskCategory: task.categories?.[0] || 'General'
      });
      setShowPaymentModal(true);
      
      console.log('💳 Opening payment modal for offer:', {
        offerId,
        amount: offer.amount || offer.offer?.amount,
        currency: offer.currency || offer.offer?.currency
      });
      
    } catch (error) {
      console.error('❌ Error preparing offer acceptance:', error);
      Alert.alert('Error', 'Failed to prepare payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle payment modal close
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedOffer(null);
  };

  const handleViewOffers = () => {
    console.log('📋 Viewing offers for task:', task._id);
    setShowOffersModal(true);
  };

  // Helper function to get time preference display
  const getTimePreference = () => {
    if (task.dateType === 'before' || task.dateType === 'DoneBy') return '🕐 Before specific date';
    if (task.dateType === 'no-rush' || task.dateType === 'Easy' || task.dateType === 'Flexible') return '⏰ No rush';
    if (task.dateType === 'on_time' || task.dateType === 'Specific') return '📅 Specific date';
    if (task.time && task.time !== 'Anytime') return `🕒 ${task.time}`;
    return '⏰ Flexible timing';
  };

  // Helper function to format task date
  const getTaskDate = () => {
    // Priority: dateRange.start > dateRange.end > createdAt
    if (task.dateRange?.start) {
      return new Date(task.dateRange.start).toLocaleDateString();
    }
    if (task.dateRange?.end) {
      return new Date(task.dateRange.end).toLocaleDateString();
    }
    return new Date(task.createdAt).toLocaleDateString();
  };

  // Helper function to get location type
  const getLocationType = () => {
    const address = task.location?.address || '';
    if (address.includes(' → ') || address.includes(' to ')) {
      return '🚚 Moving/Delivery';
    }
    return '📍'; // Just show location pin, location address will be shown separately
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

  // Get currency info and format budget with thousand separators
  // Use user's current location for currency display (auto geo-location feature)
  const userCurrencyInfo = getCurrencyFromUserLocation(countryInfo);
  const taskLocationCurrencyInfo = getCurrencyFromLocation(task.location);
  
  // Prioritize user's current location currency for auto geo-location
  const formattedBudgetDisplay = task.formattedBudget || 
    (task.budget ? formatCurrency(task.budget, userCurrencyInfo) : 
    `${userCurrencyInfo.symbol}0.00`);
    
  console.log('💰 TaskCard currency info:', {
    taskId: task._id.substring(0, 8),
    userCountry: countryInfo.countryName,
    userCurrency: userCurrencyInfo.code,
    userSymbol: userCurrencyInfo.symbol,
    taskLocation: task.location?.address,
    taskCurrency: taskLocationCurrencyInfo.code,
    originalBudget: task.budget,
    formattedBudget: formattedBudgetDisplay
  });

  return (
    <View style={styles.card} pointerEvents="auto">
      {/* Clickable Card Content - Navigates to Details */}
      <TouchableOpacity
        style={styles.cardContent}
        activeOpacity={0.7}
        onPress={() => {
          console.log('📋 Card pressed, navigating to task detail:', task._id);
          router.push(`/task-detail?taskId=${task._id}`);
        }}
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
                {getTaskDate()}
              </Text>
            </View>

            {/* Category */}
            {task.categories && Array.isArray(task.categories) && task.categories.length > 0 && (
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryLabel}>
                  Category - {task.categories[0]}
                </Text>
                {task.categories.length > 1 && (
                  <Text style={styles.moreCategoriesText}>
                    +{task.categories.length - 1} more
                  </Text>
                )}
              </View>
            )}

            {/* Offer Count Display - Same as Browse screen */}
            <Text style={styles.offerCountText}>
              {task.status === 'accepted' || task.status === 'completed' || 
               task.status === 'assigned' || task.status === 'in_progress' || task.status === 'in-progress'
                ? task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ').replace('-', ' ')
                : (task.offerCount || 0) > 0
                  ? `${task.offerCount} Offer${task.offerCount !== 1 ? 's' : ''}`
                  : 'Make the first offer'}
            </Text>
          </View>

          {/* Price and User Info */}
          <View style={styles.price}>
            <Text style={styles.priceText}>
              {formattedBudgetDisplay}
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
      </TouchableOpacity>

      {/* Offers Section - Show offer count for all roles when offers exist */}
      {(() => {
        const offerCount = task.offers?.length || task.offerCount || 0;
        return offerCount > 0;
      })() && (
        <View style={styles.offersSection}>
          {userRole === 'Poster' ? (
            <TouchableOpacity 
              style={styles.offersButton}
              onPress={handleViewOffers}
            >
              <View style={styles.offersInfo}>
                <MaterialIcons name="local-offer" size={20} color="#007bff" />
                <Text style={styles.offersLabel}>
                  Offers: {task.offers?.length || task.offerCount || 0}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#007bff" />
            </TouchableOpacity>
          ) : (
            /* For Taskers - just display offer count without interaction */
            <View style={styles.offersButton}>
              <View style={styles.offersInfo}>
                <MaterialIcons name="local-offer" size={20} color="#007bff" />
                <Text style={styles.offersLabel}>
                  Offers: {task.offers?.length || task.offerCount || 0}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons - Separate from Card Content */}
      <View style={styles.actionButtons} pointerEvents="box-none">
        {status === 'accepted' ? (
          // Accepted Offers tab: Mark as Completed + Cancel
          <>
            <TouchableOpacity 
              style={[
                styles.completedButton,
                (isProcessing || completeTaskMutation.isPending) && styles.disabledButton
              ]}
              onPress={() => {
                console.log('🔥 Mark as Completed button touched!');
                if (!isProcessing && !completeTaskMutation.isPending) {
                  handleMarkAsCompleted();
                }
              }}
              activeOpacity={0.7}
              delayPressIn={0}
              disabled={isProcessing || completeTaskMutation.isPending}
            >
              {(isProcessing || completeTaskMutation.isPending) ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.completedButtonText}>
                    Completing...
                  </Text>
                </View>
              ) : (
                <Text style={styles.completedButtonText}>
                  Mark as Completed
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.cancelButton,
                isProcessing && styles.disabledButton
              ]}
              onPress={() => {
                console.log('🔥 Cancel button (Accepted) touched!');
                if (!isProcessing) {
                  handleCancelTask();
                }
              }}
              activeOpacity={0.7}
              delayPressIn={0}
              disabled={isProcessing}
            >
              <MaterialIcons 
                name="close" 
                size={20} 
                color={isProcessing ? "#999" : "#fff"} 
              />
            </TouchableOpacity>
          </>
        ) : (
          // Posted tab: Edit + Delete + Cancel
          <>
            {/* Edit Button */}
            <TouchableOpacity 
              style={[
                styles.actionButton,
                (isProcessing || deleteTaskMutation.isPending) && styles.disabledButton
              ]} 
              activeOpacity={0.6}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              disabled={isProcessing || deleteTaskMutation.isPending}
              onPress={() => {
                console.log('🔥 Edit button touched!'); // Debug log
                if (!isProcessing && !deleteTaskMutation.isPending) {
                  withDebounce(() => {
                    console.log('✏️ Edit button pressed for task:', task._id);
                    console.log('   Task data:', task);
                    // Always navigate to edit screen for edit button
                    router.push({
                      pathname: '/edit-task',
                      params: {
                        taskId: task._id,
                        task: JSON.stringify(task)
                      }
                    } as any);
                  });
                }
              }}
            >
              <MaterialIcons 
                name="edit" 
                size={20} 
                color={(isProcessing || deleteTaskMutation.isPending) ? "#999" : "#007bff"} 
              />
            </TouchableOpacity>
            
            {/* Delete Button */}
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.deleteButton, 
                (deleteTaskMutation.isPending || isProcessing) && styles.disabledButton
              ]} 
              activeOpacity={0.6}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              onPress={handleDeleteTask}
              disabled={deleteTaskMutation.isPending || isProcessing}
            >
              <MaterialIcons 
                name="delete" 
                size={20} 
                color={(deleteTaskMutation.isPending || isProcessing) ? "#999" : "#dc3545"} 
              />
            </TouchableOpacity>
            
            {/* Cancel Button */}
            <TouchableOpacity 
              style={[
                styles.actionButton,
                isProcessing && styles.disabledButton
              ]} 
              activeOpacity={0.6}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              onPress={handleCancelTask}
              disabled={isProcessing}
            >
              <MaterialIcons 
                name="cancel" 
                size={20} 
                color={isProcessing ? "#999" : "#dc3545"} 
              />
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

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteIconContainer}>
              <MaterialIcons name="delete-forever" size={48} color="#dc3545" />
            </View>
            
            <Text style={styles.deleteModalTitle}>Delete Task?</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete this task? This action cannot be undone.
            </Text>
            
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteCancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.deleteCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.deleteConfirmButton,
                  deleteTaskMutation.isPending && styles.deleteConfirmButtonDisabled
                ]}
                onPress={confirmDeleteTask}
                disabled={deleteTaskMutation.isPending}
              >
                <Text style={styles.deleteConfirmButtonText}>
                  {deleteTaskMutation.isPending ? "Deleting..." : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Offers Modal */}
      <Modal
        visible={showOffersModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOffersModal(false)}
      >
        <View style={styles.offersModalOverlay}>
          <View style={styles.offersModalContent}>
            <View style={styles.offersModalHeader}>
              <Text style={styles.offersModalTitle}>
                Offers for &quot;{task.title}&quot;
              </Text>
              <TouchableOpacity 
                style={styles.offersCloseButton}
                onPress={() => setShowOffersModal(false)}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={task.offers || []}
              keyExtractor={(offer) => offer._id}
              renderItem={({ item: offer }) => {
                // Debug logging for offer structure
                console.log('🔍 [TaskCard] Offer data structure:', {
                  offerId: offer._id,
                  taskId: task._id,
                  taskTitle: task.title,
                  taskTakerId: offer.taskTakerId, // This might be undefined
                  taskTaker: offer.taskTaker, // This is the actual user data
                  offerAmount: offer.amount, // Direct property, not nested
                  offerCurrency: offer.currency, // Direct property
                  offerMessage: offer.message, // Direct property
                  fullOffer: offer
                });
                
                return (
                <View style={styles.offerItem}>
                  <View style={styles.offerHeader}>
                    <View style={styles.offerUserInfo}>
                      <Image
                        source={{
                          uri: `https://ui-avatars.com/api/?name=${offer.taskTaker?.firstName || offer.taskTakerId?.firstName || 'User'}+${offer.taskTaker?.lastName || offer.taskTakerId?.lastName || ''}&background=random`,
                        }}
                        style={styles.offerAvatar}
                      />
                      <View style={styles.offerUserDetails}>
                        <Text style={styles.offerUserName}>
                          {offer.taskTaker?.firstName || offer.taskTakerId?.firstName || 'Unknown'} {offer.taskTaker?.lastName || offer.taskTakerId?.lastName || 'User'}
                        </Text>
                        <View style={styles.offerRating}>
                          <MaterialIcons name="star" size={16} color="#ffd700" />
                          <Text style={styles.offerRatingText}>
                            {offer.taskTaker?.rating?.toFixed(1) || offer.taskTakerId?.rating?.toFixed(1) || '0.0'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.offerAmount}>
                      <Text style={styles.offerPrice}>
                        {formatCurrency(offer.amount || offer.offer?.amount || 0, userCurrencyInfo)}
                      </Text>
                    </View>
                  </View>

                  {(offer.message || offer.offer?.message) && (
                    <Text style={styles.offerMessage}>
                      {offer.message || offer.offer?.message}
                    </Text>
                  )}

                  <View style={styles.offerFooter}>
                    <Text style={styles.offerDate}>
                      {new Date(offer.createdAt).toLocaleDateString()}
                    </Text>
                    {userRole === 'Poster' && offer.status === 'pending' && (offer.taskTaker?._id || offer.taskTakerId?._id) && (
                      <TouchableOpacity
                        style={[
                          styles.acceptOfferButton,
                          (acceptOfferMutation.isPending || isProcessing) && styles.acceptOfferDisabledButton
                        ]}
                        onPress={() => handleAcceptOffer(offer._id, offer.taskTaker?._id || offer.taskTakerId?._id!)}
                        disabled={acceptOfferMutation.isPending || isProcessing}
                      >
                        {acceptOfferMutation.isPending || isProcessing ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.acceptOfferText}>Accept Offer</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                );
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.offersListContent}
            />
          </View>
        </View>
      </Modal>
      
      {/* Stripe Payment Modal */}
      <StripePaymentModal
        visible={showPaymentModal}
        taskId={task._id}
        offerId={selectedOffer?._id}
        offerAmount={selectedOffer?.amount || selectedOffer?.offer?.amount || 0}
        currency={selectedOffer?.currency || selectedOffer?.offer?.currency || 'USD'}
        taskTitle={task.title}
        taskCategory={selectedOffer?.taskCategory}
        onClose={handleClosePaymentModal}
        onSuccess={handleClosePaymentModal}
      />
    </View>
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
  cardContent: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
    zIndex: 10,
    elevation: 10,
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
    elevation: 5,
    zIndex: 20,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#f5f5f5',
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
  offerCountText: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '600',
    marginTop: 4,
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
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  categoryLabel: {
    fontSize: 13,
    color: '#4a5568',
    fontWeight: '600',
    lineHeight: 18,
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
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
    fontStyle: 'italic',
    marginLeft: 4,
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
  deleteButton: {
    // Additional styles for delete button if needed
  },
  deleteModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  deleteIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  deleteCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  deleteCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deleteConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#dc3545',
    alignItems: 'center',
  },
  deleteConfirmButtonDisabled: {
    backgroundColor: '#aaa',
    opacity: 0.7,
  },
  deleteConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Offers section styles
  offersSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 12,
  },
  offersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  offersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  offersCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  // Offers modal styles
  offersModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  offersModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  offersModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  offersModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 16,
  },
  offersCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  offersListContent: {
    padding: 20,
  },
  offerItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  offerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  offerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  offerUserDetails: {
    flex: 1,
  },
  offerUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  offerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerRatingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  offerAmount: {
    alignItems: 'flex-end',
  },
  offerPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  offerMessage: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 20,
  },
  offerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offerDate: {
    fontSize: 12,
    color: '#999',
  },
  acceptOfferButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  acceptOfferDisabledButton: {
    backgroundColor: '#ccc',
  },
  acceptOfferText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
