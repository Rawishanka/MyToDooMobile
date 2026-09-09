import MyToDooLogo from '@/assets/images/MyToDoo_logo.svg';
import { isTablet } from '@/src/shared/utils/responsive';
import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

/** Dark blue box behind SVG — matches login / auth screens */
export const MYTDOO_LOGO_BOX_BLUE = '#0a2d5c';

export type MyToDooSvgLogoBoxVariant = 'splash' | 'auth' | 'receipt';

export interface MyToDooSvgLogoBoxProps {
  variant?: MyToDooSvgLogoBoxVariant;
  style?: StyleProp<ViewStyle>;
}

export default function MyToDooSvgLogoBox({
  variant = 'splash',
  style,
}: MyToDooSvgLogoBoxProps) {
  const dimensions = useMemo(() => {
    if (variant === 'auth') {
      return {
        logo: 50,
        padding: 12,
        radius: 16,
        borderWidth: 0,
        borderColor: 'transparent',
        backgroundColor: MYTDOO_LOGO_BOX_BLUE,
      };
    }
    if (variant === 'receipt') {
      return {
        logo: 48,
        padding: 10,
        radius: 14,
        borderWidth: 0,
        borderColor: 'transparent',
        backgroundColor: '#ffffff',
      };
    }
    return {
      logo: isTablet ? 96 : 84,
      padding: isTablet ? 28 : 22,
      radius: isTablet ? 34 : 28,
      borderWidth: 3,
      borderColor: 'rgba(255, 255, 255, 0.6)',
      backgroundColor: MYTDOO_LOGO_BOX_BLUE,
    };
  }, [variant]);

  return (
    <View
      style={[
        styles.box,
        {
          backgroundColor: dimensions.backgroundColor,
          borderRadius: dimensions.radius,
          padding: dimensions.padding,
          borderWidth: dimensions.borderWidth,
          borderColor: dimensions.borderColor,
        },
        style,
      ]}
    >
      <MyToDooLogo width={dimensions.logo} height={dimensions.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
