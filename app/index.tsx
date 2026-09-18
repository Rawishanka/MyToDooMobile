import FallingStars from '@/src/shared/components/FallingStars';
import MyToDooBrandLogo, { MYTDOO_BRAND_BLUE } from '@/src/shared/components/MyToDooBrandLogo';
import { RFValue, isTablet, wp } from '@/src/shared/utils/responsive';
import { useAuthStore } from '@/src/store/auth-task-store';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const IndexHeroVideo = require('@/assets/index_screen/mian_index.mp4');

const VIDEO_ASPECT = 16 / 9;
const LOGO_ASPECT = 2;

interface IndexLayout {
  logoWidth: number;
  videoWidth: number;
  videoHeight: number;
  contentMaxWidth: number;
  heroHeight: number;
  bottomPadding: number;
  heroPaddingTop: number;
  heroPaddingBottom: number;
  contentGap: number;
  useScroll: boolean;
  isTabletLayout: boolean;
  isTabletPortrait: boolean;
}

export default function WelcomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLandscape = width > height;
  const isTabletPortrait = isTablet && !isLandscape;
  const [isMuted, setIsMuted] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const currentAuthState = useAuthStore.getState();
      const hasLoggedInBefore = await AsyncStorage.getItem('hasLoggedInBefore');

      if (currentAuthState.isAuthenticated && currentAuthState.token) {
        if (currentAuthState.user?.isPhoneVerified === false || !currentAuthState.user?.phone) {
          console.log('⚠️ User logged in but phone is not verified - redirecting to login for 2FA');
          router.replace('/(auth)/login' as any);
          return;
        }
        router.replace('/(tabs)' as any);
        return;
      }

      if (hasLoggedInBefore === 'true') {
        router.replace('/(auth)/login' as any);
        return;
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  const player = useVideoPlayer(IndexHeroVideo, p => {
    p.loop = true;
    p.muted = false;
    p.play();
  });

  useEffect(() => {
    if (player) {
      player.muted = isMuted;
    }
  }, [isMuted, player]);

  const layout = useMemo((): IndexLayout => {
    const safeTop = insets.top;
    const safeBottom = insets.bottom;
    const bottomPadding = Math.max(safeBottom, isTablet ? 14 : 10);

    const bottomPanelHeight =
      (isTablet ? 18 : 22) +
      26 +
      12 +
      (isTablet ? 46 : 42) +
      12 +
      (isTablet ? 46 : 42) +
      bottomPadding;

    const heroHeight = Math.max(height - safeTop - bottomPanelHeight, 160);

    const contentMaxWidth = isTablet
      ? isLandscape
        ? Math.min(width * 0.62, 680)
        : Math.min(width * 0.9, 760)
      : width;

    const fitSizes = (baseLogoWidth: number, baseVideoWidth: number, maxStackHeight: number) => {
      let logoWidth = baseLogoWidth;
      let videoWidth = baseVideoWidth;
      let videoHeight = videoWidth / VIDEO_ASPECT;
      const logoHeight = logoWidth / LOGO_ASPECT;
      const stackHeight = logoHeight + videoHeight;

      if (stackHeight > maxStackHeight) {
        const scale = maxStackHeight / stackHeight;
        logoWidth *= scale;
        videoWidth *= scale;
        videoHeight = videoWidth / VIDEO_ASPECT;
      }

      return { logoWidth, videoWidth, videoHeight };
    };

    if (isTablet) {
      if (isTabletPortrait) {
        const maxStackHeight = Math.min(heroHeight * 0.52, height * 0.38);
        const baseLogo = Math.min(contentMaxWidth * 0.58, 280);
        const baseVideo = contentMaxWidth * 0.84;
        const sized = fitSizes(baseLogo, baseVideo, maxStackHeight);

        return {
          ...sized,
          contentMaxWidth,
          heroHeight,
          bottomPadding,
          heroPaddingTop: 12,
          heroPaddingBottom: 12,
          contentGap: 12,
          useScroll: true,
          isTabletLayout: true,
          isTabletPortrait: true,
        };
      }

      const maxStackHeight = heroHeight * 0.68;
      const baseLogo = Math.min(contentMaxWidth * 0.76, 340);
      const baseVideo = contentMaxWidth;
      const sized = fitSizes(baseLogo, baseVideo, maxStackHeight);

      return {
        ...sized,
        contentMaxWidth,
        heroHeight,
        bottomPadding,
        heroPaddingTop: 16,
        heroPaddingBottom: 20,
        contentGap: 0,
        useScroll: false,
        isTabletLayout: true,
        isTabletPortrait: false,
      };
    }

    const contentGap = 10;
    const logoWidth = Math.min(width * 0.85, wp('85%'));
    const videoTarget = Math.min(width * 0.92, wp('92%'));
    const maxStackHeight = heroHeight * 0.78;
    const sized = fitSizes(logoWidth, videoTarget, maxStackHeight);
    const logoHeight = sized.logoWidth / LOGO_ASPECT;

    return {
      ...sized,
      contentMaxWidth: width,
      contentGap,
      heroHeight,
      bottomPadding,
      heroPaddingTop: 12,
      heroPaddingBottom: 10,
      useScroll: heroHeight < logoHeight + sized.videoHeight + contentGap + 24,
      isTabletLayout: false,
      isTabletPortrait: false,
    };
  }, [width, height, insets.top, insets.bottom, isLandscape, isTabletPortrait]);

  if (isCheckingAuth) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: MYTDOO_BRAND_BLUE }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderHeroVideo = () => (
    <View
      style={[
        styles.heroVideoWrapper,
        { width: layout.videoWidth, height: layout.videoHeight },
      ]}
    >
      <VideoView
        player={player}
        style={styles.heroVideo}
        nativeControls={false}
        contentFit="cover"
      />
      <TouchableOpacity
        style={styles.muteButton}
        onPress={() => setIsMuted(prev => !prev)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={isMuted ? 'Unmute video sound' : 'Mute video sound'}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name={isMuted ? 'volume-mute' : 'volume-high'}
          size={isTablet ? 20 : 16}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );

  const heroSection = layout.isTabletLayout ? (
    <View
      style={[
        styles.heroSectionTablet,
        layout.isTabletPortrait && styles.heroSectionTabletPortrait,
        {
          minHeight: layout.isTabletPortrait ? undefined : layout.heroHeight,
          paddingTop: layout.heroPaddingTop,
          paddingBottom: layout.heroPaddingBottom,
        },
      ]}
    >
      <MyToDooBrandLogo width={layout.logoWidth} />
      {renderHeroVideo()}
    </View>
  ) : (
    <View
      style={[
        styles.heroSectionPhone,
        {
          minHeight: layout.heroHeight,
          paddingTop: layout.heroPaddingTop,
          paddingBottom: layout.heroPaddingBottom,
        },
      ]}
    >
      <View style={[styles.phoneHeroStack, { gap: layout.contentGap }]}>
        <MyToDooBrandLogo width={layout.logoWidth} />
        {renderHeroVideo()}
      </View>
    </View>
  );

  const bottomPanel = (
    <View
      style={[
        styles.bottomContainer,
        {
          paddingBottom: layout.bottomPadding,
          maxWidth: isTablet ? layout.contentMaxWidth : undefined,
          alignSelf: isTablet ? 'center' : 'stretch',
          marginTop: isTablet ? (isLandscape ? 8 : 0) : 0,
        },
      ]}
    >
      <Text style={styles.welcomeText}>Welcome to MyToDoo</Text>
      <Link href={'/(welcome-screen)/first-screen' as any} asChild>
        <TouchableOpacity style={styles.buttonPrimary} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </Link>
      <TouchableOpacity
        style={[styles.buttonSecondary, styles.buttonSecondaryLast]}
        activeOpacity={0.8}
        onPress={() => router.replace('/(auth)/login')}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={layout.isTabletPortrait ? ['top', 'left', 'right', 'bottom'] : ['top', 'left', 'right']}
    >
      <FallingStars />

      {layout.isTabletPortrait ? (
        <ScrollView
          style={styles.mainLayout}
          contentContainerStyle={styles.tabletPortraitScrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {heroSection}
          {bottomPanel}
        </ScrollView>
      ) : (
        <View style={styles.mainLayout}>
          {layout.useScroll ? (
            <ScrollView
              style={styles.heroScroll}
              contentContainerStyle={styles.heroScrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
              keyboardShouldPersistTaps="handled"
            >
              {heroSection}
            </ScrollView>
          ) : (
            heroSection
          )}
          {bottomPanel}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MYTDOO_BRAND_BLUE,
  },
  mainLayout: {
    flex: 1,
    justifyContent: 'space-between',
  },
  heroScroll: {
    flex: 1,
  },
  heroScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /** Tablet: evenly spread logo + video in blue area (no top gap, no bottom cluster) */
  heroSectionTablet: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    width: '100%',
  },
  heroSectionTabletPortrait: {
    flex: 0,
    justifyContent: 'center',
    gap: 12,
  },
  tabletPortraitScrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  /** Phone: logo + video centred in blue hero (tablet layout untouched) */
  heroSectionPhone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
  },
  phoneHeroStack: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: RFValue(18),
    color: '#888',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  heroVideoWrapper: {
    borderRadius: isTablet ? 20 : 16,
    overflow: 'hidden',
    backgroundColor: '#003380',
    position: 'relative',
    alignSelf: 'center',
  },
  heroVideo: {
    width: '100%',
    height: '100%',
  },
  muteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  bottomContainer: {
    width: '100%',
    backgroundColor: '#F0F0F0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: isTablet ? 18 : 22,
    paddingHorizontal: wp('5%'),
  },
  buttonPrimary: {
    backgroundColor: '#FF6B35',
    paddingVertical: isTablet ? 14 : 12,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    borderRadius: 30,
    marginBottom: 12,
  },
  buttonSecondary: {
    backgroundColor: '#4CAF50',
    paddingVertical: isTablet ? 14 : 12,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    borderRadius: 30,
  },
  buttonSecondaryLast: {
    marginBottom: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: RFValue(16),
    marginTop: 16,
    fontWeight: '500',
  },
});
