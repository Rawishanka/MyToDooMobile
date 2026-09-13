/**
 * Responsive utilities for adaptive UI across all devices
 * Supports phones, tablets, foldables, and different orientations
 * Expo-compatible version without react-native-device-info
 *
 * FONT SCALING STRATEGY (Facebook/Twitter style):
 * - Base design width: 375dp (iPhone SE / 12 mini)
 * - Scale fonts based on SCREEN WIDTH (not height)
 * - Cap scale at 1.15x for tablets so text stays readable but NOT oversized
 * - This prevents RFValue's height-based 2x scaling on tablets
 *
 * ORIENTATION STRATEGY:
 * - hp() always uses max(width, height) as base → spacing stable in all orientations
 * - wp() always uses min(width, height) as base → horizontal spacing stays phone-consistent
 * - StyleSheet.create() at module level computes hp/wp once — this override ensures
 *   the values are portrait-equivalent even when app opens in landscape
 */
import { Dimensions, PixelRatio, Platform } from 'react-native';
import {
    heightPercentageToDP as _hp,
    widthPercentageToDP as _wp,
} from 'react-native-responsive-screen';

// ─── Orientation-Safe hp() / wp() ─────────────────────────────────
// hp() — always uses the LONGER dimension as the reference height.
//   Portrait: max(844, 390) = 844 → same as before ✅
//   Landscape: max(390, 844) = 844 → same stable value ✅
//   Prevents: spacing from collapsing in landscape (e.g., paddingBottom
//   hp('12%') stays at ~100dp instead of dropping to 47dp and letting
//   content slide behind the floating tab bar)
export const hp = (percentage: string | number): number => {
  const { width, height } = Dimensions.get('window');
  const pct = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
  const baseHeight = Math.max(width, height); // always portrait-equivalent
  return (pct / 100) * baseHeight;
};

// wp() — always uses the SHORTER dimension as the reference width.
//   Portrait: min(390, 844) = 390 → same as before ✅
//   Landscape: min(844, 390) = 390 → consistent horizontal spacing ✅
//   Prevents: wp('80%') from producing 675dp in landscape (way too wide)
export const wp = (percentage: string | number): number => {
  const { width, height } = Dimensions.get('window');
  const pct = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
  const baseWidth = Math.min(width, height); // always portrait-equivalent
  return (pct / 100) * baseWidth;
};

// The original functions (kept as escape hatch for true screen-relative values)
export { _hp as hpRaw, _wp as wpRaw };
// The original RFValue is kept as _RFValueOriginal for reference.
export { RFValue as _RFValueOriginal } from 'react-native-responsive-fontsize';

// ─── Tab Bar Clearance ─────────────────────────────────────────────
// Use this for FlatList/ScrollView contentContainerStyle.paddingBottom
// to ensure content is never hidden behind the floating tab bar.
// Value: pill height (~66dp) + safe area insets (~34dp) + buffer (~10dp)
export const TAB_BAR_CLEARANCE = 110;

/** Max content width for forms on tablet — keeps phone-sized UI centered */
export const FORM_MAX_WIDTH = 480;

/** Read current window size (handles rotation / split view) */
export const getIsTablet = (): boolean => {
  const { width, height } = Dimensions.get('window');
  const shortSide = Math.min(width, height);
  const aspectRatio = Math.max(width, height) / shortSide;
  if (Platform.OS === 'ios') {
    return shortSide >= 768 || (shortSide >= 600 && aspectRatio < 1.6);
  }
  return shortSide >= 600;
};

// ─── Professional Responsive Font Scale ───────────────────────────
// Width-based font scaling with tablet cap.
// On a 375dp phone:  rf(14) = 14
// On a 414dp phone:  rf(14) ≈ 15  (+7%)
// On a 600dp tablet: rf(14) = 16  (capped at 1.15x → 16.1 → 16)
// On a 900dp tablet: rf(14) = 16  (still capped at 1.15x)
// This is the same approach used by Facebook, Instagram, etc.
const BASE_DESIGN_WIDTH = 375;

