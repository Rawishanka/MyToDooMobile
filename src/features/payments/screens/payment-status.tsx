import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    FlatList,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Components
import {
    PaymentCard,
    PaymentEmptyState,
    PaymentErrorState,
    PaymentLoadingState,
    PaymentSummary,
} from './status/components';

// Hooks
import { usePaymentStatus } from './status/hooks';
import { BRAND_BLUE, CARD_TEXT } from '@/src/shared/theme/brandColors';
import { RFValue } from '@/src/shared/utils/responsive';
import { BlueBackdrop } from '@/src/shared/components/custom_components/lightCard';
import { useTheme } from '@/src/shared/theme';

export default function PaymentStatusScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  const {
    payments,
    isLoading,
    error,
    refetch,
    formatDate,
    getStatusColor,
    getStatusIcon,
  } = usePaymentStatus();

  // Loading state
  if (isLoading) {
    return <PaymentLoadingState />;
  }

  // Error state
  if (error) {
    return <PaymentErrorState onRetry={refetch} onBack={() => router.back()} />;
  }

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <BlueBackdrop />
      <StatusBar barStyle="light-content" backgroundColor={BRAND_BLUE} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="chevron-back" size={22} color={CARD_TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Status</Text>
        <TouchableOpacity style={styles.helpIcon}>
          <Ionicons
            name="help-circle-outline"
            size={20}
            color={CARD_TEXT}
            onPress={() => {
              Alert.alert(
                'Payment Help',
                'This screen shows all your payment transactions for completed tasks. Contact support if you have any payment issues.',
                [{ text: 'OK' }]
              );
            }}
          />
        </TouchableOpacity>
      </View>

      {/* Payment Summary */}
      {payments.length > 0 && <PaymentSummary payments={payments} />}

      {/* Payment List */}
      {payments.length === 0 ? (
        <PaymentEmptyState />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PaymentCard
              payment={item}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={refetch}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: 'transparent',
  },
  backIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CARD_TEXT,
  },
  helpIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 100,
  },
});
