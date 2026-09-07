import { createApi } from '@/src/shared/utils/api';
import { isNetworkError } from '@/src/shared/utils/networkErrorHandler';
import API_CONFIG from './config';

const api = createApi(API_CONFIG.BASE_URL);

export interface PromoSettings {
  referralCreditAmount: number;
  creditExpiryMonths: number;
  minTaskAmountForCreditSpend: number;
  creditsPayConnectionFee: boolean;
  creditsPayServiceFee: boolean;
  referralCampaignActive: boolean;
  referralCampaignStartsAt?: string | null;
  referralCampaignEndsAt?: string | null;
}

export interface CreditLedgerEntry {
  _id: string;
  user: string;
  amount: number;
  direction: 'credit' | 'debit';
  reason: string;
  balanceAfter: number;
  expiresAt?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface CreditsBalanceResponse {
  success: boolean;
  data: { balance: number };
}

export interface CreditsLedgerResponse {
  success: boolean;
  data: CreditLedgerEntry[];
}

export interface CreditsSettingsResponse {
  success: boolean;
  data: PromoSettings;
}

export interface PreviewFeeSpendRequest {
  taskAmount: number;
  connectionFee?: number;
  serviceFee?: number;
}

export interface PreviewFeeSpendResult {
  allowed: boolean;
  balance: number;
  maxRedeemable: number;
  feeTotal: number;
  reason?: string;
  settings?: PromoSettings;
}

export interface PreviewFeeSpendResponse {
  success: boolean;
  data: PreviewFeeSpendResult;
}

export async function getCreditsBalance(): Promise<CreditsBalanceResponse> {
  try {
    const response = await api.get('/credits/balance');
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Get credits balance failed:', error?.response?.status || error?.message);
    }
    throw error;
  }
}

export async function getCreditsLedger(limit = 50): Promise<CreditsLedgerResponse> {
  try {
    const response = await api.get('/credits/ledger', { params: { limit } });
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Get credits ledger failed:', error?.response?.status || error?.message);
    }
    throw error;
  }
}

export async function getCreditsSettings(): Promise<CreditsSettingsResponse> {
  try {
    const response = await api.get('/credits/settings');
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Get credits settings failed:', error?.response?.status || error?.message);
    }
    throw error;
  }
}

export async function previewFeeSpend(
  payload: PreviewFeeSpendRequest
): Promise<PreviewFeeSpendResponse> {
  try {
    const response = await api.post('/credits/preview-fee-spend', payload);
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Preview fee spend failed:', error?.response?.status || error?.message);
    }
    throw error;
  }
}

export const CreditsAPI = {
  getCreditsBalance,
  getCreditsLedger,
  getCreditsSettings,
  previewFeeSpend,
};
