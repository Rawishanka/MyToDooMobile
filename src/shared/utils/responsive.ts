/**
 * Responsive utilities for adaptive UI across all devices
 * Supports phones, tablets, foldables, and different orientations
 * Expo-compatible version without react-native-device-info
 */
import { Dimensions, PixelRatio, Platform } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

// Re-export for convenience
export { hp, RFValue, wp };

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

// Responsive font sizes
export const responsiveFontSize = {
  xs: RFValue(10),
  sm: RFValue(12),
  base: RFValue(14),
  md: RFValue(16),
  lg: RFValue(18),
  xl: RFValue(20),
  '2xl': RFValue(24),
  '3xl': RFValue(30),
  '4xl': RFValue(36),
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
