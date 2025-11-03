import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TaskerDashboard({ onBack }) {
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
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#003366" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Tasker Dashboard</Text>
      </View>

      <View style={styles.content}>
        {/* Current Tier Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOUR CURRENT TIER</Text>
          <View style={styles.tierCard}>
            <View style={styles.tierIconContainer}>
              <View style={styles.bronzeBadge}>
                <MaterialCommunityIcons name="medal" size={24} color="#CD7F32" />
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
                <MaterialCommunityIcons name="trophy" size={24} color="#C0C0C0" />
                <Ionicons name="lock-closed" size={12} color="#666" style={styles.lockIcon} />
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
          <Ionicons name="help-circle-outline" size={20} color="#0052A2" />
          <Text style={styles.infoLinkText}>How do tiers work?</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#003366',
    marginLeft: 12,
  },
  content: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 15,
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
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#CD7F32',
  },
  silverBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C0C0C0',
    position: 'relative',
  },
  lockIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 1,
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#003366',
    marginBottom: 4,
  },
  tierDescription: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 0,
  },
  earningsSection: {
    paddingVertical: 30,
  },
  earningsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003366',
    marginBottom: 16,
  },
  earningsContent: {
    alignItems: 'flex-start',
  },
  earningsDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  highlightAmount: {
    fontWeight: '600',
    color: '#003366',
  },
  currentEarnings: {
    fontSize: 32,
    fontWeight: '300',
    color: '#003366',
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 20, // Add margin to both ends
  },
  progressBar: {
    height: 8, // Increased thickness from 4 to 8
    backgroundColor: '#E0E0E0',
    borderRadius: 4, // Updated border radius to match new height
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0052A2',
    borderRadius: 4, // Updated border radius to match new height
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
    backgroundColor: '#E0E0E0',
    marginBottom: 4,
  },
  activeMarker: {
    backgroundColor: '#0052A2',
  },
  markerText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  infoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLinkText: {
    fontSize: 15,
    color: '#0052A2',
    marginLeft: 8,
    fontWeight: '500',
  },
});