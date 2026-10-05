import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { useGetTaskOffers } from '@/src/shared/hooks/useTaskApi';
import { formatCurrency, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';
import { resolveTaskBudget } from '@/src/shared/utils/resolveTaskBudget';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    FlatList,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState, LoadingState } from '../../components/shared';
import EmptyOffersState from './components/EmptyOffersState';
import OfferCard from './components/OfferCard';
import TaskSummaryHeader from './components/TaskSummaryHeader';
import { BRAND_BLUE, CARD_DIVIDER, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
import { RFValue } from '@/src/shared/utils/responsive';
import { BlueBackdrop } from '@/src/shared/components/custom_components/lightCard';

interface Offer {
  _id: string;
  taskId: string;
  taskTakerId: {
    _id: string;
    firstName: string;
    lastName: string;
    rating?: number;
  };
  offer: {
    amount: number;
    currency: string;
    message: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export default function TaskOffersScreen() {
  const router = useRouter();
  const { taskId, taskTitle } = useLocalSearchParams<{ taskId: string; taskTitle?: string }>();

  const {
    data: offersData,
    isLoading,
    error,
    refetch
  } = useGetTaskOffers(taskId || '', !!taskId);

  const task = offersData?.data;
  const offers = (task?.offers || []).map((offer: any) => ({
    ...offer,
    status: offer.status as 'pending' | 'accepted' | 'rejected'
  }));

  // Use user's current location for currency display (auto geo-location)
  const { countryInfo } = useLocationCountry();
  const currencyInfo = getCurrencyFromUserLocation(countryInfo || { currency: 'AUD' });
  
  // Format budget with location-appropriate currency
  const taskBudget = resolveTaskBudget(task);
  const displayBudget = task?.formattedBudget || 
    (taskBudget ? formatCurrency(taskBudget, currencyInfo) : 
    task?.budgetInfo?.amount ? `${task.budgetInfo.currency}${task.budgetInfo.amount}` : 
    'Budget not specified');

  if (isLoading) {
    return <LoadingState message="Loading offers..." />;
  }

  if (error || !task) {
    return (
      <ErrorState
        title="Failed to load offers"
        subtitle="Could not load offers for this task. Please check your connection and try again."
        onRetry={refetch}
        onGoBack={() => router.back()}
      />
    );
  }

  const renderOffer = ({ item }: { item: Offer }) => (
    <OfferCard offer={item} />
  );

  return (
    <View style={styles.container}>
      <BlueBackdrop />
      <StatusBar barStyle="light-content" backgroundColor={BRAND_BLUE} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="chevron-back" size={22} color={CARD_TEXT} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Offers</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {taskTitle || task.title}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Task Summary */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      <TaskSummaryHeader
        title={task.title}
        budget={displayBudget}
        offerCount={task.offerCount || offers.length}
      />
      </View>

      {/* Offers List */}
      {offers.length === 0 ? (
        <EmptyOffersState onRefresh={refetch} />
      ) : (
        <FlatList keyboardShouldPersistTaps="handled"
          data={offers}
          keyExtractor={(item) => item._id}
          renderItem={renderOffer}
          contentContainerStyle={{ paddingTop: 2, paddingBottom: 24 }}
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
    backgroundColor: '#003399',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 14,
  },
  backIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CARD_TEXT,
  },
  headerSubtitle: {
    fontSize: RFValue(12),
    color: CARD_TEXT_MUTED,
    marginTop: 2,
  },
  headerRight: {
    width: 36,
  },
});