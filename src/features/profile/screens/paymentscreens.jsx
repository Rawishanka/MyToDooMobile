import { Feather, Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getAbnStatus } from '@/src/api/abn-api';
import { useTheme } from '@/src/shared/theme';
import { IconChip, LightHeader } from '@/src/shared/components/custom_components/lightCard';
import TaskerAbnSection from '@/src/features/profile/components/TaskerAbnSection';
import { useAuthStore } from '@/src/store/auth-task-store';
import PayoutAccountScreen from './payout-account-screen';
import PayoutHistoryScreen from './payout-history-screen';
import { HS, homeCard } from '@/src/shared/theme/homeStyle';

const PaymentOptionsScreen = ({ onNavigate, onBackToAccount, focusAbn = false }) => {
  const { isDarkMode } = useTheme();
  const user = useAuthStore((state) => state.user);
  const isTasker = !!user?.notifyNewTask;
  const [abnVerified, setAbnVerified] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!isTasker) return;
    getAbnStatus()
      .then((status) => setAbnVerified(!!status.abnVerified))
      .catch(() => setAbnVerified(false));
  }, [isTasker]);

  useEffect(() => {
    if (focusAbn && scrollRef.current) {
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [focusAbn]);

  return (
  <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
    <LightHeader title="Payment options" onBack={onBackToAccount} />
    
    <ScrollView ref={scrollRef} style={[styles.content, isDarkMode && { backgroundColor: '#0B1120' }]} contentContainerStyle={styles.contentContainer}>
      {isTasker && (
        <TaskerAbnSection
          variant="compact"
          onVerified={(status) => setAbnVerified(!!status.abnVerified)}
        />
      )}

      {isTasker && !abnVerified && (
        <Text style={[styles.abnGateNote, isDarkMode && { color: '#FBBF24' }]}>
          Verify your ABN above before setting up a payment account.
        </Text>
      )}

      <TouchableOpacity 
        style={[
          styles.menuItem,
          isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
          isTasker && !abnVerified && styles.menuItemDisabled
        ]}
        activeOpacity={0.8}
        onPress={() => onNavigate('payoutAccount')}
        disabled={isTasker && !abnVerified}
      >
        <IconChip name="card-outline" style={{ marginRight: 12 }} />
        <Text style={[
          styles.menuText,
          isDarkMode && { color: '#F8FAFC' },
          isTasker && !abnVerified && styles.menuTextDisabled
        ]}>
          Setup Payout Account
        </Text>
        <Ionicons name="chevron-forward" size={20} color={isDarkMode ? (isTasker && !abnVerified ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)') : (isTasker && !abnVerified ? HS.placeholder : HS.muted)} />
      </TouchableOpacity>
    </ScrollView>
  </View>
  );
};

const PaymentHistoryScreen = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('earned');

  return (
    <View style={styles.container}>
      <LightHeader title="Payment history" onBack={() => onNavigate('paymentOptions')} />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'earned' && styles.activeTab]}
          onPress={() => setActiveTab('earned')}
        >
          <Text style={[styles.tabText, activeTab === 'earned' && styles.activeTabText]}>
            Earned
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'outgoing' && styles.activeTab]}
          onPress={() => setActiveTab('outgoing')}
        >
          <Text style={[styles.tabText, activeTab === 'outgoing' && styles.activeTabText]}>
            Outgoing
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'earned' ? (
          <>
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color={HS.amberText} style={styles.warningIcon} />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>You have remaining fees</Text>
                <Text style={styles.warningText}>
                  The remaining Cancellation fees of $47.85 will be deducted in your next payment payout(s). 
                  <Text style={styles.linkText}> See fees</Text>
                </Text>
              </View>
            </View>

            <View style={styles.filterContainer}>
              <View style={styles.filterRow}>
                <TouchableOpacity style={styles.filterButton}>
                  <Feather name="calendar" size={16} color="#003399" />
                  <Text style={styles.filterText}>All time</Text>
                  <Ionicons name="chevron-down" size={16} color="#003399" />
                </TouchableOpacity>
                <View style={styles.spacer} />
                <Text style={styles.filterLabel}>Cancellation Fees</Text>
                <TouchableOpacity style={styles.infoButton}>
                  <Ionicons name="information-circle-outline" size={16} color={HS.muted} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.transactionCount}>5 transactions for 17 Feb 2019 - 11 Aug 2025</Text>

            <View style={styles.earningsContainer}>
              <Text style={styles.earningsLabel}>Net earnings</Text>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsAmount}>A$1,127.87</Text>
                <TouchableOpacity style={styles.downloadButton}>
                  <Ionicons name="download-outline" size={20} color={HS.blue} />
                  <Text style={styles.downloadText}>CSV file</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.transactionItem}>
              <View style={styles.transactionHeader}>
                <Text style={styles.transactionDate}>10 Jan 2025</Text>
                <Text style={styles.creditedText}>Credited</Text>
              </View>
              <Text style={styles.transactionTitle}>Folding arm awning needs reset</Text>
              <Text style={styles.transactionAmount}>A$238.95</Text>
              <Text style={styles.transactionPoster}>Posted by Jane F</Text>
            </View>

            <View style={styles.transactionItem}>
              <View style={styles.transactionHeader}>
                <Text style={styles.transactionDate}>9 Jan 2025</Text>
                <Text style={styles.creditedText}>Credited</Text>
              </View>
              <Text style={styles.transactionTitle}>Looking for someone who could maintain the garden in weekly basis</Text>
              <Text style={styles.transactionAmount}>A$339.83</Text>
              <Text style={styles.transactionPoster}>Posted by Ruka W.</Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color={HS.amberText} style={styles.warningIcon} />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>You have remaining fees</Text>
                <Text style={styles.warningText}>
                  The remaining Cancellation fees of $47.85 will be deducted in your next payment payout(s). 
                  <Text style={styles.linkText}> See fees</Text>
                </Text>
              </View>
            </View>

            <View style={styles.filterContainer}>
              <View style={styles.filterRow}>
                <TouchableOpacity style={styles.filterButton}>
                  <Feather name="calendar" size={16} color="#003399" />
                  <Text style={styles.filterText}>All time</Text>
                  <Ionicons name="chevron-down" size={16} color="#003399" />
                </TouchableOpacity>
                <View style={styles.spacer} />
                <Text style={styles.filterLabel}>Cancellation Fees</Text>
                <TouchableOpacity style={styles.infoButton}>
                  <Ionicons name="information-circle-outline" size={16} color={HS.muted} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No outgoing payments found</Text>
            </View>
          </View>
        )}
      </ScrollView>
      
    </View>
  );
};

