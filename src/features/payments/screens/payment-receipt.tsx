import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useRef } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// API and Hooks
import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { formatCurrency, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';

export default function PaymentReceiptScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { countryInfo } = useLocationCountry();
  const userCurrencyInfo = getCurrencyFromUserLocation(countryInfo);
  
  const receiptRef = useRef<View>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);
  
  // Parse params
  const taskId = params.taskId as string;
  const taskTitle = params.taskTitle as string;
  const taskLocation = params.taskLocation as string;
  const offerAmount = parseFloat(params.offerAmount as string || '0');
  const currency = params.currency as string || userCurrencyInfo.code;
  const taskerName = params.taskerName as string;
  const posterName = params.posterName as string;
  const acceptedDate = params.acceptedDate as string;
  const completedDate = params.completedDate as string || new Date().toISOString();
  const paymentId = params.paymentId as string || taskId;
  const userRole = params.userRole as string || 'Tasker';
  const serviceFeeParam = params.serviceFee ? parseFloat(params.serviceFee as string) : null;
  
  // Parse location properly (handles nested JSON stringification)
  const parseTaskLocation = (locationParam: string): string => {
    if (!locationParam) return 'Not specified';
    
    try {
      // First, try to parse as JSON
      const parsed = JSON.parse(locationParam);
      
      // If parsed result has an address property
      if (parsed.address) {
        // Check if address itself is a stringified JSON
        if (typeof parsed.address === 'string' && parsed.address.startsWith('{')) {
          try {
            const nestedParsed = JSON.parse(parsed.address);
            return nestedParsed.address || nestedParsed.name || parsed.address;
          } catch {
            return parsed.address;
          }
        }
        return parsed.address;
      }
      
      // If parsed result is directly a string
      if (typeof parsed === 'string') return parsed;
      
      // If parsed has other location properties
      return parsed.name || parsed.city || parsed.place_name || JSON.stringify(parsed);
    } catch {
      // If not JSON, return as-is (plain string address)
      return locationParam;
    }
  };
  
  const parsedTaskLocation = parseTaskLocation(taskLocation);
  
  console.log('📄 Payment Receipt Screen Params:', {
    taskId,
    taskTitle,
    offerAmount,
    currency,
    taskerName,
    posterName,
    userRole
  });

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format currency
  const formattedAmount = formatCurrency(offerAmount, {
    code: currency,
    symbol: currency === 'USD' ? '$' : currency === 'LKR' ? 'Rs.' : currency
  });

  // Use actual service fee if provided from payment data, otherwise calculate
  // NOTE: This fallback calculation may not match the actual charged service fee
  // which is configurable in the admin panel. Ideally, serviceFee should always
  // be passed from the payment summary or fetched from backend payment details.
  const platformFee = serviceFeeParam !== null ? serviceFeeParam : (offerAmount * 0.10);
  const serviceFeePercentage = serviceFeeParam !== null 
    ? Math.round((serviceFeeParam / offerAmount) * 100) 
    : 10;
  const formattedPlatformFee = formatCurrency(platformFee, {
    code: currency,
    symbol: currency === 'USD' ? '$' : currency === 'LKR' ? 'Rs.' : currency
  });

  // Net amount for tasker
  const netAmount = offerAmount - platformFee;
  const formattedNetAmount = formatCurrency(netAmount, {
    code: currency,
    symbol: currency === 'USD' ? '$' : currency === 'LKR' ? 'Rs.' : currency
  });

  // Download receipt as PDF
  const handleDownloadReceipt = async () => {
    try {
      setIsDownloading(true);
      console.log('📥 Generating PDF receipt...');

      const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@page{size:A4;margin:0}*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fff;padding:0;margin:0}.page{width:210mm;min-height:297mm;padding:15mm;background:#fff}.receipt-container{border:2px solid #e0e0e0;border-radius:8px;overflow:hidden}.receipt-header{background:linear-gradient(135deg,#007AFF,#0051D5);color:#fff;padding:25px;text-align:center}.logo-text{font-size:32px;font-weight:700;letter-spacing:1.5px;margin-bottom:10px}.receipt-title{font-size:20px;font-weight:700;margin-bottom:4px}.receipt-subtitle{font-size:13px;opacity:.95}.receipt-body{padding:25px}.section{margin-bottom:18px;page-break-inside:avoid}.section-label{font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600}.section-value{font-size:15px;font-weight:600;color:#333}.section-title{font-size:16px;font-weight:700;color:#333;margin-bottom:12px;border-bottom:2px solid #007AFF;padding-bottom:6px}.info-row{display:flex;justify-content:space-between;margin-bottom:8px;padding:6px 0}.info-label{font-size:13px;color:#555;font-weight:500}.info-value{font-size:13px;color:#222;font-weight:600;text-align:right;max-width:60%;word-wrap:break-word}.party-card{background:#f8f9fa;padding:14px;border-radius:6px;margin-bottom:10px;border-left:4px solid #007AFF}.party-header{font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;font-weight:600}.party-name{font-size:16px;font-weight:700;color:#222}.payment-row{display:flex;justify-content:space-between;margin-bottom:10px;padding:6px 0}.payment-label{font-size:13px;color:#555;font-weight:500}.payment-value{font-size:13px;color:#222;font-weight:600}.divider-light{height:1px;background:#e0e0e0;margin:10px 0}.total-row{display:flex;justify-content:space-between;padding:14px 0;border-top:2px solid #007AFF;margin-top:10px}.total-label{font-size:17px;font-weight:700;color:#222}.total-value{font-size:20px;font-weight:700;color:#007AFF}.status-section{text-align:center;margin:20px 0;page-break-inside:avoid}.status-badge{display:inline-block;background:#d4edda;border:2px solid #28a745;padding:10px 24px;border-radius:25px;margin-bottom:8px}.status-text{font-size:15px;font-weight:700;color:#155724}.status-date{font-size:12px;color:#666;margin-top:4px}.footer{text-align:center;padding-top:18px;border-top:2px solid #e0e0e0;margin-top:20px}.footer-text{font-size:15px;font-weight:700;color:#333;margin-bottom:6px}.footer-subtext{font-size:12px;color:#666}.divider{height:1px;background:#d0d0d0;margin:16px 0}</style></head><body><div class="page"><div class="receipt-container"><div class="receipt-header"><div class="logo-text">MyTodoo</div><div class="receipt-title">PAYMENT RECEIPT</div><div class="receipt-subtitle">Official Transaction Record</div></div><div class="receipt-body"><div class="section"><div class="section-label">Receipt ID</div><div class="section-value">${paymentId.substring(0, 12).toUpperCase()}</div></div><div class="divider"></div><div class="section"><div class="section-title">Task Details</div><div class="info-row"><span class="info-label">Task:</span><span class="info-value">${taskTitle}</span></div><div class="info-row"><span class="info-label">Location:</span><span class="info-value">${parsedTaskLocation}</span></div><div class="info-row"><span class="info-label">Accepted:</span><span class="info-value">${formatDate(acceptedDate)}</span></div><div class="info-row"><span class="info-label">Completed:</span><span class="info-value">${formatDate(completedDate)}</span></div></div><div class="divider"></div><div class="section"><div class="section-title">Parties Involved</div><div class="party-card"><div class="party-header">👤 TASK POSTER</div><div class="party-name">${posterName}</div></div><div class="party-card"><div class="party-header">💼 TASKER</div><div class="party-name">${taskerName}</div></div></div><div class="divider"></div><div class="section"><div class="section-title">Payment Breakdown</div><div class="payment-row"><span class="payment-label">Task Amount</span><span class="payment-value">${formattedAmount}</span></div><div class="payment-row"><span class="payment-label">Platform Fee (${serviceFeePercentage}%)</span><span class="payment-value">- ${formattedPlatformFee}</span></div><div class="divider-light"></div><div class="total-row"><span class="total-label">${userRole === 'Tasker' ? 'Amount Received' : 'Total Paid'}</span><span class="total-value">${userRole === 'Tasker' ? formattedNetAmount : formattedAmount}</span></div></div><div class="divider"></div><div class="status-section"><div class="status-badge"><span class="status-text">✓ Payment Completed</span></div><div class="status-date">Processed on ${formatDate(completedDate)}</div></div><div class="footer"><div class="footer-text">Thank you for using MyTodoo!</div><div class="footer-subtext">For support, contact us at support@mytodoo.com</div></div></div></div></div></body></html>`;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      console.log('✅ PDF generated:', uri);

      const fileName = `MyTodo_Receipt_${paymentId.substring(0, 8)}_${Date.now()}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.copyAsync({ from: uri, to: fileUri });
      console.log('✅ PDF saved:', fileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Download Payment Receipt',
          UTI: 'com.adobe.pdf',
        });
      }
      
      Alert.alert(
        'Success', 
        'Payment receipt PDF downloaded successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Navigate back to My Tasks screen
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)/my-tasks');
              }
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ PDF generation error:', error);
      Alert.alert('Error', `Failed to generate PDF: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Payment Receipt',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#007AFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Receipt Container - This will be captured */}
        <View 
          ref={receiptRef}
          style={styles.receiptContainer}
          collapsable={false}
        >
          {/* Header with Logo */}
          <LinearGradient
            colors={['#007AFF', '#0051D5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.receiptHeader}
          >
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>MyTodoo</Text>
            </View>
            <Text style={styles.receiptTitle}>PAYMENT RECEIPT</Text>
            <Text style={styles.receiptSubtitle}>Official Transaction Record</Text>
          </LinearGradient>

          {/* Receipt Details */}
          <View style={styles.receiptBody}>
            {/* Receipt ID */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Receipt ID</Text>
              <Text style={styles.sectionValue}>{paymentId.substring(0, 12).toUpperCase()}</Text>
            </View>

            <View style={styles.divider} />

            {/* Task Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Task Details</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Task:</Text>
                <Text style={styles.infoValue}>{taskTitle}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Location:</Text>
                <Text style={styles.infoValue}>{parsedTaskLocation}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Accepted:</Text>
                <Text style={styles.infoValue}>{formatDate(acceptedDate)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Completed:</Text>
                <Text style={styles.infoValue}>{formatDate(completedDate)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Parties Involved */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Parties Involved</Text>
              <View style={styles.partyCard}>
                <View style={styles.partyHeader}>
                  <MaterialIcons name="person" size={20} color="#007AFF" />
                  <Text style={styles.partyRole}>Task Poster</Text>
                </View>
                <Text style={styles.partyName}>{posterName}</Text>
              </View>
              
              <View style={styles.partyCard}>
                <View style={styles.partyHeader}>
                  <MaterialIcons name="work" size={20} color="#28a745" />
                  <Text style={styles.partyRole}>Tasker</Text>
                </View>
                <Text style={styles.partyName}>{taskerName}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Payment Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Breakdown</Text>
              
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Task Amount</Text>
                <Text style={styles.paymentValue}>{formattedAmount}</Text>
              </View>
              
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Platform Fee ({serviceFeePercentage}%)</Text>
                <Text style={styles.paymentValue}>- {formattedPlatformFee}</Text>
              </View>
              
              <View style={styles.dividerLight} />
              
              {userRole === 'Tasker' ? (
                <View style={styles.paymentRow}>
                  <Text style={styles.totalLabel}>Amount Received</Text>
                  <Text style={styles.totalValue}>{formattedNetAmount}</Text>
                </View>
              ) : (
                <View style={styles.paymentRow}>
                  <Text style={styles.totalLabel}>Total Paid</Text>
                  <Text style={styles.totalValue}>{formattedAmount}</Text>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            {/* Payment Status */}
            <View style={styles.statusSection}>
              <View style={styles.statusBadge}>
                <MaterialIcons name="check-circle" size={20} color="#28a745" />
                <Text style={styles.statusText}>Payment Completed</Text>
              </View>
              <Text style={styles.statusDate}>
                Processed on {formatDate(completedDate)}
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Thank you for using MyTodoo!</Text>
              <Text style={styles.footerSubtext}>
                For support, contact us at support@mytodoo.com
              </Text>
            </View>
          </View>
        </View>

        {/* Download Button */}
        <TouchableOpacity
          style={[
            styles.downloadButton,
            isDownloading && styles.downloadButtonDisabled
          ]}
          onPress={handleDownloadReceipt}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="download-outline" size={24} color="#fff" />
              <Text style={styles.downloadButtonText}>Download Receipt</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  receiptContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  receiptHeader: {
    padding: 24,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  receiptSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  receiptBody: {
    padding: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  partyCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  partyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  partyRole: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  partyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 26,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
    marginLeft: 6,
  },
  statusDate: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  dividerLight: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});







