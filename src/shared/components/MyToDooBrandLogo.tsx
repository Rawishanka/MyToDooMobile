import React, { useMemo } from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { isTablet, RFValue } from '@/src/shared/utils/responsive';

/** Primary app brand blue — used by screens behind the transparent logo */
export const MYTDOO_BRAND_BLUE = '#004aad';

const LOGO_SOURCE = require('@/assets/images/MyToDoo_animated_brand_logo.gif');

/** Transparent brand icon GIF — native ratio ~2036×1018 (≈2:1) */
const LOGO_ASPECT = 2;

export type MyToDooLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';

const BASE_HEIGHT: Record<MyToDooLogoSize, number> = {
  xs: 36,
  sm: 48,
  md: 64,
  lg: 80,
  xl: 96,
  hero: 120,
};

export interface MyToDooBrandLogoProps {
  /** Preset size — ignored when `width` is provided */
  size?: MyToDooLogoSize;
  width?: number;
  height?: number;
  /** Transparent by default — icon GIF has no background */
  backgroundColor?: string;
  /** Rounded card wrapper — use on white/light screens */
  card?: boolean;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

export default function MyToDooBrandLogo({
  size = 'md',
  width,
  height,
  backgroundColor = 'transparent',
  card = false,
  style,
  imageStyle,
}: MyToDooBrandLogoProps) {
  const dimensions = useMemo(() => {
    if (width != null) {
      const h = height ?? Math.round(width / LOGO_ASPECT);
      return { width, height: h };
    }
    const baseHeight = RFValue(BASE_HEIGHT[size]) * (isTablet ? 1.15 : 1);
    return {
      width: Math.round(baseHeight * LOGO_ASPECT),
      height: Math.round(baseHeight),
    };
  }, [size, width, height]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor, width: dimensions.width, height: dimensions.height },
        card && styles.card,
        style,
      ]}
    >
      <Image
        source={LOGO_SOURCE}
        style={[styles.image, imageStyle]}
        resizeMode="contain"
        accessibilityLabel="MyToDoo logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  card: {
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
