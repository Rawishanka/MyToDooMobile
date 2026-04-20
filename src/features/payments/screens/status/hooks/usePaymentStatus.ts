import { useGetPaymentStatus } from '@/src/shared/hooks/useTaskApi';
import { useMemo } from 'react';

export interface PaymentItem {
  _id: string;
  taskId: string;
  taskTitle: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  formattedAmount?: string;
}

export const usePaymentStatus = () => {
  const {
    data: paymentData,
    isLoading,
    error,
    refetch,
  } = useGetPaymentStatus();

  const payments: PaymentItem[] = useMemo(
    () => paymentData?.data || [],
    [paymentData]
  );

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#28a745';
      case 'failed':
        return '#dc3545';
      case 'pending':
        return '#ffc107';
      case 'refunded':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  };

  const getStatusIcon = (status: string): 'checkmark-circle' | 'close-circle' | 'time' | 'return-down-back' | 'help-circle' => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'failed':
        return 'close-circle';
      case 'pending':
        return 'time';
      case 'refunded':
        return 'return-down-back';
      default:
        return 'help-circle';
    }
  };

  return {
    payments,
    isLoading,
    error,
    refetch,
    formatDate,
    getStatusColor,
    getStatusIcon,
  };
};
