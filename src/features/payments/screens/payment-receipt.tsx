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
import { BRAND_BLUE, BRAND_ORANGE, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
import { RFValue } from '@/src/shared/utils/responsive';
import AppLoader from '@/src/shared/components/AppLoader';

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
      // Android WebView cannot preview PDF via <embed>; HTML builder uses PDF.js there.
      const html = await buildReceiptPdfHtml(downloaded.localUri, Platform.OS);

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
      <StatusBar barStyle="light-content" backgroundColor={BRAND_BLUE} />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={CARD_TEXT} />
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
              <AppLoader size={22} color={CARD_TEXT} />
            ) : (
              <Ionicons name="share-outline" size={20} color={CARD_TEXT} />
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.shareButtonPlaceholder} />
        )}
      </View>

      {loadState === 'loading' && (
        <View style={styles.centerContent}>
          <AppLoader size={32} color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading receipt PDF...</Text>
        </View>
      )}

      {loadState === 'error' && (
        <View style={styles.centerContent}>
          <Ionicons name="document-text-outline" size={48} color="rgba(255,255,255,0.6)" />
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
              <AppLoader size={32} color="#FFFFFF" />
            </View>
          )}
          allowFileAccess
          allowFileAccessFromFileURLs
          allowUniversalAccessFromFileURLs={Platform.OS === 'android'}
          // Android PDF.js already sizes canvases; scalesPageToFit can blur the preview
          scalesPageToFit={Platform.OS !== 'android'}
          // Android PDF.js preview needs JS + CDN worker; iOS uses native <embed> (no JS required)
          javaScriptEnabled={Platform.OS === 'android'}
          domStorageEnabled={Platform.OS === 'android'}
          mixedContentMode={Platform.OS === 'android' ? 'always' : undefined}
          setSupportMultipleWindows={false}
          androidLayerType="hardware"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_BLUE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextWrap: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: CARD_TEXT,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: RFValue(13),
    color: CARD_TEXT_MUTED,
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonPlaceholder: {
    width: 36,
    height: 36,
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
    color: 'rgba(255,255,255,0.75)',
  },
  errorTitle: {
    marginTop: 16,
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  errorMessage: {
    marginTop: 8,
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: BRAND_ORANGE,
    paddingHorizontal: 32,
    height: 50,
    justifyContent: 'center',
    borderRadius: 14,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  webView: {
    flex: 1,
    backgroundColor: BRAND_BLUE,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BRAND_BLUE,
  },
});