const PaymentMethodsScreen = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('make');

  return (
    <View style={styles.container}>
      <LightHeader title="Edit payment methods" onBack={() => onNavigate('paymentOptions')} />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'make' && styles.activeTab]}
          onPress={() => setActiveTab('make')}
        >
          <Text style={[styles.tabText, activeTab === 'make' && styles.activeTabText]}>
            Make payments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'receive' && styles.activeTab]}
          onPress={() => setActiveTab('receive')}
        >
          <Text style={[styles.tabText, activeTab === 'receive' && styles.activeTabText]}>
            Receive payments
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'make' ? (
          <TouchableOpacity style={styles.addPaymentMethod}>
            <IconChip name="add-circle-outline" style={{ marginRight: 12 }} />
            <Text style={styles.addPaymentText}>Add credit card</Text>
            <Ionicons name="chevron-forward" size={20} color={HS.muted} />
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.paymentMethodItem}>
              <IconChip name="location-outline" />
              <View style={styles.paymentMethodContent}>
                <Text style={styles.addressText}>6 Balcombe Court, Narre Warren,</Text>
                <Text style={styles.addressText}>Victoria, 3805, Australia</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={HS.muted} />
            </View>
            
            <View style={styles.paymentMethodItem}>
              <IconChip name="card-outline" />
              <View style={styles.paymentMethodContent}>
                <Text style={styles.cardText}>••••4183</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={HS.muted} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const PaymentScreensApp = ({ onBackToAccount, focusAbn = false }) => {
  const [currentScreen, setCurrentScreen] = useState('paymentOptions');

  const navigateToScreen = (screen) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'paymentOptions':
        return (
          <PaymentOptionsScreen 
            onNavigate={navigateToScreen} 
            onBackToAccount={onBackToAccount}
            focusAbn={focusAbn}
          />
        );
      case 'paymentHistory':
        return <PaymentHistoryScreen onNavigate={navigateToScreen} />;
      case 'paymentMethods':
        return <PaymentMethodsScreen onNavigate={navigateToScreen} />;
      case 'payoutAccount':
        return <PayoutAccountScreen navigation={{ goBack: () => navigateToScreen('paymentOptions') }} />;
      case 'payoutHistory':
        return <PayoutHistoryScreen onNavigate={navigateToScreen} />;
      default:
        return (
          <PaymentOptionsScreen 
            onNavigate={navigateToScreen} 
            onBackToAccount={onBackToAccount}
            focusAbn={focusAbn}
          />
        );
    }
  };

  return renderScreen();
};

