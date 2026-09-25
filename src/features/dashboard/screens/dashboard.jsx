import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TaskerDashboard({ onBack }) {
  const insets = useSafeAreaInsets();
  const [currentEarnings] = useState(0);
  const [targetEarnings] = useState(880);

  const calculateProgress = () => {
    return (currentEarnings / targetEarnings) * 100;
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  const getProgressBarMarkers = () => {
    const markers = [0, 880, 2650, 5300];
    return markers.map((amount, index) => ({
      amount,
      position: (amount / 5300) * 100, // Max scale to $5,300+
      isActive: currentEarnings >= amount
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#003399" />
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Tasker Dashboard</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Current Tier Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOUR CURRENT TIER</Text>
          <View style={styles.tierCard}>
            <View style={styles.tierIconContainer}>
              <View style={styles.bronzeBadge}>
                <MaterialCommunityIcons name="medal" size={24} color="#F0A868" />
              </View>
            </View>
            <View style={styles.tierInfo}>
              <Text style={styles.tierName}>Bronze</Text>
              <Text style={styles.tierDescription}>20% service fee excl. GST</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Next Tier Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOUR NEXT TIER</Text>
          <View style={styles.tierCard}>
            <View style={styles.tierIconContainer}>
              <View style={styles.silverBadge}>
                <MaterialCommunityIcons name="trophy" size={24} color="#E2E8F0" />
                <Ionicons name="lock-closed" size={12} color="#003399" style={styles.lockIcon} />
              </View>
            </View>
            <View style={styles.tierInfo}>
              <Text style={styles.tierName}>Silver</Text>
              <Text style={styles.tierDescription}>18.5% service fee excl. GST</Text>
            </View>
          </View>
        </View>

        {/* Earnings Section */}
        <View style={styles.earningsSection}>
          <Text style={styles.earningsTitle}>Your Earnings (last 30 days)</Text>
          <View style={styles.earningsContent}>
            <Text style={styles.earningsDescription}>
              Your earnings are <Text style={styles.highlightAmount}>${targetEarnings}</Text> away from Silver and lowering service fees
            </Text>
            
            <Text style={styles.currentEarnings}>{formatCurrency(currentEarnings)}</Text>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${Math.min(calculateProgress(), 100)}%` }
                  ]} 
                />
              </View>
              
              {/* Progress Markers */}
              <View style={styles.markersContainer}>
                {getProgressBarMarkers().map((marker, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.marker, 
                      { left: `${marker.position}%` }
                    ]}
                  >
                    <View style={[
                      styles.markerDot, 
                      marker.isActive && styles.activeMarker
                    ]} />
                    <Text style={styles.markerText}>
                      {index === 0 ? '$0' : 
                       index === getProgressBarMarkers().length - 1 ? '$5,300+' : 
                       formatCurrency(marker.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* How Tiers Work Link */}
        <TouchableOpacity style={styles.infoLink}>
          <Ionicons name="help-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.infoLinkText}>How do tiers work?</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#003399',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  section: {
    backgroundColor: '#003399',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#001A66',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  tierCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierIconContainer: {
    marginRight: 16,
  },
  bronzeBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F0A868',
  },
  silverBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  lockIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 1,
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tierDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.78)',
  },
  divider: {
    height: 0,
    marginVertical: 0,
  },
  earningsSection: {
    backgroundColor: '#003399',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#001A66',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  earningsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  earningsContent: {
    alignItems: 'flex-start',
  },
  earningsDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.78)',
    marginBottom: 16,
    lineHeight: 20,
  },
  highlightAmount: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  currentEarnings: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 20, // Add margin to both ends
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 4,
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff6b35',
    borderRadius: 4,
  },
  markersContainer: {
    position: 'relative',
    height: 40,
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -10 }],
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginBottom: 4,
  },
  activeMarker: {
    backgroundColor: '#ff6b35',
  },
  markerText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '600',
  },
  infoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ff6b35',
  },
  infoLinkText: {
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '700',
  },
});
