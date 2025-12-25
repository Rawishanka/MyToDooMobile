import { ChatWindow } from '@/src/features/messages/components/ChatWindow';
import type { Message } from '@/src/features/messages/components/message-types';
import { useGetAllChats } from '@/src/shared/hooks/useChatApi';
import {
  useCompleteTask,
  useCompleteTaskPayment,
  useCreateCancellationRequest,
  useGetCancellationReasons
} from '@/src/shared/hooks/useTaskApi';
import { useGetUserChats } from '@/src/shared/hooks/useTaskChat';
import { useAuthStore } from '@/src/store/auth-task-store';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState<number | null>(null);
  
  // Chat modal state
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState<Message | null>(null);
  
  const completeTaskMutation = useCompleteTask();
  const completeTaskPaymentMutation = useCompleteTaskPayment();
  const createCancellationRequestMutation = useCreateCancellationRequest();
  const { data: chatsData } = useGetAllChats();
  const { data: userChatsData } = useGetUserChats();
  const { user: currentUser } = useAuthStore();
  
  // Fetch cancellation reasons for poster
  const { data: cancellationReasonsData, isLoading: loadingReasons } = useGetCancellationReasons('poster');
  const cancellationReasons = cancellationReasonsData?.data || [];

  // Check if current user is the task creator (poster)
  const isTaskCreator = task?.createdBy?._id === currentUserId || task?.createdBy === currentUserId;
  
  // Check if task is in accepted/assigned state (post-payment)
  const isAcceptedTask = ['accepted', 'assigned', 'in_progress', 'todo'].includes(task?.status);
  
  // Only show buttons if user is poster and task is accepted
  const shouldShowButtons = isTaskCreator && isAcceptedTask;

  const handleOpenChat = useCallback(() => {
    console.log('💬 Chat button touched for task:', task._id, task.title);
    
    // Get poster info (task creator)
    const createdByObj = typeof task.createdBy === 'object' ? task.createdBy : null;
    const posterId = createdByObj?._id || (typeof task.createdBy === 'string' ? task.createdBy : null);
    const posterName = createdByObj ? `${createdByObj.firstName || ''} ${createdByObj.lastName || ''}`.trim() : '';
    const posterAvatar = createdByObj?.avatar || createdByObj?.profilePicture || '';
    
    // Get tasker info (assigned user or accepted offer user)
    let taskerId = null;
    let taskerName = '';
    let taskerAvatar = '';
    const assignedTo = (task as any).assignedTo;
    
    if (typeof assignedTo === 'object' && assignedTo?._id) {
      taskerId = assignedTo._id;
      taskerName = `${assignedTo.firstName || ''} ${assignedTo.lastName || ''}`.trim();
      taskerAvatar = assignedTo.avatar || assignedTo.profilePicture || '';
    } else if (typeof assignedTo === 'string') {
      taskerId = assignedTo;
    } else if (task.offers && Array.isArray(task.offers)) {
      const acceptedOffer = task.offers.find((o: any) => o.status === 'accepted');
      if (acceptedOffer) {
        const taskTaker: any = acceptedOffer.taskTaker || acceptedOffer.taskTakerId;
        if (typeof taskTaker === 'object') {
          taskerId = taskTaker?._id;
          taskerName = `${taskTaker?.firstName || ''} ${taskTaker?.lastName || ''}`.trim();
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

    try {
      setIsProcessing(true);
      console.log('✅ Marking task as completed:', task._id);
      
      // Check if this is an accepted offer that requires payment completion
      const isAcceptedOfferTask = isAcceptedTask && isTaskCreator;
      
      if (isAcceptedOfferTask) {
        console.log('💳 Attempting payment completion for accepted offer...');
        
        let paymentIntentId = (task as any).paymentIntentId;
        let acceptedOfferId = null;
        
        if (task.offers && Array.isArray(task.offers)) {
          const acceptedOffer = task.offers.find((offer: any) => offer.status === 'accepted');
          if (acceptedOffer) {
            acceptedOfferId = acceptedOffer._id;
          }
        }
        
        if (!acceptedOfferId && (task as any).acceptedOffer) {
          const acceptedOffer = (task as any).acceptedOffer;
          acceptedOfferId = acceptedOffer._id || acceptedOffer;
        }
        
        if (paymentIntentId && acceptedOfferId) {
          try {
            await completeTaskPaymentMutation.mutateAsync({ 
              taskId: task._id,
              completionData: {
                paymentIntentId: paymentIntentId,
                taskId: task._id,
                offerId: acceptedOfferId,
              }
            });
            console.log('✅ Task payment completed successfully');
          } catch {
            console.log('⚠️ Payment completion failed, falling back to regular task completion');
            await completeTaskMutation.mutateAsync(task._id);
          }
        } else {
          try {
            await completeTaskPaymentMutation.mutateAsync({ 
              taskId: task._id,
              completionData: {
                taskId: task._id,
                offerId: acceptedOfferId,
              }
            });
          } catch {
            await completeTaskMutation.mutateAsync(task._id);
          }
        }
      } else {
        await completeTaskMutation.mutateAsync(task._id);
      }
      
      console.log('✅ Task marked as completed successfully');
      
      if (onTaskCompleted) {
        onTaskCompleted();
      }
      
      Alert.alert(
        'Task Completed',
        isAcceptedOfferTask ? 
          'Payment has been released and the task has been marked as completed. Would you like to rate and review the tasker now?' : 
          'The task has been marked as completed.',
        [
          { 
            text: 'Later', 
            style: 'cancel',
            onPress: () => router.back()
          },
          {
            text: 'Rate Now',
            onPress: () => {
              router.push({
                pathname: '/task-review',
                params: { taskId: task._id }
              } as any);
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Failed to complete task:', error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to complete the task. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  }, [task, completeTaskMutation, completeTaskPaymentMutation, isProcessing, isTaskCreator, isAcceptedTask, onTaskCompleted, router]);

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

  if (!shouldShowButtons) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        {/* Chat Button */}
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={handleOpenChat}
          activeOpacity={0.7}
        >
          <MaterialIcons name="chat" size={20} color="#007bff" />
        </TouchableOpacity>

        {/* Mark as Completed Button */}
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
    fontSize: 15,
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
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
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
    fontSize: 14,
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
    fontSize: 15,
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
