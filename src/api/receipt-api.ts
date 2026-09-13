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

/**
 * Build HTML to preview a local PDF inside a WebView.
 *
 * iOS WKWebView can render PDF via <embed data:...>.
 * Android System WebView cannot — that shows a blank white page.
 * On Android we render pages with PDF.js into canvases instead.
 */
export async function buildReceiptPdfHtml(
  localUri: string,
  platform: 'ios' | 'android' | 'web' | 'windows' | 'macos' = 'ios'
): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // iOS: native PDF embed (existing, working path)
  if (platform !== 'android') {
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

  // Android: PDF.js canvas renderer (System WebView has no built-in PDF viewer)
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=4.0, user-scalable=yes">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: #f5f5f5;
      min-height: 100%;
    }
    #status {
      padding: 24px 16px;
      text-align: center;
      color: #666;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
    }
    #viewer {
      padding: 8px 0 24px;
    }
    .page {
      display: block;
      margin: 8px auto;
      max-width: 100%;
      height: auto;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0,0,0,0.12);
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
</head>
<body>
  <div id="status">Loading receipt preview...</div>
  <div id="viewer"></div>
  <script>
    (function () {
      var statusEl = document.getElementById('status');
      var viewerEl = document.getElementById('viewer');
      var base64 = ${JSON.stringify(base64)};

      function fail(message) {
        statusEl.textContent = message || 'Unable to preview receipt.';
      }

      try {
        if (!window.pdfjsLib) {
          fail('PDF preview library failed to load. Check your internet connection and retry.');
          return;
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        var raw = atob(base64);
        var bytes = new Uint8Array(raw.length);
        for (var i = 0; i < raw.length; i++) {
          bytes[i] = raw.charCodeAt(i);
        }

        pdfjsLib.getDocument({ data: bytes }).promise.then(function (pdf) {
          statusEl.style.display = 'none';

          // Fit page to screen width, then multiply by devicePixelRatio so text
          // stays sharp on high-DPI Android screens (without this it looks blurry).
          var displayWidth = Math.max(280, window.innerWidth - 16);
          var dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);
          var cssScale = displayWidth / 595; // 595 ≈ A4 width in PDF points

          function renderPage(pageNum) {
            return pdf.getPage(pageNum).then(function (page) {
              var viewport = page.getViewport({ scale: cssScale * dpr });
              var canvas = document.createElement('canvas');
              canvas.className = 'page';
              canvas.width = Math.floor(viewport.width);
              canvas.height = Math.floor(viewport.height);
              // CSS size = logical pixels; canvas buffer = physical pixels
              canvas.style.width = Math.floor(viewport.width / dpr) + 'px';
              canvas.style.height = Math.floor(viewport.height / dpr) + 'px';
              viewerEl.appendChild(canvas);

              var context = canvas.getContext('2d');
              context.setTransform(1, 0, 0, 1, 0, 0);
              return page.render({
                canvasContext: context,
                viewport: viewport
              }).promise;
            });
          }

          var chain = Promise.resolve();
          for (var n = 1; n <= pdf.numPages; n++) {
            (function (pageNum) {
              chain = chain.then(function () { return renderPage(pageNum); });
            })(n);
          }
          return chain;
        }).catch(function (err) {
          fail((err && err.message) || 'Failed to render receipt PDF.');
        });
      } catch (err) {
        fail((err && err.message) || 'Failed to open receipt PDF.');
      }
    })();
  </script>
</body>
</html>`;
}
