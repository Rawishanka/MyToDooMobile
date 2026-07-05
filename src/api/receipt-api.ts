import * as FileSystem from 'expo-file-system/legacy';
import { createApi } from '../shared/utils/api';
import API_CONFIG from './config';

const api = createApi(API_CONFIG.BASE_URL);

export interface TaskReceiptSummary {
  receiptId: string;
  receiptNumber: string;
  receiptType: 'payment' | 'earnings';
  amount: number;
  currency: string;
  canDownload: boolean;
}

interface TaskReceiptsResponse {
  success?: boolean;
  data?: {
    taskId?: string;
    receipts?: TaskReceiptSummary[];
  };
  receipts?: TaskReceiptSummary[];
}

export function pickReceiptForRole(
  receipts: TaskReceiptSummary[],
  userRole: string
): TaskReceiptSummary | undefined {
  const receiptType = userRole.toLowerCase() === 'tasker' ? 'earnings' : 'payment';
  return (
    receipts.find((r) => r.receiptType === receiptType && r.canDownload !== false) ??
    receipts.find((r) => r.receiptType === receiptType) ??
    receipts.find((r) => r.canDownload !== false)
  );
}

export async function getTaskReceipts(taskId: string): Promise<TaskReceiptSummary[]> {
  try {
    const response = await api.get<TaskReceiptsResponse>(`/receipts/task/${taskId}`);
    const payload = response.data;
    const receipts = payload?.data?.receipts ?? payload?.receipts ?? [];
    return Array.isArray(receipts) ? receipts : [];
  } catch (error: any) {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error?.message;
    if (status === 404) {
      throw new Error('Receipt not available yet. Complete the task and try again.');
    }
    if (status === 403) {
      throw new Error(message || 'You do not have permission to view this receipt.');
    }
    throw new Error(message || 'Failed to load receipt.');
  }
}

export async function downloadReceiptPdf(
  receiptId: string,
  receiptNumber?: string
): Promise<{ localUri: string; receiptNumber?: string }> {
  const safeName = (receiptNumber || receiptId).replace(/[^a-zA-Z0-9-_]/g, '_');
  const localUri = `${FileSystem.cacheDirectory}MyTodo-Receipt-${safeName}.pdf`;

  try {
    const response = await api.get<ArrayBuffer>(`/receipts/${receiptId}/download`, {
      responseType: 'arraybuffer',
      headers: { Accept: 'application/pdf' },
    });

    const base64 = btoa(
      new Uint8Array(response.data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    await FileSystem.writeAsStringAsync(localUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return { localUri, receiptNumber };
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 404) {
      throw new Error('Receipt PDF not found. Please try again later.');
    }
    if (status === 403) {
      throw new Error('You do not have permission to download this receipt.');
    }
    throw new Error(error?.response?.data?.message || error?.message || 'Failed to download receipt.');
  }
}

export async function buildReceiptPdfHtml(localUri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0">
  <style>
    html, body { margin: 0; padding: 0; height: 100%; background: #f5f5f5; }
    embed { display: block; width: 100%; height: 100vh; border: 0; }
  </style>
</head>
<body>
  <embed src="data:application/pdf;base64,${base64}" type="application/pdf" />
</body>
</html>`;
}
