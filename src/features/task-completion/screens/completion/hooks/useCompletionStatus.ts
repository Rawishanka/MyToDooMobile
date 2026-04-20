import { useGetTaskCompletionStatus } from '@/src/shared/hooks/useTaskApi';
import { useCallback } from 'react';

export interface CompletionMilestone {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
}

export interface CompletionRating {
  score: number;
  feedback: string;
  ratedBy: string;
  ratedAt: string;
}

export interface CompletionUser {
  _id: string;
  firstName: string;
  lastName: string;
  verified?: boolean;
}

export interface CompletionStatusData {
  _id: string;
  taskId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'verified' | 'disputed';
  completedBy?: CompletionUser;
  completedAt?: string;
  verificationRequired: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  verifiedBy?: CompletionUser;
  verifiedAt?: string;
  notes?: string;
  milestones?: CompletionMilestone[];
  evidence?: {
    type: 'image' | 'document' | 'video';
    url: string;
    uploadedAt: string;
  }[];
  rating?: CompletionRating;
}

export const useCompletionStatus = (taskId: string) => {
  const {
    data: completionData,
    isLoading,
    error,
    refetch,
  } = useGetTaskCompletionStatus(taskId);

  const completion: any = completionData?.data || null;

  // Helper functions
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return '#28a745';
      case 'in_progress':
        return '#007bff';
      case 'disputed':
        return '#dc3545';
      case 'not_started':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  }, []);

  const getStatusIcon = useCallback((status: string): any => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'verified':
        return 'shield-checkmark';
      case 'in_progress':
        return 'hourglass';
      case 'disputed':
        return 'warning';
      case 'not_started':
        return 'ellipse-outline';
      default:
        return 'help-circle';
    }
  }, []);

  const getVerificationIcon = useCallback((verificationStatus?: string): any => {
    switch (verificationStatus) {
      case 'approved':
        return 'shield-checkmark';
      case 'rejected':
        return 'shield';
      default:
        return 'shield-outline';
    }
  }, []);

  const getVerificationColor = useCallback((verificationStatus?: string) => {
    switch (verificationStatus) {
      case 'approved':
        return '#28a745';
      case 'rejected':
        return '#dc3545';
      default:
        return '#ffc107';
    }
  }, []);

  return {
    completion,
    isLoading,
    error,
    refetch,
    formatDate,
    getStatusColor,
    getStatusIcon,
    getVerificationIcon,
    getVerificationColor,
  };
};
