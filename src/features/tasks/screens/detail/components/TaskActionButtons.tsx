import TaskAPI from '@/src/api/task-api';
import { ChatWindow } from '@/src/features/messages/components/ChatWindow';
import type { Message } from '@/src/features/messages/components/message-types';
import { formatUserName } from '@/src/utils/formatUserName';
import { useGetAllChats } from '@/src/shared/hooks/useChatApi';
import {
  useCompleteTask,
  useCompleteTaskPayment,
  useConfirmTaskCompletion,
  useCreateCancellationRequest,
  useGetCancellationReasons
} from '@/src/shared/hooks/useTaskApi';
import { useGetUserChats } from '@/src/shared/hooks/useTaskChat';
import { useAuthStore } from '@/src/store/auth-task-store';
import { MaterialIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';

interface TaskActionButtonsProps {
  task: any;
  currentUserId?: string;
  onTaskCompleted?: () => void;
  onCancelTask?: () => void;
}

export const TaskActionButtons: React.FC<TaskActionButtonsProps> = ({
  task,
  currentUserId,
  onTaskCompleted,
  onCancelTask,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState<number | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  
  // Chat modal state
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState<Message | null>(null);
  
  const completeTaskMutation = useCompleteTask();
  const completeTaskPaymentMutation = useCompleteTaskPayment();
  const confirmTaskCompletionMutation = useConfirmTaskCompletion();
  const createCancellationRequestMutation = useCreateCancellationRequest();
  const { data: chatsData } = useGetAllChats();
  const { data: userChatsData } = useGetUserChats();
  const { user: currentUser } = useAuthStore();
  
  // Fetch cancellation reasons for poster
  const { data: cancellationReasonsData, isLoading: loadingReasons } = useGetCancellationReasons('poster');
  const cancellationReasons = cancellationReasonsData?.data || [];

  // Check if current user is the task creator (poster)
  const isTaskCreator = task?.createdBy?._id === currentUserId || task?.createdBy === currentUserId;
  
  // Check if current user is the tasker (assigned to the task)
  const isTasker = (() => {
    const assignedTo = (task as any)?.assignedTo;
    if (typeof assignedTo === 'object' && assignedTo?._id) {
      return assignedTo._id === currentUserId;
    }
    if (typeof assignedTo === 'string') {
      return assignedTo === currentUserId;
    }
    // Check if user has an accepted offer
    if (task?.offers && Array.isArray(task.offers)) {
      const acceptedOffer = task.offers.find((o: any) => o.status === 'accepted');
      if (acceptedOffer) {
        const taskTaker: any = acceptedOffer.taskTaker || acceptedOffer.taskTakerId;
        if (typeof taskTaker === 'object') {
          return taskTaker?._id === currentUserId;
        } else if (typeof taskTaker === 'string') {
          return taskTaker === currentUserId;
        }
      }
    }
    return false;
  })();
  
  // Check if task is in accepted/assigned state (post-payment)
  const isAcceptedTask = ['accepted', 'assigned', 'in_progress', 'todo'].includes(task?.status);
  
  // Show buttons based on user role:
  // - POSTER (task creator): Can see Chat and Cancel buttons only
  // - TASKER (assigned user): Can see Chat, Mark as Completed, and Cancel buttons
  const shouldShowButtons = (isTaskCreator || isTasker) && isAcceptedTask;

  const handleOpenChat = useCallback(() => {
    console.log('💬 Chat button touched for task:', task._id, task.title);
    
    // Get poster info (task creator)
    const createdByObj = typeof task.createdBy === 'object' ? task.createdBy : null;
    const posterId = createdByObj?._id || (typeof task.createdBy === 'string' ? task.createdBy : null);
    const posterName = createdByObj ? formatUserName(createdByObj.firstName, createdByObj.lastName) : '';
    const posterAvatar = createdByObj?.avatar || createdByObj?.profilePicture || '';
    
    // Get tasker info (assigned user or accepted offer user)
    let taskerId = null;
    let taskerName = '';
    let taskerAvatar = '';
    const assignedTo = (task as any).assignedTo;
    
    if (typeof assignedTo === 'object' && assignedTo?._id) {
      taskerId = assignedTo._id;
      taskerName = formatUserName(assignedTo.firstName, assignedTo.lastName);
      taskerAvatar = assignedTo.avatar || assignedTo.profilePicture || '';
    } else if (typeof assignedTo === 'string') {
      taskerId = assignedTo;
    } else if (task.offers && Array.isArray(task.offers)) {
      const acceptedOffer = task.offers.find((o: any) => o.status === 'accepted');
      if (acceptedOffer) {
        const taskTaker: any = acceptedOffer.taskTaker || acceptedOffer.taskTakerId;
        if (typeof taskTaker === 'object') {
          taskerId = taskTaker?._id;
          taskerName = formatUserName(taskTaker?.firstName, taskTaker?.lastName);
          taskerAvatar = taskTaker?.avatar || taskTaker?.profilePicture || '';
        } else {
          taskerId = taskTaker;
        }
      }
    }
    
    console.log('👥 Final participant info:', {
      posterId,
      posterName,
      posterAvatar,
      taskerId,
      taskerName,
      taskerAvatar
    });
    
    // Check if a chat already exists for this task
    const existingChat = userChatsData?.chats?.find((chatItem: any) => {
      const chatTaskId = typeof chatItem.taskId === 'string' 
        ? chatItem.taskId 
        : chatItem.taskId?._id;
      return chatTaskId === task._id;
    });

    const existingChatId = existingChat ? ((existingChat as any).chatId || existingChat._id) : undefined;
    
    // Create message object for ChatWindow modal
    const otherUserName = currentUser?._id === posterId ? taskerName : posterName;
    const otherUserAvatar = currentUser?._id === posterId ? taskerAvatar : posterAvatar;
    
    const messageData: Message = {
      id: existingChatId || `temp-${task._id}`,
      title: otherUserName || 'Chat',
      preview: `Chat about: ${task.title}`,
      date: new Date().toLocaleString(),
      avatar: otherUserAvatar || undefined,
      unreadCount: 0
    };
    
    // Store additional task data for ChatWindow to access
    (messageData as any).chatId = existingChatId || null;
    (messageData as any).taskId = task._id;
    (messageData as any).taskTitle = task.title;
    (messageData as any).posterId = posterId || '';
    (messageData as any).taskerId = taskerId || '';
    (messageData as any).posterName = posterName || 'Poster';
    (messageData as any).taskerName = taskerName || 'Tasker';
    (messageData as any).posterAvatar = posterAvatar || '';
    (messageData as any).taskerAvatar = taskerAvatar || '';
    
    console.log('📱 Opening ChatWindow modal with data:', messageData);
    console.log('   TaskId:', task._id);
    console.log('   ChatId:', existingChatId || 'will create new');
    console.log('   PosterId:', posterId);
    console.log('   TaskerId:', taskerId);
    setChatMessage(messageData);
    setShowChatModal(true);
  }, [task, userChatsData, currentUser]);

  const handleMarkAsCompleted = useCallback(async () => {
    if (completeTaskMutation.isPending || completeTaskPaymentMutation.isPending || isProcessing) {
      console.log('🛡️ Complete operation already in progress');
      return;
    }

    // IMPORTANT: Only TASKERS (assigned users) can mark tasks as complete
    // Posters CANNOT mark tasks as complete
    if (!isTasker) {
      console.error('❌ User is not the tasker - cannot mark task as complete');
      Alert.alert(
        'Permission Denied',
        'Only the assigned tasker can mark this task as complete.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsProcessing(true);
      console.log('✅ Marking task as completed:', task._id);
      console.log('🔍 Task data:', {
        id: task._id,
        status: task.status,
        isTasker,
        currentUserId,
        assignedTo: (task as any).assignedTo,
      });
      
      // Call the complete task API endpoint: PATCH /tasks/{id}/complete
      // Backend will handle marking task as complete
      console.log('✅ Using task completion API (PATCH /tasks/{id}/complete)...');
      await completeTaskMutation.mutateAsync(task._id);
      
      console.log('✅ Task marked as completed successfully');
      
      // ✨ CRITICAL: Invalidate My Tasks cache to refresh the list immediately
      // This ensures the task status updates in real-time for the tasker
      console.log('🔄 Invalidating My Tasks cache after marking complete...');
      await queryClient.invalidateQueries({ queryKey: ['myTasks'] });
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      console.log('✅ My Tasks cache invalidated - task status will update');
      
      if (onTaskCompleted) {
        onTaskCompleted();
      }
      
      setSuccessToast(
        'The poster has been informed the task has been completed and to release payment.'
      );
      setTimeout(() => {
        setSuccessToast(null);
        router.back();
      }, 3000);
      
    } catch (error: any) {
      console.error('❌ Error marking task as completed:', error);
      console.error('❌ Error response:', error?.response?.data);
      
      let errorMessage = 'Failed to mark task as completed. Please try again.';
      let errorTitle = 'Completion Failed';
      
      if (error?.response?.data?.message || error?.response?.data?.error) {
        errorMessage = error.response.data.message || error.response.data.error;
        errorTitle = 'Cannot Complete Task';
      } else if (error?.response?.status === 403) {
        errorMessage = 'You don\'t have permission to complete this task. Only the assigned tasker can mark it as complete.';
        errorTitle = 'Permission Denied';
      } else if (error?.response?.status === 400) {
        errorMessage = 'This task cannot be completed in its current state.';
        errorTitle = 'Invalid Task Status';
      } else if (error?.response?.status === 404) {
        errorMessage = 'This task was not found. It may have been deleted.';
        errorTitle = 'Task Not Found';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsProcessing(false);
    }
  }, [task, isTasker, currentUserId, completeTaskMutation, onTaskCompleted, isProcessing, router]);

  const handleCancelTask = useCallback(() => {
    if (isProcessing || createCancellationRequestMutation.isPending) {
      console.log('🛡️ Cancel operation already in progress');
      return;
    }
    
    console.log('❌ Opening cancellation modal for task:', task._id);
    setShowCancelModal(true);
  }, [task, isProcessing, createCancellationRequestMutation.isPending]);

  const handleConfirmCancellation = useCallback(async () => {
    if (!selectedCancelReason) {
      Alert.alert('Please select a reason', 'You must select a reason for cancellation.');
      return;
    }

    const selectedReasonData = cancellationReasons.find((r: any) => r._id === selectedCancelReason);
    if (!selectedReasonData) {
      Alert.alert('Error', 'Invalid cancellation reason selected.');
      return;
    }

    try {
      setIsProcessing(true);
      console.log('📝 Submitting cancellation request:', {
        taskId: task._id,
        reason: selectedReasonData.reason
      });

      await createCancellationRequestMutation.mutateAsync({
        taskId: task._id,
        reason: selectedReasonData.reason
      });

      setShowCancelModal(false);
      setSelectedCancelReason(null);

      Alert.alert(
        'Cancellation Request Sent',
        'Your cancellation request has been sent to the tasker for approval. The task will remain in the Accepted tab until the tasker responds.',
        [{ text: 'OK' }]
      );

      if (onTaskCompleted) {
        onTaskCompleted();
      }
    } catch (error: any) {
      console.error('❌ Failed to create cancellation request:', error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to send cancellation request. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  }, [task, selectedCancelReason, cancellationReasons, createCancellationRequestMutation, onTaskCompleted]);

  const handleConfirmCompletion = useCallback(async () => {
    if (confirmTaskCompletionMutation.isPending || isProcessing) {
      console.log('🛡️ Confirm completion operation already in progress');
      return;
    }

    // IMPORTANT: Only POSTERS (task creators) can confirm completion
    // Taskers CANNOT confirm completion
    if (!isTaskCreator) {
      console.error('❌ User is not the poster - cannot confirm completion');
      Alert.alert(
        'Permission Denied',
        'Only the task poster can confirm completion.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Task must be in pending_completion status
    if (task?.status !== 'pending_completion') {
      console.error('❌ Task is not in pending_completion status:', task?.status);
      Alert.alert(
        'Invalid Task Status',
        'This task is not ready for completion confirmation.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Release Payment',
      'Are you sure you want to release payment? This confirms the task is complete and pays the tasker.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Release Payment',
          style: 'default',
          onPress: async () => {
            try {
              setIsProcessing(true);
              console.log('✅ Confirming task completion:', task._id);
              console.log('🔍 Task data:', {
                id: task._id,
                status: task.status,
                isTaskCreator,
                currentUserId,
              });

              // Call the confirm completion API endpoint: PATCH /tasks/{id}/confirm-completion
              console.log('✅ Using confirm completion API (PATCH /tasks/{id}/confirm-completion)...');
              const result = await confirmTaskCompletionMutation.mutateAsync(task._id);
              
              console.log('✅ Task completion confirmed successfully:', result);
              
              // ✨ CRITICAL: Invalidate My Tasks cache to refresh the list immediately
              // This ensures the task appears in the Completed tab for the poster
              console.log('🔄 Invalidating My Tasks cache after completion confirmation...');
              await queryClient.invalidateQueries({ queryKey: ['myTasks'] });
              await queryClient.invalidateQueries({ queryKey: ['tasks'] });
              console.log('✅ My Tasks cache invalidated - list will refresh');
              
              if (onTaskCompleted) {
                onTaskCompleted();
              }

              router.replace({
                pathname: '/(tabs)/my-tasks',
                params: {
                  role: 'Poster',
                  tab: 'review_required',
                  promptReviewTaskId: task._id,
                },
              } as any);
              return;
              
            } catch (error: any) {
              console.error('❌ Error confirming task completion:', error);
              console.error('❌ Error response:', error?.response?.data);
              
              let errorMessage = 'Failed to confirm task completion. Please try again.';
              let errorTitle = 'Confirmation Failed';
              
              if (error?.response?.data?.message || error?.response?.data?.error) {
                errorMessage = error.response.data.message || error.response.data.error;
                errorTitle = 'Cannot Confirm Completion';
              } else if (error?.response?.status === 403) {
                errorMessage = 'You don\'t have permission to confirm this task. Only the task poster can confirm completion.';
                errorTitle = 'Permission Denied';
              } else if (error?.response?.status === 400) {
                errorMessage = 'Invalid task ID or task not ready for confirmation.';
                errorTitle = 'Invalid Task Status';
              } else if (error?.response?.status === 404) {
                errorMessage = 'Task not found or not pending completion.';
                errorTitle = 'Task Not Found';
              } else if (error?.message) {
                errorMessage = error.message;
              }
              
              Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }]);
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  }, [task, isTaskCreator, currentUserId, confirmTaskCompletionMutation, onTaskCompleted, isProcessing, router]);

  if (!shouldShowButtons) {
    return null;
  }

  return (
    <View style={styles.container}>
      {successToast ? (
        <View style={styles.successToast} pointerEvents="none">
          <Text style={styles.successToastText}>{successToast}</Text>
        </View>
      ) : null}
      <View style={styles.buttonRow}>
        {/* Chat Button */}
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={handleOpenChat}
          activeOpacity={0.7}
        >
          <MaterialIcons name="chat" size={20} color="#007bff" />
        </TouchableOpacity>

        {/* Release Payment Button - ONLY show for POSTER when task is pending_completion */}
        {isTaskCreator && task?.status === 'pending_completion' && (
          <TouchableOpacity 
            style={[
              styles.confirmCompletionButton,
              (isProcessing || confirmTaskCompletionMutation.isPending) && styles.disabledButton
            ]}
            onPress={handleConfirmCompletion}
            activeOpacity={0.7}
            disabled={isProcessing || confirmTaskCompletionMutation.isPending}
          >
            {(isProcessing || confirmTaskCompletionMutation.isPending) ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.confirmCompletionButtonText}>Releasing...</Text>
              </View>
            ) : (
              <Text style={styles.confirmCompletionButtonText}>Release Payment</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Mark as Completed Button - ONLY show for TASKER, NOT for Poster */}
        {isTasker && task?.status !== 'pending_completion' && (
          <TouchableOpacity 
            style={[
              styles.completedButton,
              (isProcessing || completeTaskMutation.isPending || completeTaskPaymentMutation.isPending) && styles.disabledButton
            ]}
            onPress={handleMarkAsCompleted}
            activeOpacity={0.7}
            disabled={isProcessing || completeTaskMutation.isPending || completeTaskPaymentMutation.isPending}
          >
            {(isProcessing || completeTaskMutation.isPending || completeTaskPaymentMutation.isPending) ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.completedButtonText}>Completing...</Text>
              </View>
            ) : (
              <Text style={styles.completedButtonText}>Mark as Completed</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Cancel Button */}
        <TouchableOpacity 
          style={[styles.cancelButton, (isProcessing || createCancellationRequestMutation.isPending) && styles.disabledButton]}
          onPress={handleCancelTask}
          activeOpacity={0.7}
          disabled={isProcessing || createCancellationRequestMutation.isPending}
        >
          <MaterialIcons name="close" size={20} color={(isProcessing || createCancellationRequestMutation.isPending) ? "#999" : "#fff"} />
        </TouchableOpacity>
      </View>

      {/* Cancellation Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Cancellation</Text>
            <Text style={styles.modalSubtitle}>
              Please select a reason for cancelling this task. The tasker will need to approve your request.
            </Text>

            <ScrollView style={styles.reasonsList} showsVerticalScrollIndicator={false}>
              {loadingReasons ? (
                <ActivityIndicator size="large" color="#0052A2" style={{ marginTop: 20 }} />
              ) : (
                cancellationReasons.map((reason: any) => (
                  <TouchableOpacity
                    key={reason._id}
                    style={[
                      styles.reasonItem,
                      selectedCancelReason === reason._id && styles.reasonItemSelected
                    ]}
                    onPress={() => setSelectedCancelReason(reason._id)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.radioButton,
                      selectedCancelReason === reason._id && styles.radioButtonSelected
                    ]}>
                      {selectedCancelReason === reason._id && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={[
                      styles.reasonText,
                      selectedCancelReason === reason._id && styles.reasonTextSelected
                    ]}>
                      {reason.reason}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowCancelModal(false);
                  setSelectedCancelReason(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonTextCancel}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonConfirm,
                  (!selectedCancelReason || createCancellationRequestMutation.isPending) && styles.modalButtonDisabled
                ]}
                onPress={handleConfirmCancellation}
                disabled={!selectedCancelReason || createCancellationRequestMutation.isPending}
                activeOpacity={0.7}
              >
                {createCancellationRequestMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonTextConfirm}>Submit Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Chat Modal Window */}
      {showChatModal && chatMessage && (
        <ChatWindow
          visible={showChatModal}
          onClose={() => {
            setShowChatModal(false);
            setChatMessage(null);
          }}
          message={chatMessage}
          taskId={(chatMessage as any).taskId}
          posterId={(chatMessage as any).posterId}
          taskerId={(chatMessage as any).taskerId}
          chatIdProp={(chatMessage as any).chatId}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  successToast: {
    marginBottom: 10,
    backgroundColor: 'rgba(33, 33, 33, 0.92)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  successToastText: {
    color: '#fff',
    fontSize: RFValue(13),
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: RFValue(18),
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completedButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFA500',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedButtonText: {
    color: '#fff',
    fontSize: RFValue(15),
    fontWeight: '600',
  },
  confirmCompletionButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#28a745',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmCompletionButtonText: {
    color: '#fff',
    fontSize: RFValue(15),
    fontWeight: '600',
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
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
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: RFValue(20),
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: RFValue(14),
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  reasonsList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  reasonItemSelected: {
    borderColor: '#0052A2',
    backgroundColor: '#E6F2FF',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#0052A2',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0052A2',
  },
  reasonText: {
    flex: 1,
    fontSize: RFValue(14),
    color: '#333',
  },
  reasonTextSelected: {
    color: '#0052A2',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonConfirm: {
    backgroundColor: '#dc3545',
  },
  modalButtonDisabled: {
    backgroundColor: '#ccc',
  },
  modalButtonTextCancel: {
    color: '#333',
    fontSize: RFValue(15),
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    color: '#fff',
    fontSize: RFValue(15),
    fontWeight: '600',
  },
});
