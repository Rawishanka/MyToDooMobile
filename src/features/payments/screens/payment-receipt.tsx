import {
  buildReceiptPdfHtml,
  downloadReceiptPdf,
  getTaskReceipts,
  pickReceiptForRole,
  type TaskReceiptSummary,
} from '@/src/api/receipt-api';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { RFValue } from '@/src/shared/utils/responsive';

type LoadState = 'loading' | 'ready' | 'error';

export default function PaymentReceiptScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const taskId = params.taskId as string;
  const userRole = (params.userRole as string) || 'Tasker';

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<TaskReceiptSummary | null>(null);
  const [localPdfUri, setLocalPdfUri] = useState<string | null>(null);
  const [pdfHtml, setPdfHtml] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const isTaskerView = userRole.toLowerCase() === 'tasker';
  const screenTitle = isTaskerView ? 'Task Receipt' : 'Payment Receipt';

  const loadReceipt = useCallback(async () => {
    if (!taskId) {
      setErrorMessage('Task ID is missing.');
      setLoadState('error');
      return;
    }

    setLoadState('loading');
    setErrorMessage(null);
    setReceipt(null);
    setLocalPdfUri(null);
    setPdfHtml(null);

    try {
      const receipts = await getTaskReceipts(taskId);
      const selected = pickReceiptForRole(receipts, userRole);

      if (!selected?.receiptId) {
        setErrorMessage('Receipt not available yet. Complete the task and try again.');
        setLoadState('error');
        return;
      }

      const downloaded = await downloadReceiptPdf(selected.receiptId, selected.receiptNumber);
      const html = await buildReceiptPdfHtml(downloaded.localUri);

      setReceipt(selected);
      setLocalPdfUri(downloaded.localUri);
      setPdfHtml(html);
      setLoadState('ready');
    } catch (error: any) {
      setErrorMessage(error?.message || 'Failed to load receipt.');
      setLoadState('error');
    }
  }, [taskId, userRole]);

  useEffect(() => {
    loadReceipt();
  }, [loadReceipt]);

  const handleShare = async () => {
    if (!localPdfUri || !receipt) return;

    try {
      setIsSharing(true);
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Unavailable', 'Sharing is not available on this device.');
        return;
      }

      const filename = `MyTodo-Receipt-${receipt.receiptNumber || receipt.receiptId}.pdf`;
      await Sharing.shareAsync(localPdfUri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: filename,
      });
    } catch (error: any) {
      Alert.alert('Share Failed', error?.message || 'Could not share the receipt PDF.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>{screenTitle}</Text>
          {receipt?.receiptNumber ? (
            <Text style={styles.headerSubtitle}>#{receipt.receiptNumber}</Text>
          ) : null}
        </View>

        {loadState === 'ready' && localPdfUri ? (
          <TouchableOpacity
            onPress={handleShare}
            style={styles.shareButton}
            disabled={isSharing}
            accessibilityRole="button"
            accessibilityLabel="Share receipt PDF"
          >
            {isSharing ? (
              <ActivityIndicator size="small" color="#0052A2" />
            ) : (
              <Ionicons name="share-outline" size={22} color="#0052A2" />
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.shareButtonPlaceholder} />
        )}
      </View>

      {loadState === 'loading' && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#0052A2" />
          <Text style={styles.loadingText}>Loading receipt PDF...</Text>
        </View>
      )}

      {loadState === 'error' && (
        <View style={styles.centerContent}>
          <Ionicons name="document-text-outline" size={48} color="#999" />
          <Text style={styles.errorTitle}>Receipt unavailable</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadReceipt}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {loadState === 'ready' && pdfHtml && (
        <WebView
          source={{ html: pdfHtml }}
          originWhitelist={['*']}
          style={styles.webView}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color="#0052A2" />
            </View>
          )}
          allowFileAccess
          allowFileAccessFromFileURLs
          allowUniversalAccessFromFileURLs={Platform.OS === 'android'}
          scalesPageToFit
          javaScriptEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    backgroundColor: '#fff',
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextWrap: {
    flex: 1,
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#111',
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: RFValue(13),
    color: '#666',
  },
  shareButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: RFValue(15),
    color: '#666',
  },
  errorTitle: {
    marginTop: 16,
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
  },
  errorMessage: {
    marginTop: 8,
    fontSize: RFValue(14),
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#0052A2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: RFValue(15),
    fontWeight: '600',
  },
  webView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