export const rf = (size: number): number => {
  const { width } = Dimensions.get('window');
  let scale = width / BASE_DESIGN_WIDTH;
  // Cap maximum scale at 1.15x — prevents huge fonts on tablets
  scale = Math.min(scale, 1.15);
  // Floor minimum at 0.85x — prevents tiny fonts on very small phones
  scale = Math.max(scale, 0.85);
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

// RFValue is shadowed with rf() — width-based, tablet-capped scaling.
// All 160+ screens import RFValue from this file, so this one change fixes them all.
// Previously the original RFValue caused 2x font inflation on tablets (height-based).
export const RFValue = rf;

// Hook version for orientation-aware scaling (use inside React components)
export const useRf = () => {
  return { rf };
};

// Device type detection (Expo-compatible)
// Tablets typically have screen width > 600dp
const { width, height } = Dimensions.get('window');
const aspectRatio = height / width;

export const isTablet = (() => {
  // iPad mini has width 768, most tablets > 600
  // Also check aspect ratio as tablets are typically less tall
  if (Platform.OS === 'ios') {
    return width >= 768 || (width >= 600 && aspectRatio < 1.6);
  }
  // Android tablets
  return width >= 600;
})();
export const isSmallDevice = () => {
  const { width, height } = Dimensions.get('window');
  return width < 375 || height < 667;
};

export const isLargeDevice = () => {
  const { width } = Dimensions.get('window');
  return width > 768;
};

// Responsive dimensions
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Get responsive value based on device type
export const getResponsiveValue = (
  phoneValue: number,
  tabletValue: number,
  largeTabletValue?: number
): number => {
  if (isTablet) {
    if (largeTabletValue && SCREEN_WIDTH > 1024) {
      return largeTabletValue;
    }
    return tabletValue;
  }
  return phoneValue;
};

// Responsive spacing utilities
export const responsiveSpacing = {
  xs: getResponsiveValue(4, 6, 8),
  sm: getResponsiveValue(8, 12, 16),
  md: getResponsiveValue(12, 16, 20),
  base: getResponsiveValue(16, 20, 24),
  lg: getResponsiveValue(20, 28, 32),
  xl: getResponsiveValue(24, 32, 40),
  '2xl': getResponsiveValue(32, 40, 48),
  '3xl': getResponsiveValue(40, 52, 64),
};

// Responsive font sizes — uses rf() (width-based, tablet-capped)
export const responsiveFontSize = {
  xs: rf(10),
  sm: rf(12),
  base: rf(14),
  md: rf(16),
  lg: rf(18),
  xl: rf(20),
  '2xl': rf(24),
  '3xl': rf(30),
  '4xl': rf(36),
};

// Normalize size for different pixel densities
export const normalize = (size: number): number => {
  const scale = SCREEN_WIDTH / 375; // Base on iPhone 11/X width
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Check if device is in landscape mode
export const isLandscape = () => {
  const { width, height } = Dimensions.get('window');
  return width > height;
};

// Get layout columns based on device
export const getLayoutColumns = (): number => {
  if (isTablet) {
    return isLandscape() ? 3 : 2;
  }
  return 1;
};

// Responsive card width
export const getCardWidth = (): string => {
  const columns = getLayoutColumns();
  if (columns === 1) return '100%';
  if (columns === 2) return '48%';
  return '31%';
};

// Safe area adjustments
export const getSafeAreaPadding = () => ({
  top: Platform.OS === 'ios' ? hp('2%') : hp('1%'),
  bottom: Platform.OS === 'ios' ? hp('2%') : hp('1%'),
});

export default {
  wp,
  hp,
  rf,
  RFValue,
  isTablet,
  isSmallDevice,
  isLargeDevice,
  getResponsiveValue,
  responsiveSpacing,
  responsiveFontSize,
  normalize,
  isLandscape,
  getLayoutColumns,
  getCardWidth,
  getSafeAreaPadding,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
};
