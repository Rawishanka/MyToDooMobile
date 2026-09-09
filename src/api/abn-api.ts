import API_CONFIG from '@/src/api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TaskerAbnStatus {
  abnMasked: string | null;
  abnLast3: string | null;
  abnVerified: boolean;
  abnVerifiedAt: string | null;
  verificationMethod: 'manual' | 'abr_api' | null;
  isTasker: boolean;
}

export const ABN_ERROR_CODES = {
  INVALID: 'ABN_INVALID',
  REQUIRED: 'ABN_REQUIRED',
} as const;

const PENDING_SIGNUP_ABN_KEY = 'pendingSignupAbn';

async function authHeaders() {
  const token = await AsyncStorage.getItem('token');
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
}

export async function getAbnStatus(): Promise<TaskerAbnStatus> {
  const res = await fetch(`${API_CONFIG.BASE_URL}/users/me/tasker/abn`, {
    headers: await authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json.data;
}

export async function submitAbn(abn: string): Promise<TaskerAbnStatus> {
  const res = await fetch(`${API_CONFIG.BASE_URL}/users/me/tasker/abn`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify({ abn }),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json.data;
}

export function getAbnErrorMessage(err: any): string {
  const code = err?.code || err?.details?.code;
  if (code === ABN_ERROR_CODES.INVALID) {
    return err?.message || 'ABN checksum is invalid. Please check the number and try again.';
  }
  if (code === ABN_ERROR_CODES.REQUIRED) {
    return err?.message || 'An Australian Business Number (ABN) is required before setting up payouts.';
  }
  return err?.message || 'Failed to save ABN. Please try again.';
}

export async function setPendingSignupAbn(abn: string) {
  await AsyncStorage.setItem(PENDING_SIGNUP_ABN_KEY, abn);
}

export async function clearPendingSignupAbn() {
  await AsyncStorage.removeItem(PENDING_SIGNUP_ABN_KEY);
}

export async function flushPendingSignupAbn(): Promise<void> {
  const pending = await AsyncStorage.getItem(PENDING_SIGNUP_ABN_KEY);
  if (!pending) return;
  try {
    await submitAbn(pending);
  } finally {
    await AsyncStorage.removeItem(PENDING_SIGNUP_ABN_KEY);
  }
}

export function isAbnRequiredError(err: any): boolean {
  return err?.code === ABN_ERROR_CODES.REQUIRED || err?.details?.code === ABN_ERROR_CODES.REQUIRED;
}
