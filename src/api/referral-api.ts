import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApi } from '@/src/shared/utils/api';
import { isNetworkError } from '@/src/shared/utils/networkErrorHandler';
import API_CONFIG from './config';

const api = createApi(API_CONFIG.BASE_URL);

export const PENDING_REFERRAL_CODE_KEY = 'pendingReferralCode';

export interface ReferralMeData {
  code: string;
  inviteUrl: string;
  pending: number;
  rewarded: number;
}

export interface ReferralMeResponse {
  success: boolean;
  data: ReferralMeData;
}

export interface AttachReferralResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

export async function getMyReferral(): Promise<ReferralMeResponse> {
  try {
    const response = await api.get('/referrals/me');
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Get referral me failed:', error?.response?.status || error?.message);
    }
    throw error;
  }
}

export async function attachReferral(code: string): Promise<AttachReferralResponse> {
  try {
    const response = await api.post('/referrals/attach', {
      referralCode: String(code).trim().toUpperCase(),
      code: String(code).trim().toUpperCase(),
    });
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Attach referral failed:', error?.response?.status || error?.message);
    }
    throw error;
  }
}

export async function setPendingReferralCode(code: string): Promise<void> {
  const cleaned = String(code || '').trim().toUpperCase();
  if (!cleaned) return;
  await AsyncStorage.setItem(PENDING_REFERRAL_CODE_KEY, cleaned);
}

export async function getPendingReferralCode(): Promise<string | null> {
  const value = await AsyncStorage.getItem(PENDING_REFERRAL_CODE_KEY);
  return value ? String(value).trim().toUpperCase() : null;
}

export async function clearPendingReferralCode(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_REFERRAL_CODE_KEY);
}

/** Attach stored referral after login; never blocks auth flow. */
export async function flushPendingReferralCode(): Promise<void> {
  const pending = await getPendingReferralCode();
  if (!pending) return;
  try {
    await attachReferral(pending);
  } catch (error) {
    if (__DEV__) {
      console.warn('Pending referral attach failed (non-blocking)', error);
    }
  } finally {
    await clearPendingReferralCode();
  }
}

export function extractReferralCodeFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url.replace(/^mytodoo(mobile)?:\/\//i, 'https://invite.local/'));
    const fromQuery =
      parsed.searchParams.get('ref') ||
      parsed.searchParams.get('referralCode') ||
      parsed.searchParams.get('code');
    if (fromQuery) return String(fromQuery).trim().toUpperCase();

    const pathMatch = url.match(/\/invite\/([A-Za-z0-9]+)/i);
    if (pathMatch?.[1]) return pathMatch[1].trim().toUpperCase();
  } catch {
    const fallback = url.match(/[?&](?:ref|referralCode|code)=([A-Za-z0-9]+)/i);
    if (fallback?.[1]) return fallback[1].trim().toUpperCase();
  }
  return null;
}

export const ReferralAPI = {
  getMyReferral,
  attachReferral,
  setPendingReferralCode,
  getPendingReferralCode,
  clearPendingReferralCode,
  flushPendingReferralCode,
  extractReferralCodeFromUrl,
};
