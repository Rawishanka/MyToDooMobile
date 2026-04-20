/**
 * 🌐 Enhanced Offline Banner
 * 
 * Beautiful, animated banner that shows at the top of every screen when offline.
 * Also shows sync progress and pending operation count when coming back online.
 * 
 * States:
 * 1. OFFLINE: Red banner with cloud-offline icon + message
 * 2. SYNCING: Blue/purple animated banner with progress
 * 3. BACK_ONLINE: Green success banner (auto-dismisses after 3s)
 * 4. PENDING: Orange badge showing pending items count
 * 5. HIDDEN: No banner (online with no pending items)
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConnectivity } from '@/src/services/offline/ConnectivityProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type BannerState = 'offline' | 'syncing' | 'back_online' | 'pending' | 'hidden';

const BRAND_BLUE = '#003399';

export function EnhancedOfflineBanner() {
  const insets = useSafeAreaInsets();
  const {
    isOnline,
    isSyncing,
    pendingCount,
    triggerSync,
    lastSyncAt,
  } = useConnectivity();

  const [bannerState, setBannerState] = useState<BannerState>('hidden');
  const [prevOnline, setPrevOnline] = useState(true);
  const [prevSyncing, setPrevSyncing] = useState(false);
  
  // Animations — start offscreen above the notch area
  const slideAnim = useRef(new Animated.Value(-(insets.top + 120))).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Shimmer animation for syncing state ────────────────────────────────
  useEffect(() => {
    if (bannerState === 'syncing') {
      const shimmer = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      );
      shimmer.start();
      return () => shimmer.stop();
    }
  }, [bannerState, shimmerAnim]);

  // ── Pulse animation for offline state ──────────────────────────────────
  useEffect(() => {
    if (bannerState === 'offline') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [bannerState, pulseAnim]);

  // ── Show / Hide banner ─────────────────────────────────────────────────
  const showBanner = useCallback(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  const hideBanner = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -(insets.top + 120),
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  // ── State machine ─────────────────────────────────────────────────────
  useEffect(() => {
    // Clear dismiss timer
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }

    if (!isOnline) {
      setBannerState('offline');
      showBanner();
      setPrevOnline(false);
      setPrevSyncing(false);
    } else if (isSyncing) {
      setBannerState('syncing');
      showBanner();
      setPrevSyncing(true);
    } else if (isOnline && !prevOnline) {
      // Just came back online
      setBannerState('back_online');
      showBanner();
      setPrevOnline(true);
      setPrevSyncing(false);
      
      // Auto-dismiss after 3 seconds
      dismissTimerRef.current = setTimeout(() => {
        if (pendingCount > 0) {
          setBannerState('pending');
        } else {
          setBannerState('hidden');
          hideBanner();
        }
      }, 3000);
    } else if (prevSyncing && !isSyncing && pendingCount === 0) {
      // Sync just finished with all items processed — show brief success
      setBannerState('back_online');
      showBanner();
      setPrevSyncing(false);
      
      // Auto-dismiss after 2 seconds
      dismissTimerRef.current = setTimeout(() => {
        setBannerState('hidden');
        hideBanner();
      }, 2000);
    } else if (pendingCount > 0 && isOnline && !isSyncing) {
      setBannerState('pending');
      showBanner();
      setPrevSyncing(false);
    } else {
      setBannerState('hidden');
      hideBanner();
      setPrevSyncing(false);
    }

    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, [isOnline, isSyncing, pendingCount, prevOnline, prevSyncing, showBanner, hideBanner]);

  // ── Render based on state ─────────────────────────────────────────────
  const renderBannerContent = () => {
    switch (bannerState) {
      case 'offline':
        return (
          <Animated.View style={[styles.bannerInner, styles.offlineBanner, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.iconContainer}>
              <Ionicons name="cloud-offline" size={20} color="#fff" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.bannerTitle}>You're Offline</Text>
              <Text style={styles.bannerSubtitle}>
                Changes will be saved locally and synced when you reconnect
              </Text>
            </View>
            <View style={styles.offlineDot} />
          </Animated.View>
        );

      case 'syncing':
        return (
          <Animated.View
            style={[
              styles.bannerInner,
              styles.syncingBanner,
              {
                opacity: shimmerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.85, 1],
                }),
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="sync" size={20} color="#fff" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.bannerTitle}>Syncing Your Changes...</Text>
              <Text style={styles.bannerSubtitle}>
                {pendingCount > 0 ? `${pendingCount} item${pendingCount > 1 ? 's' : ''} remaining` : 'Almost done...'}
              </Text>
            </View>
            <View style={styles.syncSpinner}>
              <Ionicons name="reload" size={16} color="rgba(255,255,255,0.8)" />
            </View>
          </Animated.View>
        );

      case 'back_online':
        return (
          <View style={[styles.bannerInner, styles.onlineBanner]}>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.bannerTitle}>Back Online!</Text>
              <Text style={styles.bannerSubtitle}>
                {pendingCount > 0
                  ? `Syncing ${pendingCount} pending change${pendingCount > 1 ? 's' : ''}...`
                  : 'All caught up ✓'}
              </Text>
            </View>
          </View>
        );

      case 'pending':
        return (
          <TouchableOpacity
            style={[styles.bannerInner, styles.pendingBanner]}
            onPress={() => triggerSync()}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="time" size={20} color="#fff" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.bannerTitle}>
                {pendingCount} Pending Change{pendingCount > 1 ? 's' : ''}
              </Text>
              <Text style={styles.bannerSubtitle}>Tap to sync now</Text>
            </View>
            <View style={styles.syncButton}>
              <Ionicons name="arrow-up-circle" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  if (bannerState === 'hidden') {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.bannerContainer,
        {
          paddingTop: insets.top + 4,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="auto"
    >
      {renderBannerContent()}
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
    paddingHorizontal: 12,
    paddingBottom: 2,
  },
  bannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  // ── State-specific backgrounds ─────────────────────────────────────────
  offlineBanner: {
    backgroundColor: '#E53E3E',
  },
  syncingBanner: {
    backgroundColor: BRAND_BLUE,
  },
  onlineBanner: {
    backgroundColor: '#38A169',
  },
  pendingBanner: {
    backgroundColor: '#DD6B20',
  },
  // ── Icon ───────────────────────────────────────────────────────────────
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  // ── Text ───────────────────────────────────────────────────────────────
  textContainer: {
    flex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 1,
  },
  // ── Accessories ────────────────────────────────────────────────────────
  offlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FEB2B2',
    marginLeft: 8,
  },
  syncSpinner: {
    marginLeft: 8,
  },
  syncButton: {
    marginLeft: 8,
    padding: 4,
  },
});
