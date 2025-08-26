import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PaymentOptionsScreen = ({ onNavigate, onBackToAccount }) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={onBackToAccount}
      >
        <Ionicons name="chevron-back" size={24} color="#0052A2" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Payment options</Text>
    </View>
    
    <View style={styles.content}>
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => onNavigate('paymentHistory')}
      >
        <Text style={styles.menuText}>Payment history</Text>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => onNavigate('paymentMethods')}
      >
        <Text style={styles.menuText}>Update payment methods</Text>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>
    </View>
  </View>
);

const PaymentHistoryScreen = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('earned');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => onNavigate('paymentOptions')}
        >
          <Ionicons name="chevron-back" size={24} color="#0052A2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment history</Text>
      </View>

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
              <Ionicons name="warning" size={20} color="#FF6B35" style={styles.warningIcon} />
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
                  <Feather name="calendar" size={16} color="#0052A2" />
                  <Text style={styles.filterText}>All time</Text>
                  <Ionicons name="chevron-down" size={16} color="#0052A2" />
                </TouchableOpacity>
                <View style={styles.spacer} />
                <Text style={styles.filterLabel}>Cancellation Fees</Text>
                <TouchableOpacity style={styles.infoButton}>
                  <Ionicons name="information-circle-outline" size={16} color="#999" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.transactionCount}>5 transactions for 17 Feb 2019 - 11 Aug 2025</Text>

            <View style={styles.earningsContainer}>
              <Text style={styles.earningsLabel}>Net earnings</Text>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsAmount}>A$1,127.87</Text>
                <TouchableOpacity style={styles.downloadButton}>
                  <Ionicons name="download-outline" size={20} color="#666" />
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
              <Ionicons name="warning" size={20} color="#FF6B35" style={styles.warningIcon} />
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
                  <Feather name="calendar" size={16} color="#0052A2" />
                  <Text style={styles.filterText}>All time</Text>
                  <Ionicons name="chevron-down" size={16} color="#0052A2" />
                </TouchableOpacity>
                <View style={styles.spacer} />
                <Text style={styles.filterLabel}>Cancellation Fees</Text>
                <TouchableOpacity style={styles.infoButton}>
                  <Ionicons name="information-circle-outline" size={16} color="#999" />
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
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => onNavigate('paymentOptions')}
        >
          <Ionicons name="chevron-back" size={24} color="#0052A2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit payment methods</Text>
      </View>

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
            <Ionicons name="add-circle-outline" size={24} color="#0052A2" />
            <Text style={styles.addPaymentText}>Add credit card</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.paymentMethodItem}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <View style={styles.paymentMethodContent}>
                <Text style={styles.addressText}>6 Balcombe Court, Narre Warren,</Text>
                <Text style={styles.addressText}>Victoria, 3805, Australia</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
            
            <View style={styles.paymentMethodItem}>
              <MaterialIcons name="payment" size={20} color="#666" />
              <View style={styles.paymentMethodContent}>
                <Text style={styles.cardText}>••••4183</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const PaymentScreensApp = ({ onBackToAccount }) => {
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
          />
        );
      case 'paymentHistory':
        return <PaymentHistoryScreen onNavigate={navigateToScreen} />;
      case 'paymentMethods':
        return <PaymentMethodsScreen onNavigate={navigateToScreen} />;
      default:
        return (
          <PaymentOptionsScreen 
            onNavigate={navigateToScreen} 
            onBackToAccount={onBackToAccount}
          />
        );
    }
  };

  return renderScreen();
};

export default PaymentScreensApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0052A2',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#1a2951',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#fff3f0',
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
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
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  linkText: {
    color: '#0052A2',
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
    borderWidth: 1,
    borderColor: '#0052A2',
    borderRadius: 6,
  },
  filterText: {
    color: '#0052A2',
    marginLeft: 6,
    marginRight: 6,
    fontSize: 14,
  },
  spacer: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  infoButton: {
    padding: 2,
  },
  transactionCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 16,
  },
  earningsContainer: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  earningsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0052A2',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  downloadText: {
    color: '#666',
    marginLeft: 4,
    fontSize: 14,
  },
  transactionItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
  },
  creditedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  transactionTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  transactionPoster: {
    fontSize: 14,
    color: '#666',
  },
  addPaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 16,
  },
  addPaymentText: {
    flex: 1,
    fontSize: 16,
    color: '#0052A2',
    marginLeft: 12,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  paymentMethodContent: {
    flex: 1,
    marginLeft: 12,
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 20,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
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
    color: '#999',
    textAlign: 'center',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navText: {
    fontSize: 10,
    color: '#0052A2',
    marginTop: 2,
  },
});