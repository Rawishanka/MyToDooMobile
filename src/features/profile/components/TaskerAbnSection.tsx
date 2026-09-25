import {
  getAbnErrorMessage,
  getAbnStatus,
  submitAbn,
  type TaskerAbnStatus,
} from '@/src/api/abn-api';
import { formatAbnInput, validateAbn } from '@/src/shared/utils/abnValidation';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';
import { BRAND_BLUE, BRAND_ORANGE, CARD_BG, CARD_TEXT, CARD_TEXT_MUTED, CARD_DIVIDER, CARD_CHIP_BG } from '@/src/shared/theme/brandColors';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export interface TaskerAbnSectionProps {
  variant?: 'default' | 'compact';
  onVerified?: (status: TaskerAbnStatus) => void;
  allowUpdate?: boolean;
}

export default function TaskerAbnSection({
  variant = 'default',
  onVerified,
  allowUpdate = true,
}: TaskerAbnSectionProps) {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<TaskerAbnStatus | null>(null);
  const [abnInput, setAbnInput] = useState('');
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAbnStatus();
      setStatus(data);
      setError(null);
    } catch (err: any) {
      console.warn('Failed to load ABN status:', err);
      setError(err?.message || 'Failed to load ABN status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleSave = async () => {
    const check = validateAbn(abnInput);
    if (!check.valid) {
      Alert.alert('Invalid ABN', check.error || 'Please enter a valid ABN');
      return;
    }

    try {
      setSaving(true);
      const updated = await submitAbn(abnInput);
      setStatus(updated);
      setShowUpdateForm(false);
      setAbnInput('');
      setError(null);
      onVerified?.(updated);
      Alert.alert('Success', 'ABN verified successfully.');
    } catch (err: any) {
      Alert.alert('ABN Error', getAbnErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.card, variant === 'compact' && styles.cardCompact, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
        <ActivityIndicator color={isDarkMode ? "#38BDF8" : CARD_TEXT} />
        <Text style={styles.loadingText}>Loading ABN status...</Text>
      </View>
    );
  }

  const isVerified = !!status?.abnVerified && !showUpdateForm;

  if (isVerified && status) {
    return (
      <View style={[styles.card, variant === 'compact' && styles.cardCompact, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
        <View style={styles.verifiedHeader}>
          <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>Australian Business Number (ABN)</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
            <Text style={styles.verifiedBadgeText}>Verified</Text>
          </View>
        </View>
        <Text style={[styles.maskedAbn, isDarkMode && { color: '#F8FAFC' }]}>{status.abnMasked || `********${status.abnLast3 || ''}`}</Text>
        {(status.businessName || status.entityName) && (
          <Text style={[styles.metaText, { fontWeight: '600', color: isDarkMode ? '#38BDF8' : CARD_TEXT, marginTop: 2 }]}>
            {status.businessName || status.entityName}
          </Text>
        )}
        {status.abnVerifiedAt && (
          <Text style={styles.metaText}>
            Verified {new Date(status.abnVerifiedAt).toLocaleDateString('en-AU')}{' '}
            {status.verificationMethod === 'abr_api' ? '(ABR Verified)' : '(manual validation)'}
          </Text>
        )}
        {allowUpdate && (
          <TouchableOpacity style={styles.linkButton} onPress={() => setShowUpdateForm(true)}>
            <Text style={[styles.linkButtonText, isDarkMode && { color: '#38BDF8' }]}>Update ABN</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.card, variant === 'compact' && styles.cardCompact, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
      <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>Australian Business Number (ABN)</Text>
      <Text style={[styles.description, isDarkMode && { color: '#94A3B8' }]}>
        Verify your ABN before setting up payouts. Required before payment can be released.
      </Text>
      <TextInput
        style={[
          styles.input,
          isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }
        ]}
        value={abnInput}
        onChangeText={(text) => setAbnInput(formatAbnInput(text))}
        placeholder="XX XXX XXX XXX"
        placeholderTextColor={isDarkMode ? '#64748B' : '#999'}
        keyboardType="number-pad"
        maxLength={14}
        autoCorrect={false}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.primaryButton, saving && styles.primaryButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Verify & Save ABN</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CARD_DIVIDER,
  },
  cardCompact: {
    marginBottom: 12,
    padding: 14,
  },
  loadingText: {
    marginTop: 8,
    fontSize: RFValue(13),
    color: CARD_TEXT_MUTED,
    textAlign: 'center',
  },
  title: {
    fontSize: RFValue(15),
    fontWeight: '600',
    color: CARD_TEXT,
    marginBottom: 6,
  },
  description: {
    fontSize: RFValue(13),
    color: CARD_TEXT_MUTED,
    lineHeight: RFValue(18),
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: RFValue(15),
    color: '#111827',
    backgroundColor: '#f9fafb',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: BRAND_ORANGE,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: RFValue(14),
    fontWeight: '600',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: RFValue(12),
    marginBottom: 8,
  },
  verifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedBadgeText: {
    color: '#16a34a',
    fontSize: RFValue(11),
    fontWeight: '600',
  },
  maskedAbn: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: CARD_TEXT,
    letterSpacing: 1,
    marginBottom: 4,
  },
  metaText: {
    fontSize: RFValue(12),
    color: CARD_TEXT_MUTED,
  },
  linkButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  linkButtonText: {
    color: CARD_TEXT,
    fontSize: RFValue(13),
    fontWeight: '600',
  },
});
