import { Task } from '@/src/api/types/tasks';
import { ChatWindow } from '@/src/features/messages/components/ChatWindow';
import type { Message } from '@/src/features/messages/components/message-types';
import { RatingReviewModal } from '@/src/features/tasks/components/RatingReviewModal';
import StripePaymentModal from '@/src/shared/components/StripePaymentModal';

import {
    useAcceptOffer,
    useCancelTask,
    useCompleteTask,
    useCompleteTaskPayment,
    useCreateCancellationRequest,
    useDeleteTask,
    useGetCancellationReasons,
    useGetCancellationRequest,
    useRespondToCancellationRequest,
    useSubmitReview
} from '@/src/shared/hooks/useTaskApi';
import { useGetUserChats } from '@/src/shared/hooks/useTaskChat';
import { formatCurrency, getCurrencySymbol } from '@/src/shared/utils/currency';
import { isNetworkError } from '@/src/shared/utils/networkErrorHandler';
import { useAuthStore } from '@/src/store/auth-task-store';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Responsive utilities
import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';

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
  
  // Get current user from auth store
  const { user: currentUser } = useAuthStore();
  
  // Get user's chats to check if chat exists for this task
  const { data: chatsData } = useGetUserChats();
  
  
  const [showPosterCancelModal, setShowPosterCancelModal] = useState(false);
  const [showTaskerCancelModal, setShowTaskerCancelModal] = useState(false);
  const [showCancelRequestModal, setShowCancelRequestModal] = useState(false); // NEW: Post-payment cancellation request modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false); // NEW: Rating & Review modal
  const [showChatModal, setShowChatModal] = useState(false); // NEW: Chat modal
  const [chatMessage, setChatMessage] = useState<Message | null>(null); // NEW: Selected message for chat
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [selectedCancelReason, setSelectedCancelReason] = useState<number | null>(null);
  const [selectedCancelReasonData, setSelectedCancelReasonData] = useState<any | null>(null);
  
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
  const cancelTaskMutation = useCancelTask(); // Legacy: Pre-payment cancellation
  const createCancellationRequestMutation = useCreateCancellationRequest(); // NEW: Post-payment cancellation request
  const respondToCancellationRequestMutation = useRespondToCancellationRequest(); // NEW: Respond to request
  const acceptOfferMutation = useAcceptOffer();
  const completeTaskMutation = useCompleteTask();
  const completeTaskPaymentMutation = useCompleteTaskPayment();
  const submitReviewMutation = useSubmitReview(); // NEW: Submit review
  
  // Check if there's a pending cancellation request for this task (only for assigned/accepted/completed/cancelled tasks)
  const isPostPaymentTask = status === 'accepted' || status === 'assigned' || status === 'completed' || status === 'todo';
  const shouldFetchCancellationRequest = isPostPaymentTask || status === 'cancelled';
  const { data: cancellationRequestData, refetch: refetchCancellationRequest } = useGetCancellationRequest(
    task._id, 
    shouldFetchCancellationRequest // Fetch for post-payment tasks AND cancelled tasks
  );
  const pendingCancellationRequest = cancellationRequestData?.data;
  
  // Enhanced logging for cancelled tasks
  if (status === 'cancelled') {
    console.log('🔍 CANCELLED TASK - Cancellation Request Details:', {
      taskId: task._id.substring(0, 8),
      taskTitle: task.title.substring(0, 30),
      status,
      shouldFetch: shouldFetchCancellationRequest,
      queryData: cancellationRequestData,
      hasCancellationRequest: !!pendingCancellationRequest,
      requestStatus: pendingCancellationRequest?.status,
      requestedBy: pendingCancellationRequest?.requestedBy,
      requestedById: typeof pendingCancellationRequest?.requestedBy === 'string' 
        ? pendingCancellationRequest.requestedBy 
        : pendingCancellationRequest?.requestedBy?._id,
      currentUserId: currentUser?._id || currentUser?.id,
      taskCreatedById: task.createdBy?._id,
      reason: pendingCancellationRequest?.reason
    });
  }
  
  console.log('🔍 Cancellation Request Query:', {
    taskId: task._id.substring(0, 8),
    taskTitle: task.title.substring(0, 30),
    status,
    isPostPaymentTask,
    shouldFetch: shouldFetchCancellationRequest,
    hasCancellationRequest: !!pendingCancellationRequest,
    requestStatus: pendingCancellationRequest?.status,
    requestedBy: pendingCancellationRequest?.requestedBy,
    currentUserId: currentUser?._id || currentUser?.id,
    taskCreatedById: task.createdBy?._id
  });
  
  // Fetch cancellation reasons based on user role
  const cancellationType = userRole === 'Poster' ? 'poster' : 'tasker';
  const { data: cancellationReasonsData, isLoading: loadingReasons } = useGetCancellationReasons(cancellationType);
  
  // Extract reasons array from API response
  const cancellationReasons = cancellationReasonsData?.data || [];
  
  console.log(`📋 Cancellation reasons for ${cancellationType}:`, {
    count: cancellationReasons.length,
    reasons: cancellationReasons.map((r: any) => r.reason)
  });

  // Check if there's a pending cancellation request from the other party (for visual indicator)
  const hasPendingCancelRequestFromOther = useMemo(() => {
    if (!pendingCancellationRequest || pendingCancellationRequest.status !== 'pending') {
      return false;
    }
    
    const requesterId = typeof pendingCancellationRequest.requestedBy === 'string' 
      ? pendingCancellationRequest.requestedBy 
      : pendingCancellationRequest.requestedBy?._id;
    
    const currentUserId = currentUser?._id || currentUser?.id;
    
    if (!currentUserId) return false;
    
    // Return true only if the request was made by the OTHER party
    return requesterId !== currentUserId;
  }, [pendingCancellationRequest, currentUser]);

  // Check if poster has requested cancellation (any status, not just pending) - for hiding tasker's cancel button
  const posterHasRequestedCancellation = useMemo(() => {
    // Check if task status indicates poster cancellation request
    if (task.status === 'cancel_request_by_poster') {
      return true;
    }
    
    // Check if there's an active cancellation request from the poster
    if (!pendingCancellationRequest) {
      return false;
    }
    
    // Only consider non-rejected requests (pending, admin_review, accepted statuses)
    const activeStatuses = ['pending', 'admin_review', 'accepted'];
    if (!activeStatuses.includes(pendingCancellationRequest.status)) {
      return false;
    }
    
    const requesterId = typeof pendingCancellationRequest.requestedBy === 'string' 
      ? pendingCancellationRequest.requestedBy 
      : pendingCancellationRequest.requestedBy?._id;
    
    const posterId = task.createdBy?._id;
    
    // Return true if the poster is the one who requested cancellation
    return requesterId === posterId;
  }, [pendingCancellationRequest, task]);

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

  // Helper function to handle chat modal
  const handleOpenChat = useCallback(() => {
    console.log('💬 Chat button touched for task:', task._id, task.title);
    
    // Find the chat for this task
    const taskChat = chatsData?.chats?.find((chat: any) => {
      const chatTaskId = typeof chat.taskId === 'string' ? chat.taskId : chat.taskId?._id;
      return chatTaskId === task._id;
    });
    
    // Extract FULL poster object (task creator)
    let posterObj: any = null;
    if (typeof task.createdBy === 'object' && task.createdBy?._id) {
      posterObj = {
        _id: task.createdBy._id,
        firstName: task.createdBy.firstName || '',
        lastName: task.createdBy.lastName || '',
        avatar: task.createdBy.avatar || task.createdBy.profilePicture || null,
      };
    }
    
    // Extract FULL tasker object (assigned user or accepted offer user)
    let taskerObj: any = null;
    const assignedTo = (task as any).assignedTo;
    if (typeof assignedTo === 'object' && assignedTo?._id) {
      taskerObj = {
        _id: assignedTo._id,
        firstName: assignedTo.firstName || '',
        lastName: assignedTo.lastName || '',
        avatar: assignedTo.avatar || assignedTo.profilePicture || null,
      };
    } else if (task.offers && Array.isArray(task.offers)) {
      // Find accepted offer and get the full tasker object
      const acceptedOffer = task.offers.find((o: any) => o.status === 'accepted');
      if (acceptedOffer) {
        const taskTaker: any = acceptedOffer.taskTaker || acceptedOffer.taskTakerId;
        if (typeof taskTaker === 'object' && taskTaker?._id) {
          taskerObj = {
            _id: taskTaker._id,
            firstName: taskTaker.firstName || '',
            lastName: taskTaker.lastName || '',
            avatar: taskTaker.avatar || taskTaker.profilePicture || null,
          };
        }
      }
    }
    
    console.log('💬 Opening chat modal for task:', { 
      taskId: task._id, 
      taskTitle: task.title,
      chatId: taskChat?._id, 
      poster: posterObj ? `${posterObj.firstName} ${posterObj.lastName} (${posterObj._id})` : 'null',
      tasker: taskerObj ? `${taskerObj.firstName} ${taskerObj.lastName} (${taskerObj._id})` : 'null',
      existingChat: taskChat ? 'YES' : 'NO'
    });
    
    // Extract participant objects from chat if available
    const posterFromChat = typeof taskChat?.posterId === 'object' ? taskChat.posterId : null;
    const taskerFromChat = typeof taskChat?.taskerId === 'object' ? taskChat.taskerId : null;
    
    // Use chat participants if available, otherwise use task participants
    const finalPoster = posterFromChat || posterObj;
    const finalTasker = taskerFromChat || taskerObj;
    
    console.log('👥 FINAL PARTICIPANTS FOR CHAT:', {
      posterId: finalPoster?._id,
      posterName: finalPoster ? `${finalPoster.firstName} ${finalPoster.lastName}` : 'NULL',
      taskerId: finalTasker?._id,
      taskerName: finalTasker ? `${finalTasker.firstName} ${finalTasker.lastName}` : 'NULL'
    });
    
    // Create a message object to pass to ChatWindow (with extended properties)
    const messageForChat: any = {
      id: taskChat?._id || task._id,
      chatId: taskChat?._id || '',
      title: task.title,
      preview: '',
      date: '',
      avatar: '',
      unreadCount: 0,
      taskId: task._id,
      posterId: finalPoster?._id || '',
      taskerId: finalTasker?._id || '',
      posterObj: finalPoster,
      taskerObj: finalTasker
    };
    
    setChatMessage(messageForChat);
    setShowChatModal(true);
  }, [task, chatsData]);


  const handleMarkAsCompleted = useCallback(async () => {
    if (completeTaskMutation.isPending || completeTaskPaymentMutation.isPending || isProcessing) {
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
      console.log('🔍 Task data:', {
        id: task._id,
        status: task.status,
        userRole,
        tabStatus: status,
        hasOffers: !!task.offers,
        offersCount: task.offers?.length || 0,
        offers: task.offers,
        hasAcceptedOffer: !!(task as any).acceptedOffer,
        assignedTo: (task as any).assignedTo,
        paymentIntentId: (task as any).paymentIntentId
      });
      
      // Check if this is an accepted offer that requires payment completion
      // This should be true when we're in the "Accepted" tab (Poster side)
      const isAcceptedOfferTask = status === 'accepted' && userRole === 'Poster';
      
      if (isAcceptedOfferTask) {
        console.log('💳 Attempting payment completion for accepted offer...');
        
        // Try to find payment intent ID and offer ID from task data
        let paymentIntentId = (task as any).paymentIntentId;
        let acceptedOfferId = null;
        
        // Try multiple ways to find the accepted offer information
        if (task.offers && Array.isArray(task.offers)) {
          const acceptedOffer = task.offers.find(offer => offer.status === 'accepted');
          if (acceptedOffer) {
            acceptedOfferId = acceptedOffer._id;
            console.log('✅ Found accepted offer in task.offers:', acceptedOfferId);
          }
        }
        
        if (!acceptedOfferId && (task as any).acceptedOffer) {
          const acceptedOffer = (task as any).acceptedOffer;
          acceptedOfferId = acceptedOffer._id || acceptedOffer;
          console.log('✅ Found accepted offer in task.acceptedOffer:', acceptedOfferId);
        }
        
        if (paymentIntentId && acceptedOfferId) {
          try {
            // Use the payment completion API with proper data
            await completeTaskPaymentMutation.mutateAsync({ 
              taskId: task._id,
              completionData: {
                paymentIntentId: paymentIntentId,
                taskId: task._id,
                offerId: acceptedOfferId,
              }
            });
            
            console.log('✅ Task payment completed successfully');
          } catch (paymentError: any) {
            if (!isNetworkError(paymentError) && __DEV__) {
              console.warn('⚠️ Payment completion failed:', paymentError?.message);
            }
            
            // If payment completion fails, try regular completion as fallback
            // This handles cases where payment API is unavailable or task is already paid
            if (paymentError?.response?.status === 500 || 
                paymentError?.response?.status === 400 ||
                paymentError?.response?.status === 404 ||
                paymentError?.message?.includes('Failed to complete task payment') ||
                paymentError?.response?.data?.message?.includes('No accepted offer found') ||
                paymentError?.response?.data?.message?.includes('Payment has not been completed yet')) {
              console.log('⚠️ Payment completion failed, falling back to regular task completion');
              await completeTaskMutation.mutateAsync(task._id);
            } else {
              throw paymentError; // Re-throw if it's a different error
            }
          }
        } else {
          // Try payment completion without paymentIntentId first (maybe it's not required)
          console.log('⚠️ Missing payment intent ID, trying payment completion without it');
          
          try {
            await completeTaskPaymentMutation.mutateAsync({ 
              taskId: task._id,
              completionData: {
                taskId: task._id,
                offerId: acceptedOfferId,
              }
            });
            console.log('✅ Task payment completed successfully without paymentIntentId');
          } catch (paymentError: any) {
            if (!isNetworkError(paymentError) && __DEV__) {
              console.warn('⚠️ Payment completion failed:', paymentError?.message);
            }
            
            // Fall back to regular task completion
            console.log('⚠️ Payment completion failed, using regular task completion');
            console.log('   PaymentIntentId:', paymentIntentId);
            console.log('   AcceptedOfferId:', acceptedOfferId);
            await completeTaskMutation.mutateAsync(task._id);
          }
        }
      } else {
        // Regular task completion for non-payment tasks
        console.log('✅ Using regular task completion...');
        await completeTaskMutation.mutateAsync(task._id);
      }
      
      console.log('✅ Task marked as completed successfully');
      
      // Notify parent component to refresh and move to Completed tab
      if (onTaskCompleted) {
        onTaskCompleted(task._id);
      }
      
      // Show success message
      Alert.alert(
        'Task Completed',
        isAcceptedOfferTask ? 
          'Payment has been released and the task has been marked as completed. Would you like to rate and review the tasker now?' : 
          'The task has been marked as completed and moved to the Completed tab.',
        isAcceptedOfferTask ? [
          {
            text: 'Later',
            style: 'cancel',
            onPress: () => {
              console.log('⏭️ Poster chose to skip review for now');
            }
          },
          { 
            text: 'Rate Now',
            onPress: () => {
              // POSTER: Show rating modal after task completion
              console.log('⭐ Task completed - now showing rating modal for poster');
              // Give time for backend to update task status and UI to refresh
              setTimeout(() => {
                setShowRatingModal(true);
              }, 1500);
            }
          }
        ] : [{ text: 'OK' }]
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
  }, [task, status, userRole, completeTaskMutation, completeTaskPaymentMutation, onTaskCompleted, isProcessing, isValidMongoId]);

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
    console.log('   Task status:', status);
    console.log('   User role:', userRole);
    console.log('   Is post-payment task:', isPostPaymentTask);
    
    // Check if this is a post-payment task (accepted/assigned/completed)
    // These require cancellation REQUEST flow (needs other party's approval)
    if (isPostPaymentTask) {
      console.log('📝 Post-payment task - showing cancellation REQUEST modal');
      // Show the appropriate modal for creating a cancellation request
      if (userRole === 'Poster') {
        setShowPosterCancelModal(true);
      } else {
        setShowTaskerCancelModal(true);
      }
    } else {
      // Pre-payment task (open/posted) - use legacy direct cancellation
      console.log('❌ Pre-payment task - showing direct cancellation modal');
      if (userRole === 'Poster' && (status === 'open' || status === 'posted' || !status)) {
        setShowPosterCancelModal(true);
      } else {
        console.log('❌ Tasker cancelling task:', task._id);
        setShowTaskerCancelModal(true);
      }
    }
  }, [userRole, status, task._id, isProcessing, isValidMongoId, isPostPaymentTask]);

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
      if (!isNetworkError(error) && __DEV__) {
        console.warn('⚠️ Task deletion failed:', error?.message);
        console.warn('⚠️ Error details:', {
          message: error?.message,
          status: error?.response?.status,
          data: error?.response?.data,
          isAuthError: error?.isAuthError
        });
      }
      
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
    if (selectedCancelReason === null || !selectedCancelReasonData) {
      Alert.alert('Reason Required', 'Please select a reason for cancelling this task.');
      return;
    }
    
    if (cancelTaskMutation.isPending || createCancellationRequestMutation.isPending || isProcessing) {
      console.log('🛡️ Cancel operation already in progress');
      return;
    }
    
    try {
      setIsProcessing(true);
      const reasonText = selectedCancelReasonData.reason;
      const reasonId = selectedCancelReasonData._id;
      
      console.log('❌ Poster cancelling task:', task._id);
      console.log('   Reason:', reasonText);
      console.log('   Reason ID:', reasonId);
      console.log('   Is post-payment task:', isPostPaymentTask);
      
      // Check if this is a post-payment task (requires cancellation request)
      if (isPostPaymentTask) {
        console.log('📝 Creating cancellation REQUEST for post-payment task');
        await createCancellationRequestMutation.mutateAsync({ 
          taskId: task._id,
          reason: reasonText
        });
        
        console.log('✅ Cancellation request created successfully');
        console.log('   Task should stay in Accepted tab with pending request indicator');
        
        // Close modal and reset state
        setShowPosterCancelModal(false);
        setSelectedCancelReason(null);
        setSelectedCancelReasonData(null);
        
        // Refetch cancellation request to show the pending status
        await refetchCancellationRequest();
        
        // DON'T call onTaskCancelled here - task should stay in Accepted tab
        // The task will only move to Cancelled when the request is ACCEPTED by Tasker
        
        // Show success message
        Alert.alert(
          'Cancellation Request Sent',
          'Your cancellation request has been sent to the Tasker. The task will remain in the Accepted tab until they respond.',
          [{ text: 'OK' }]
        );
      } else {
        // Pre-payment task - use legacy direct cancellation
        console.log('❌ Direct cancellation for pre-payment task');
        await cancelTaskMutation.mutateAsync({ 
          taskId: task._id,
          reason: reasonText,
          reasonId: reasonId
        });
        
        console.log('✅ Task cancelled successfully via API');
        
        // Close modal and reset state
        setShowPosterCancelModal(false);
        setSelectedCancelReason(null);
        setSelectedCancelReasonData(null);
        
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
      }
      
      console.log('✅ Cancellation completed');
    } catch (error: any) {
      // Silent network error handling - only log if not a network error
      if (!isNetworkError(error) && __DEV__) {
        console.warn('⚠️ Task cancellation failed:', error?.message);
      }
      
      // Close modal on error
      setShowPosterCancelModal(false);
      setSelectedCancelReason(null);
      setSelectedCancelReasonData(null);
      
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

  const handleConfirmTaskerCancel = async () => {
    if (selectedCancelReason === null || !selectedCancelReasonData) {
      Alert.alert('Reason Required', 'Please select a reason for cancelling this task.');
      return;
    }
    
    if (cancelTaskMutation.isPending || createCancellationRequestMutation.isPending || isProcessing) {
      console.log('🛡️ Cancel operation already in progress');
      return;
    }
    
    try {
      setIsProcessing(true);
      const reasonText = selectedCancelReasonData.reason;
      const reasonId = selectedCancelReasonData._id;
      
      console.log('❌ Tasker cancelling task:', task._id);
      console.log('   Is post-payment task:', isPostPaymentTask);
      console.log('   Reason:', reasonText);
      console.log('   Reason ID:', reasonId);
      console.log('   Reason Index:', selectedCancelReason);
      
      if (isPostPaymentTask) {
        // Post-payment task - create cancellation REQUEST
        console.log('📤 Creating cancellation request (post-payment task)');
        await createCancellationRequestMutation.mutateAsync({ 
          taskId: task._id,
          reason: reasonText
        });
        
        console.log('✅ Cancellation request created successfully');
        console.log('   Task should stay in Todoo tab with pending request indicator');
        
        // Close modal and reset state
        setShowTaskerCancelModal(false);
        setSelectedCancelReason(null);
        setSelectedCancelReasonData(null);
        
        // Refetch cancellation request to show the pending status
        await refetchCancellationRequest();
        
        // DON'T call onTaskCancelled here - task should stay in Todoo tab
        // The task will only move to Cancelled when the request is ACCEPTED by Poster
        
        // Show success message for REQUEST
        Alert.alert(
          'Cancellation Request Sent',
          'Your cancellation request has been sent to the Poster. The task will remain in the Todoo tab until they respond.',
          [{ text: 'OK' }]
        );
        
        console.log('✅ Cancellation request sent to Poster - task stays in Todoo tab');
      } else {
        // Pre-payment task - direct cancellation
        console.log('❌ Direct task cancellation (pre-payment task)');
        await cancelTaskMutation.mutateAsync({ 
          taskId: task._id,
          reason: reasonText,
          reasonId: reasonId
        });
        
        console.log('✅ Task cancelled successfully via API');
        
        // Close modal and reset state
        setShowTaskerCancelModal(false);
        setSelectedCancelReason(null);
        setSelectedCancelReasonData(null);
        
        // Notify parent component
        if (onTaskCancelled) {
          onTaskCancelled(task._id);
        }
        
        // Show success message for DIRECT CANCEL
        Alert.alert(
          'Task Cancelled',
          'You have cancelled this task successfully. It has been moved to the Cancelled tab.',
          [{ text: 'OK' }]
        );
        
        console.log('✅ Task moved to Cancelled tab');
      }
    } catch (error: any) {
      // Silent network error handling - only log if not a network error
      if (!isNetworkError(error) && __DEV__) {
        console.warn('⚠️ Task cancellation failed:', error?.message);
      }
      
      // Close modal on error
      setShowTaskerCancelModal(false);
      setSelectedCancelReason(null);
      setSelectedCancelReasonData(null);
      
      // Show error message to user
      let errorMessage = isPostPaymentTask 
        ? 'Failed to send cancellation request. Please try again.'
        : 'Failed to cancel task. Please try again.';
      let errorTitle = isPostPaymentTask ? 'Request Failed' : 'Cancellation Failed';
      
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

  const handleViewReceipt = useCallback(() => {
    console.log('📄 Viewing payment receipt for task:', task._id);
    
    // Get tasker and poster names
    const taskerName = (task as any).assignedTo?.firstName 
      ? `${(task as any).assignedTo.firstName} ${(task as any).assignedTo.lastName || ''}`.trim()
      : 'Tasker';
    
    const posterName = task.createdBy?.firstName
      ? `${task.createdBy.firstName} ${task.createdBy.lastName || ''}`.trim()
      : 'Poster';
    
    // Get offer details - try multiple sources
    let offerAmount = task.budget || 0;
    let currency = task.currency || 'USD';
    let acceptedDate = task.createdAt;
    
    // Try to get accepted offer details and actual service fee from payment data
    let actualServiceFee = null;
    if (task.offers && Array.isArray(task.offers)) {
      const acceptedOffer = task.offers.find(o => o.status === 'accepted');
      if (acceptedOffer) {
        offerAmount = acceptedOffer.amount || acceptedOffer.offer?.amount || offerAmount;
        currency = acceptedOffer.currency || acceptedOffer.offer?.currency || currency;
        acceptedDate = acceptedOffer.createdAt || acceptedDate;
        // Get actual service fee from payment details if available
        actualServiceFee = (acceptedOffer as any).serviceFee || (acceptedOffer as any).paymentDetails?.serviceFee || null;
      }
    }
    
    // Also check task-level payment details for service fee
    if (!actualServiceFee && (task as any).paymentDetails?.serviceFee) {
      actualServiceFee = (task as any).paymentDetails.serviceFee;
    }
    
    // Parse location
    const parsedLocation = parseLocation(task.location);
    const taskLocation = parsedLocation?.address || 'Location not specified';
    
    // Navigate to receipt screen with actual service fee if available
    const receiptParams: any = {
      taskId: task._id,
      taskTitle: task.title,
      taskLocation: taskLocation,
      offerAmount: offerAmount.toString(),
      currency: currency,
      taskerName: taskerName,
      posterName: posterName,
      acceptedDate: acceptedDate,
      completedDate: task.updatedAt || task.createdAt,
      paymentId: (task as any).paymentIntentId || task._id,
      userRole: userRole,
    };
    
    // Add service fee if available from payment data
    if (actualServiceFee !== null) {
      receiptParams.serviceFee = actualServiceFee.toString();
      console.log('📊 Passing actual service fee to receipt:', actualServiceFee);
    }
    
    router.push({
      pathname: '/payment-receipt',
      params: receiptParams
    } as any);
  }, [task, userRole, router]);

  // ⭐ Handler for submitting review
  const handleSubmitReview = async (reviewData: {
    rating: number;
    reviewText: string;
    attachments: any[];
  }) => {
    try {
      // Check if poster is skipping the review (rating = 0)
      const isSkipping = reviewData.rating === 0;
      
      if (isSkipping) {
        console.log('⏭️ Poster skipping review');
        // Just close modal - task is already completed
        setShowRatingModal(false);
      } else {
        console.log('⭐ Submitting review for task:', task._id);
        
        await submitReviewMutation.mutateAsync({
          taskId: task._id,
          rating: reviewData.rating,
          reviewText: reviewData.reviewText,
          attachments: reviewData.attachments,
        });
        
        console.log('✅ Review submitted successfully');
        // Close modal after successful review submission
        setShowRatingModal(false);
      }
    } catch (error) {
      console.error('❌ Failed to submit review:', error);
      throw error; // Let the modal handle the error display
    }
  };

  const handleAcceptCancellation = async () => {
    if (!pendingCancellationRequest?._id) {
      console.warn('⚠️ No pending cancellation request found');
      setShowCancelRequestModal(false);
      return;
    }

    if (respondToCancellationRequestMutation.isPending) {
      console.log('🛡️ Response already in progress');
      return;
    }

    try {
      console.log('✅ Accepting cancellation request:', pendingCancellationRequest._id);
      
      await respondToCancellationRequestMutation.mutateAsync({
        requestId: pendingCancellationRequest._id,
        action: 'accept'
      });

      console.log('✅ Cancellation request accepted successfully');

      // Close modal first
      setShowCancelRequestModal(false);

      // Refetch cancellation request to get updated status
      await refetchCancellationRequest();

      // Notify parent component to refresh task list
      if (onTaskCancelled) {
        onTaskCancelled(task._id);
      }

      // Show success message
      Alert.alert(
        'Cancellation Accepted',
        'The task has been cancelled successfully and moved to the Cancelled tab.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      if (!isNetworkError(error) && __DEV__) {
        console.warn('⚠️ Accept cancellation failed:', error?.message);
      }

      // Show error message
      let errorMessage = 'Failed to accept cancellation. Please try again.';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    }
  };

  const handleRejectCancellation = async () => {
    if (!pendingCancellationRequest?._id) {
      console.warn('⚠️ No pending cancellation request found');
      setShowCancelRequestModal(false);
      return;
    }

    if (respondToCancellationRequestMutation.isPending) {
      console.log('🛡️ Response already in progress');
      return;
    }

    try {
      console.log('❌ Rejecting cancellation request:', pendingCancellationRequest._id);
      
      await respondToCancellationRequestMutation.mutateAsync({
        requestId: pendingCancellationRequest._id,
        action: 'reject'
      });

      console.log('✅ Cancellation request rejected successfully');

      // Close modal
      setShowCancelRequestModal(false);

      // Show success message
      Alert.alert(
        'Cancellation Rejected',
        'The cancellation request has been rejected and sent to admin for review.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      if (!isNetworkError(error) && __DEV__) {
        console.warn('⚠️ Reject cancellation failed:', error?.message);
      }

      // Show error message
      let errorMessage = 'Failed to reject cancellation. Please try again.';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    }
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
      
    } catch (error: any) {
      if (!isNetworkError(error) && __DEV__) {
        console.warn('⚠️ Offer acceptance preparation failed:', error?.message);
      }
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
    if (task.time && task.time !== 'Anytime') {
      const formattedTime = task.time.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
      return `🕒 ${formattedTime}`;
    }
    return '⏰ Flexible timing';
  };

  // Helper function to format task date with smart display
  const formatTaskDate = (date: string | undefined) => {
    if (!date) return null;
    try {
      const dateObj = new Date(date);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Reset hours for date comparison
      today.setHours(0, 0, 0, 0);
      tomorrow.setHours(0, 0, 0, 0);
      const compareDate = new Date(dateObj);
      compareDate.setHours(0, 0, 0, 0);
      
      if (compareDate.getTime() === today.getTime()) {
        return 'Today';
      } else if (compareDate.getTime() === tomorrow.getTime()) {
        return 'Tomorrow';
      } else {
        return dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: dateObj.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch {
      return null;
    }
  };

  // Helper function to get task date with date type context
  const getTaskDate = () => {
    if (!task.dateRange) {
      return new Date(task.createdAt).toLocaleDateString();
    }

    const { start, end } = task.dateRange;
    const dateType = task.dateType?.toLowerCase();
    
    if (dateType === 'doneby' && end) {
      const formattedDate = formatTaskDate(end);
      return formattedDate ? `By ${formattedDate}` : new Date(end).toLocaleDateString();
    } else if (dateType === 'doneon' && start) {
      const formattedDate = formatTaskDate(start);
      return formattedDate ? `On ${formattedDate}` : new Date(start).toLocaleDateString();
    } else if (start) {
      return formatTaskDate(start) || new Date(start).toLocaleDateString();
    } else if (end) {
      return formatTaskDate(end) || new Date(end).toLocaleDateString();
    }
    
    return new Date(task.createdAt).toLocaleDateString();
  };

  // Helper function to parse location if it's a string
  const parseLocation = (location: any) => {
    if (!location) return null;
    
    // If it's already an object with address, return it
    if (typeof location === 'object' && location.address) {
      return location;
    }
    
    // If it's a string, try to parse it
    if (typeof location === 'string') {
      try {
        const parsed = JSON.parse(location);
        console.log('📍 TaskCard: Parsed stringified location:', parsed);
        return parsed;
      } catch {
        // If parsing fails, treat it as plain address string
        console.warn('⚠️ TaskCard: Could not parse location string:', location);
        return { address: location, coordinates: {} };
      }
    }
    
    return null;
  };

  // Get parsed location
  const parsedLocation = parseLocation(task.location);
  
  // Helper function to get location type
  const getLocationType = () => {
    const address = parsedLocation?.address || '';
    if (address.includes(' → ') || address.includes(' to ')) {
      return '🚚 Moving/Delivery';
    }
    return '📍'; // Just show location pin, location address will be shown separately
  };

  // Helper function to format location display
  const formatLocation = () => {
    const address = parsedLocation?.address || 'Location not specified';
    // Clean up any JSON remnants from address
    let cleanAddress = address;
    if (typeof address === 'string' && (address.includes('{') || address.includes('"coordinates"'))) {
      console.warn('⚠️ TaskCard: Address contains JSON remnants:', address);
      // Try to extract just the address part
      const match = address.match(/"address":"([^"]+)"/);
      if (match) {
        cleanAddress = match[1];
      }
    }
    
    if (cleanAddress.includes(' → ') || cleanAddress.includes(' to ')) {
      const parts = cleanAddress.split(/\s*(?:→|to)\s*/);
      return `${parts[0]} → ${parts[1]}`;
    }
    return cleanAddress;
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

  // Get task's original currency - DO NOT convert to user's location currency
  // Tasks should display in their original posted currency (LKR, AUD, etc.)
  const formattedBudgetDisplay = task.formattedBudget || 
    (task.budget && task.currency ? formatCurrency(task.budget, { code: task.currency, symbol: getCurrencySymbol(task.currency) }) : 
    'Budget not specified');

  return (
    <View style={[
      styles.card,
      hasPendingCancelRequestFromOther && styles.cardWithCancelRequest
    ]} pointerEvents="auto">
      {/* Pending Cancellation Request Banner */}
      {hasPendingCancelRequestFromOther && (
        <TouchableOpacity 
          style={styles.cancelRequestBanner}
          onPress={() => setShowCancelRequestModal(true)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="warning" size={20} color="#fff" />
          <Text style={styles.cancelRequestBannerText}>
            {(() => {
              const requesterId = typeof pendingCancellationRequest.requestedBy === 'string' 
                ? pendingCancellationRequest.requestedBy 
                : pendingCancellationRequest.requestedBy?._id;
              const posterId = task.createdBy?._id;
              return requesterId === posterId 
                ? 'Poster requested cancellation - Tap to respond' 
                : 'Tasker requested cancellation - Tap to respond';
            })()}
          </Text>
          <MaterialIcons name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>
      )}
      
      {/* Clickable Card Content - Navigates to Details (disabled for Completed tab) */}
      <TouchableOpacity
        style={styles.cardContent}
        activeOpacity={status === 'completed' ? 1 : 0.7}
        onPress={status === 'completed' ? undefined : () => {
          console.log('📋 Card pressed, navigating to task detail:', task._id);
          router.push(`/task-detail?taskId=${task._id}`);
        }}
        disabled={status === 'completed'}
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
                : (() => {
                    // Count only non-rejected offers
                    const nonRejectedOffers = task.offers?.filter((offer: any) => offer.status !== 'rejected') || [];
                    const offerCount = nonRejectedOffers.length || task.offerCount || 0;
                    return offerCount > 0
                      ? `${offerCount} Offer${offerCount !== 1 ? 's' : ''}`
                      : 'Make the first offer';
                  })()}
            </Text>
          </View>

          {/* Price and User Info */}
          <View style={styles.price}>
            <Text style={styles.priceText}>
              {formattedBudgetDisplay}
            </Text>
            {(() => {
              // Determine which user profile to show based on role and task status
              let displayUser = null;

              // For Poster viewing their tasks - always show poster (createdBy)
              if (userRole === 'Poster') {
                displayUser = task.createdBy;
              } 
              // For Tasker viewing tasks
              else if (userRole === 'Tasker') {
                // For assigned/in-progress/todo tasks, show the poster (task creator)
                if (task.status === 'assigned' || task.status === 'in_progress' || 
                    task.status === 'todo' || task.status === 'in-progress') {
                  displayUser = task.createdBy;
                }
                // For open tasks or tasks with pending offers, show the poster
                else {
                  displayUser = task.createdBy;
                }
              } 
              // Default to showing poster
              else {
                displayUser = task.createdBy;
              }

              // Render the profile picture if user exists
              if (displayUser) {
                const firstName = displayUser.firstName || 'User';
                const lastName = displayUser.lastName || '';
                const profileUri = displayUser.avatar || 
                                 displayUser.profilePicture ||
                                 `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=0052A2&color=fff&size=80`;
                
                return (
                  <Image
                    source={{ uri: profileUri }}
                    style={styles.userAvatar}
                  />
                );
              }
              return null;
            })()}
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
        // Count only non-rejected offers
        const nonRejectedOffers = task.offers?.filter((offer: any) => offer.status !== 'rejected') || [];
        const offerCount = nonRejectedOffers.length || task.offerCount || 0;
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
                  Offers: {(task.offers?.filter((offer: any) => offer.status !== 'rejected') || []).length || task.offerCount || 0}
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
                  Offers: {(task.offers?.filter((offer: any) => offer.status !== 'rejected') || []).length || task.offerCount || 0}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons - Separate from Card Content */}
      <View style={styles.actionButtons} pointerEvents="box-none">
        {status === 'completed' && userRole === 'Tasker' ? (
          // Completed tab (Tasker): Add Rating & Review button + View Receipt button
          <>
            <TouchableOpacity 
              style={[
                styles.actionButton,
                styles.reviewButton,
                isProcessing && styles.disabledButton
              ]} 
              activeOpacity={0.6}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              onPress={() => setShowRatingModal(true)}
              disabled={isProcessing}
            >
              <MaterialIcons 
                name="star" 
                size={20} 
                color={isProcessing ? "#999" : "#FFD700"} 
              />
              
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.actionButton,
                styles.receiptButton,
                isProcessing && styles.disabledButton
              ]} 
              activeOpacity={0.6}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              onPress={handleViewReceipt}
              disabled={isProcessing}
            >
              <MaterialIcons 
                name="receipt" 
                size={20} 
                color={isProcessing ? "#999" : "#007AFF"} 
              />
            </TouchableOpacity>
          </>
        ) : status === 'completed' && userRole === 'Poster' ? (
          // Completed tab (Poster): View Receipt button only (no Delete button, no Rate & Review button)
          // Rating happens through completion flow popup, not from completed tab
          <>
            <TouchableOpacity 
              style={[
                styles.actionButton,
                styles.receiptButton,
                isProcessing && styles.disabledButton
              ]} 
              activeOpacity={0.6}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              onPress={handleViewReceipt}
              disabled={isProcessing}
            >
              <MaterialIcons 
                name="receipt" 
                size={20} 
                color={isProcessing ? "#999" : "#007AFF"} 
              />
            </TouchableOpacity>
          </>
        ) : status === 'cancelled' ? (
          // Cancelled tab (Both Tasker and Poster): No buttons at all
          null
        ) : status === 'open' && userRole === 'Tasker' ? (
          // Tasker Open Tasks: Only Cancel button (hidden if poster already requested cancellation)
          posterHasRequestedCancellation ? null : (
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
          )
        ) : status === 'assigned' && userRole === 'Tasker' ? (
          // Tasker Todoo Tasks: Chat + Cancel button (cancel hidden if poster already requested cancellation)
          (() => {
            // Hide cancel button if poster has requested cancellation
            const shouldHideCancelButton = posterHasRequestedCancellation;
            
            return (
              <>
                <TouchableOpacity 
                  style={[styles.chatButton]}
                  onPress={handleOpenChat}
                  activeOpacity={0.7}
                  delayPressIn={0}
                >
                  <MaterialIcons 
                    name="chat" 
                    size={20} 
                    color="#007bff" 
                  />
                </TouchableOpacity>
                {!shouldHideCancelButton && (
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
                )}
              </>
            );
          })()
        ) : status === 'accepted' ? (
          // Accepted Offers tab: Chat + Mark as Completed + Cancel (cancel hidden if poster already requested cancellation)
          <>
            <TouchableOpacity 
              style={[styles.chatButton]}
              onPress={handleOpenChat}
              activeOpacity={0.7}
              delayPressIn={0}
            >
              <MaterialIcons 
                name="chat" 
                size={20} 
                color="#007bff" 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.completedButton,
                (isProcessing || completeTaskMutation.isPending || completeTaskPaymentMutation.isPending) && styles.disabledButton
              ]}
              onPress={() => {
                console.log('🔥 Mark as Completed button touched!');
                if (!isProcessing && !completeTaskMutation.isPending && !completeTaskPaymentMutation.isPending) {
                  handleMarkAsCompleted();
                }
              }}
              activeOpacity={0.7}
              delayPressIn={0}
              disabled={isProcessing || completeTaskMutation.isPending || completeTaskPaymentMutation.isPending}
            >
              {(isProcessing || completeTaskMutation.isPending || completeTaskPaymentMutation.isPending) ? (
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
            {!posterHasRequestedCancellation && (
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
            )}
          </>
        ) : (
          // Posted tab or other tabs: Edit + Delete + Cancel (except Cancel for Poster in Posted tab)
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
            
            {/* Cancel Button - Hidden for Poster role in Posted tab */}
            {!(userRole === 'Poster' && !status) && (
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
            )}
          </>
        )} 
      </View>

      {/* Cancellation Notice for Cancelled Tab */}
      {status === 'cancelled' && pendingCancellationRequest && (
        <View style={styles.cancellationNotice}>
          <MaterialIcons name="info-outline" size={16} color="#dc3545" />
          <Text style={styles.cancellationText}>
            {(() => {
              const requesterId = typeof pendingCancellationRequest.requestedBy === 'string' 
                ? pendingCancellationRequest.requestedBy 
                : pendingCancellationRequest.requestedBy?._id;
              const currentUserId = currentUser?._id || currentUser?.id;
              const posterId = task.createdBy?._id;
              
              if (requesterId === currentUserId) {
                // Current user requested cancellation
                return pendingCancellationRequest.status === 'accepted' 
                  ? 'You requested cancellation - Accepted by other party'
                  : 'You requested cancellation - Pending approval';
              } else if (requesterId === posterId) {
                // Poster requested cancellation
                return pendingCancellationRequest.status === 'accepted'
                  ? 'Poster requested cancellation - You accepted'
                  : 'Poster requested cancellation';
              } else {
                // Tasker requested cancellation
                return pendingCancellationRequest.status === 'accepted'
                  ? 'Tasker requested cancellation - You accepted'
                  : 'Tasker requested cancellation';
              }
            })()}
          </Text>
        </View>
      )}
      
      {/* Fallback for old cancelled tasks without cancellation request data */}
      {status === 'cancelled' && !pendingCancellationRequest && userRole === 'Tasker' && (
        <View style={styles.cancellationNotice}>
          <MaterialIcons name="info-outline" size={16} color="#dc3545" />
          <Text style={styles.cancellationText}>Poster cancelled the task</Text>
        </View>
      )}

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

            {loadingReasons ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1a237e" />
                <Text style={styles.loadingText}>Loading cancellation reasons...</Text>
              </View>
            ) : cancellationReasons.length === 0 ? (
              <View style={styles.emptyReasonsContainer}>
                <Text style={styles.emptyReasonsText}>No cancellation reasons available.</Text>
              </View>
            ) : (
              <View style={styles.reasonsList}>
                {cancellationReasons.map((reasonData: any, index: number) => (
                  <TouchableOpacity
                    key={reasonData._id || index}
                    style={[
                      styles.reasonItem,
                      selectedCancelReason === index && styles.reasonItemSelected
                    ]}
                    onPress={() => {
                      setSelectedCancelReason(index);
                      setSelectedCancelReasonData(reasonData);
                    }}
                  >
                    <Text style={styles.reasonNumber}>{index + 1}.</Text>
                    <Text style={styles.reasonText}>{reasonData.reason}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.confirmCancelButton,
                (selectedCancelReason === null || loadingReasons) && styles.confirmCancelButtonDisabled
              ]}
              onPress={handleConfirmPosterCancel}
              disabled={selectedCancelReason === null || loadingReasons}
            >
              <Text style={styles.confirmCancelButtonText}>
                Confirm Cancellation
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Tasker Cancellation Reason Modal */}
      <Modal
        visible={showTaskerCancelModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowTaskerCancelModal(false);
          setSelectedCancelReason(null);
          setSelectedCancelReasonData(null);
        }}
      >
        <View style={styles.posterCancelOverlay}>
          <View style={styles.posterCancelContent}>
            <View style={styles.posterCancelHeader}>
              <Text style={styles.posterCancelTitle}>Choose a reason</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowTaskerCancelModal(false);
                  setSelectedCancelReason(null);
                  setSelectedCancelReasonData(null);
                }}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.warningContainer}>
              <MaterialIcons name="info-outline" size={20} color="#ff8c00" />
              <Text style={styles.warningText}>
                Please select a reason for cancelling this task.
              </Text>
            </View>

            {loadingReasons ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1a237e" />
                <Text style={styles.loadingText}>Loading cancellation reasons...</Text>
              </View>
            ) : cancellationReasons.length === 0 ? (
              <View style={styles.emptyReasonsContainer}>
                <Text style={styles.emptyReasonsText}>No cancellation reasons available.</Text>
              </View>
            ) : (
              <View style={styles.reasonsList}>
                {cancellationReasons.map((reasonData: any, index: number) => (
                  <TouchableOpacity
                    key={reasonData._id || index}
                    style={[
                      styles.reasonItem,
                      selectedCancelReason === index && styles.reasonItemSelected
                    ]}
                    onPress={() => {
                      setSelectedCancelReason(index);
                      setSelectedCancelReasonData(reasonData);
                    }}
                  >
                    <Text style={styles.reasonNumber}>{index + 1}.</Text>
                    <Text style={styles.reasonText}>{reasonData.reason}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.confirmCancelButton,
                (selectedCancelReason === null || loadingReasons) && styles.confirmCancelButtonDisabled
              ]}
              onPress={handleConfirmTaskerCancel}
              disabled={selectedCancelReason === null || loadingReasons}
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

      {/* Cancellation Request Response Modal */}
      <Modal
        visible={showCancelRequestModal && !!pendingCancellationRequest}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelRequestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteIconContainer}>
              <MaterialIcons name="cancel" size={48} color="#ff8c00" />
            </View>
            
            <Text style={styles.deleteModalTitle}>Cancellation Request</Text>
            <Text style={styles.deleteModalMessage}>
              {pendingCancellationRequest?.requestedBy === task.createdBy._id 
                ? 'The Poster has requested to cancel this task.' 
                : 'The Tasker has requested to cancel this task.'}
            </Text>

            {pendingCancellationRequest?.reason && (
              <View style={styles.warningContainer}>
                <MaterialIcons name="info-outline" size={20} color="#ff8c00" />
                <Text style={styles.warningText}>
                  <Text style={{ fontWeight: 'bold' }}>Reason: </Text>
                  {pendingCancellationRequest.reason}
                </Text>
              </View>
            )}

            <Text style={styles.deleteModalMessage}>
              Do you accept the cancellation?
            </Text>
            
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[
                  styles.deleteCancelButton,
                  (!pendingCancellationRequest || respondToCancellationRequestMutation.isPending) && styles.deleteConfirmButtonDisabled
                ]}
                onPress={handleRejectCancellation}
                disabled={!pendingCancellationRequest || respondToCancellationRequestMutation.isPending}
              >
                <Text style={styles.deleteCancelButtonText}>
                  {respondToCancellationRequestMutation.isPending ? 'Processing...' : 'Reject'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.deleteConfirmButton,
                  (!pendingCancellationRequest || respondToCancellationRequestMutation.isPending) && styles.deleteConfirmButtonDisabled
                ]}
                onPress={handleAcceptCancellation}
                disabled={!pendingCancellationRequest || respondToCancellationRequestMutation.isPending}
              >
                <Text style={styles.deleteConfirmButtonText}>
                  {respondToCancellationRequestMutation.isPending ? 'Processing...' : 'Accept'}
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
              data={(task.offers || []).filter((offer: any) => offer.status !== 'rejected')}
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
                
                // Get user data from offer
                const offerUser = offer.taskTaker || offer.taskTakerId;
                const firstName = offerUser?.firstName || 'User';
                const lastName = offerUser?.lastName || '';
                const profileUri = (offerUser as any)?.avatar || 
                                 (offerUser as any)?.profilePicture ||
                                 `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=0052A2&color=fff&size=80`;
                
                return (
                <View style={styles.offerItem}>
                  <View style={styles.offerHeader}>
                    <View style={styles.offerUserInfo}>
                      <Image
                        source={{ uri: profileUri }}
                        style={styles.offerAvatar}
                      />
                      <View style={styles.offerUserDetails}>
                        <Text style={styles.offerUserName}>
                          {firstName} {lastName}
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
                        {(() => {
                          const offerAmount = offer.amount || offer.offer?.amount || 0;
                          const offerCurrency = offer.currency || offer.offer?.currency || task.currency || 'AUD';
                          return formatCurrency(offerAmount, { code: offerCurrency, symbol: getCurrencySymbol(offerCurrency) });
                        })()}
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

      {/* Rating & Review Modal */}
      <RatingReviewModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleSubmitReview}
        taskTitle={task.title}
        userRole={userRole === 'Tasker' ? 'tasker' : 'poster'}
      />

      {/* Chat Modal */}
      <ChatWindow
        visible={showChatModal}
        onClose={() => {
          setShowChatModal(false);
          setChatMessage(null);
        }}
        message={chatMessage}
        taskId={task._id}
        posterId={(chatMessage as any)?.posterId}
        taskerId={(chatMessage as any)?.taskerId}
        posterIdProp={(chatMessage as any)?.posterObj}
        taskerIdProp={(chatMessage as any)?.taskerObj}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: isTablet ? 0 : wp('4%'),
    backgroundColor: '#F9F9F9',
    padding: isTablet ? wp('2%') : wp('4%'),
    borderRadius: isTablet ? 12 : 10,
    marginBottom: isTablet ? hp('1.5%') : hp('2%'),
    position: 'relative',
  },
  cardWithCancelRequest: {
    borderWidth: 3,
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  cancelRequestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  cancelRequestBannerText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cardContent: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: isTablet ? hp('1.2%') : hp('1.5%'),
    gap: isTablet ? wp('1.5%') : wp('2%'),
    zIndex: 10,
    elevation: 10,
  },
  actionButton: {
    width: isTablet ? 44 : wp('9%'),
    height: isTablet ? 44 : wp('9%'),
    borderRadius: isTablet ? 22 : wp('4.5%'),
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
  chatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e7f3ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  completedButton: {
    flex: 1,
    backgroundColor: '#FFA500',
    paddingVertical: isTablet ? hp('1.3%') : hp('1.2%'),
    paddingHorizontal: isTablet ? wp('3%') : wp('4%'),
    borderRadius: isTablet ? 8 : 8,
    marginRight: isTablet ? wp('1.5%') : wp('2%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedButtonText: {
    color: '#fff',
    fontSize: RFValue(isTablet ? 12 : 12),
    fontWeight: '600',
  },
  cancelButton: {
    width: isTablet ? 44 : wp('9%'),
    height: isTablet ? 44 : wp('9%'),
    borderRadius: isTablet ? 22 : wp('4.5%'),
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancellationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('1.5%'),
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('3%'),
    backgroundColor: '#fff5f5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  cancellationText: {
    fontSize: RFValue(isTablet ? 11 : 11),
    color: '#dc3545',
    marginLeft: isTablet ? wp('1%') : wp('1.5%'),
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('5%'),
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: wp(isTablet ? '4%' : '6%'),
    width: isTablet ? wp('70%') : wp('85%'),
    maxWidth: isTablet ? 600 : 400,
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
    marginBottom: isTablet ? hp('1%') : 8,
    paddingRight: isTablet ? wp('1%') : 0,
  },
  info: {
    flex: 1,
    marginRight: isTablet ? wp('2%') : 12,
  },
  title: {
    fontSize: RFValue(isTablet ? 14 : 14),
    fontWeight: '600',
    marginBottom: isTablet ? hp('0.8%') : 8,
    color: '#1a1a1a',
    lineHeight: isTablet ? RFValue(20) : undefined,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isTablet ? hp('0.6%') : 4,
    flexWrap: 'wrap',
    gap: isTablet ? wp('1.5%') : 0,
  },
  timePreference: {
    fontSize: RFValue(isTablet ? 12 : 12),
    color: '#007bff',
    fontWeight: '500',
  },
  locationType: {
    fontSize: RFValue(isTablet ? 12 : 12),
    color: '#28a745',
    fontWeight: '500',
  },
  locationDivider: {
    marginHorizontal: isTablet ? wp('1.5%') : 6,
    color: '#ccc',
    fontSize: RFValue(isTablet ? 12 : 12),
  },
  locationText: {
    fontSize: RFValue(isTablet ? 12 : 12),
    color: '#666',
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: isTablet ? hp('0.6%') : 4,
  },
  status: {
    fontSize: RFValue(isTablet ? 11 : 12),
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  date: {
    fontSize: RFValue(isTablet ? 11 : 12),
    color: '#999',
  },
  offerCountText: {
    fontSize: RFValue(isTablet ? 12 : 12),
    color: '#007bff',
    fontWeight: '600',
    marginTop: isTablet ? hp('0.5%') : 4,
  },
  price: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: RFValue(isTablet ? 14 : 16),
    fontWeight: '700',
    color: '#007bff',
    marginBottom: isTablet ? hp('0.8%') : 8,
  },
  userAvatar: {
    width: isTablet ? 44 : 32,
    height: isTablet ? 44 : 32,
    borderRadius: isTablet ? 22 : 16,
    backgroundColor: '#f0f0f0',
  },
  description: {
    fontSize: RFValue(isTablet ? 13 : 14),
    color: '#555',
    lineHeight: isTablet ? RFValue(18) : 20,
    marginTop: isTablet ? hp('0.8%') : 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: isTablet ? wp('1.5%') : 8,
    marginTop: isTablet ? hp('1%') : 10,
    paddingTop: isTablet ? hp('0.8%') : 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  categoryLabel: {
    fontSize: RFValue(isTablet ? 12 : 13),
    color: '#4a5568',
    fontWeight: '600',
    lineHeight: isTablet ? RFValue(16) : 18,
  },
  categoryTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: isTablet ? wp('2%') : 8,
    paddingVertical: isTablet ? hp('0.4%') : 4,
    borderRadius: isTablet ? 10 : 12,
  },
  categoryText: {
    fontSize: RFValue(isTablet ? 10 : 11),
    color: '#1976d2',
    fontWeight: '500',
  },
  moreCategoriesText: {
    fontSize: RFValue(isTablet ? 10 : 12),
    color: '#718096',
    fontWeight: '500',
    fontStyle: 'italic',
    marginLeft: isTablet ? wp('0.5%') : 4,
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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyReasonsContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyReasonsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
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
  receiptButton: {
    backgroundColor: '#e3f2fd',
  },
  reviewButton: {
    backgroundColor: '#FFF9E6',
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