export default PaymentScreensApp;

const CARD = { ...homeCard };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HS.page,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  abnGateNote: {
    fontSize: 13,
    color: HS.amberText,
    marginBottom: 14,
    lineHeight: 18,
  },
  menuItemDisabled: {
    opacity: 0.55,
  },
  menuTextDisabled: {
    color: HS.muted,
  },
  menuItem: {
    ...CARD,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: HS.navy,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: HS.tint,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 4,
  },
  tab: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: HS.blue,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: HS.muted,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  warningBox: {
    ...CARD,
    flexDirection: 'row',
    backgroundColor: HS.amberBg,
    borderColor: '#FCD34D',
    padding: 16,
    marginTop: 16,
    borderRadius: 14,
    shadowOpacity: 0,
    elevation: 0,
  },
  warningIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: HS.navy,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: HS.muted,
    lineHeight: 20,
  },
  linkText: {
    color: HS.blue,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  filterContainer: {
    marginTop: 20,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: HS.inputBorder,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },
  filterText: {
    color: '#003399',
    marginLeft: 6,
    marginRight: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    color: HS.muted,
    marginRight: 4,
  },
  infoButton: {
    padding: 2,
  },
  transactionCount: {
    fontSize: 12,
    color: HS.muted,
    marginTop: 16,
  },
  earningsContainer: {
    ...CARD,
    marginTop: 14,
    marginBottom: 14,
    padding: 16,
  },
  earningsLabel: {
    fontSize: 13,
    color: HS.muted,
    marginBottom: 8,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: HS.navy,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  downloadText: {
    color: HS.blue,
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  transactionItem: {
    ...CARD,
    padding: 16,
    marginBottom: 14,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionDate: {
    fontSize: 13,
    color: HS.muted,
  },
  creditedText: {
    fontSize: 12,
    color: HS.greenText,
    fontWeight: '700',
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HS.navy,
    marginBottom: 8,
    lineHeight: 21,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: HS.navy,
    marginBottom: 4,
  },
  transactionPoster: {
    fontSize: 13,
    color: HS.muted,
  },
  addPaymentMethod: {
    ...CARD,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginTop: 16,
  },
  addPaymentText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: HS.navy,
  },
  paymentMethodItem: {
    ...CARD,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginTop: 14,
  },
  paymentMethodContent: {
    flex: 1,
    marginLeft: 12,
  },
  addressText: {
    fontSize: 15,
    color: HS.navy,
    lineHeight: 20,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: HS.navy,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: HS.muted,
    textAlign: 'center',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navText: {
    fontSize: 10,
    color: HS.navy,
    marginTop: 2,
  },
});
