import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { useGetTaskOffers } from '@/src/shared/hooks/useTaskApi';
import { formatCurrency, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { ErrorState, LoadingState } from '../../components/shared';
import EmptyOffersState from './components/EmptyOffersState';
import OfferCard from './components/OfferCard';
import TaskSummaryHeader from './components/TaskSummaryHeader';

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
  const displayBudget = task?.formattedBudget || 
    (task?.budget ? formatCurrency(task.budget, currencyInfo) : 
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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#000" />
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
      <TaskSummaryHeader
        title={task.title}
        budget={displayBudget}
        offerCount={task.offerCount || offers.length}
      />

      {/* Offers List */}
      {offers.length === 0 ? (
        <EmptyOffersState onRefresh={refetch} />
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item._id}
          renderItem={renderOffer}
          contentContainerStyle={{ paddingBottom: 20 }}
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backIcon: {
    padding: 5,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    width: 34,
  },
});