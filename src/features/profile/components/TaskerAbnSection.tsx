import {
  getAbnErrorMessage,
  getAbnStatus,
  submitAbn,
  type TaskerAbnStatus,
} from '@/src/api/abn-api';
import { formatAbnInput, validateAbn } from '@/src/shared/utils/abnValidation';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AppLoader from '@/src/shared/components/AppLoader';

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
        <AppLoader color={isDarkMode ? '#38BDF8' : '#FFFFFF'} size={22} />
        <Text style={[styles.loadingText, isDarkMode && { color: '#94A3B8' }]}>Loading ABN status...</Text>
      </View>
    );
  }

  const isVerified = !!status?.abnVerified && !showUpdateForm;

  if (isVerified && status) {
    return (
      <View style={[styles.card, variant === 'compact' && styles.cardCompact, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
        <View style={styles.verifiedHeader}>
          <Text style={[styles.title, styles.titleFlex, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={2}>Australian Business Number (ABN)</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#4ADE80" />
            <Text style={styles.verifiedBadgeText}>Verified</Text>
          </View>
        </View>
        <Text style={[styles.maskedAbn, isDarkMode && { color: '#F8FAFC' }]}>{status.abnMasked || `********${status.abnLast3 || ''}`}</Text>
        {(status.businessName || status.entityName) && (
          <Text style={[styles.metaText, { fontWeight: '600', color: isDarkMode ? '#38BDF8' : '#FFFFFF', marginTop: 2 }]}>
            {status.businessName || status.entityName}
          </Text>
        )}
        {status.abnVerifiedAt && (
          <Text style={[styles.metaText, isDarkMode && { color: '#94A3B8' }]}>
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
        placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
        keyboardType="number-pad"
        maxLength={14}
        autoCorrect={false}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.primaryButton, saving && styles.primaryButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.85}
      >
        {saving ? (
          <AppLoader color="#fff" size={22} />
        ) : (
          <Text style={styles.primaryButtonText}>Verify & Save ABN</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#00114D',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
  cardCompact: {
    marginBottom: 14,
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: RFValue(13),
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  titleFlex: {
    flex: 1,
    marginRight: 10,
    marginBottom: 0,
  },
  description: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 19,
    marginBottom: 14,
  },
  input: {
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff6b35',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    marginBottom: 8,
  },
  verifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(74,222,128,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedBadgeText: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: '700',
  },
  maskedAbn: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
  linkButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  linkButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
