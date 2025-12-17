import { useGetAllChats } from '@/src/shared/hooks/useChatApi';
import { useCompleteTask, useCompleteTaskPayment } from '@/src/shared/hooks/useTaskApi';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  
  const completeTaskMutation = useCompleteTask();
  const completeTaskPaymentMutation = useCompleteTaskPayment();
  const { data: chatsData } = useGetAllChats();

  // Check if current user is the task creator (poster)
  const isTaskCreator = task?.createdBy?._id === currentUserId || task?.createdBy === currentUserId;
  
  // Check if task is in accepted/assigned state (post-payment)
  const isAcceptedTask = ['accepted', 'assigned', 'in_progress', 'todo'].includes(task?.status);
  
  // Only show buttons if user is poster and task is accepted
  const shouldShowButtons = isTaskCreator && isAcceptedTask;

  const handleOpenChat = useCallback(() => {
    console.log('💬 Chat button touched for task:', task._id);
    
    // First, check if a chat already exists for this task
    const existingChat = chatsData?.data?.find((chatItem: any) => {
      const chatTaskId = typeof chatItem.chat?.taskId === 'string' 
        ? chatItem.chat.taskId 
        : chatItem.chat?.taskId?._id;
      return chatTaskId === task._id;
    });

    if (existingChat) {
      console.log('✅ Found existing chat:', existingChat.chat._id);
      router.push({
        pathname: '/task-chat',
        params: {
          taskId: task._id,
          taskTitle: task.title,
          chatId: existingChat.chat._id
        }
      } as any);
      return;
    }

    console.log('📝 No existing chat found, will create new chat');
    
    // Get poster ID (task creator)
    const posterId = typeof task.createdBy === 'object' && task.createdBy?._id 
      ? task.createdBy._id 
      : (typeof task.createdBy === 'string' ? task.createdBy : null);
    
    // Get tasker ID (assigned user or accepted offer user)
    let taskerId = null;
    const assignedTo = (task as any).assignedTo;
    if (typeof assignedTo === 'object' && assignedTo?._id) {
      taskerId = assignedTo._id;
    } else if (typeof assignedTo === 'string') {
      taskerId = assignedTo;
    } else if (task.offers && Array.isArray(task.offers)) {
      const acceptedOffer = task.offers.find((o: any) => o.status === 'accepted');
      if (acceptedOffer) {
        const taskTaker = acceptedOffer.taskTaker || acceptedOffer.taskTakerId;
        taskerId = typeof taskTaker === 'object' ? taskTaker?._id : taskTaker;
      }
    }
    
    console.log('💬 Creating new chat with participants:', { posterId, taskerId });
    
    router.push({
      pathname: '/task-chat',
      params: {
        taskId: task._id,
        taskTitle: task.title,
        posterId: posterId || '',
        taskerId: taskerId || ''
      }
    } as any);
  }, [task, chatsData, router]);

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
    if (isProcessing) {
      console.log('🛡️ Cancel operation already in progress');
      return;
    }
    
    console.log('❌ Handling cancel task:', task._id);
    
    if (onCancelTask) {
      onCancelTask();
    } else {
      Alert.alert(
        'Cancel Task',
        'Are you sure you want to cancel this task? This action will require approval from the tasker.',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes',
            style: 'destructive',
            onPress: () => {
              // Navigate to cancel request screen or show modal
              console.log('User confirmed cancellation');
            }
          }
        ]
      );
    }
  }, [task, isProcessing, onCancelTask]);

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
          style={[styles.cancelButton, isProcessing && styles.disabledButton]}
          onPress={handleCancelTask}
          activeOpacity={0.7}
          disabled={isProcessing}
        >
          <MaterialIcons name="close" size={20} color={isProcessing ? "#999" : "#fff"} />
        </TouchableOpacity>
      </View>
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
});
