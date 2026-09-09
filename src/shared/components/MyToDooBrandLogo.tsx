import React from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type LogoSize = 'sm' | 'md' | 'lg';

const SIZES: Record<LogoSize, { width: number; height: number }> = {
  sm: { width: 120, height: 40 },
  md: { width: 160, height: 54 },
  lg: { width: 220, height: 72 },
};

type Props = {
  size?: LogoSize;
  style?: StyleProp<ViewStyle>;
};

/**
 * Brand mark for welcome / headers. Uses the shipping GIF asset.
 */
export default function MyToDooBrandLogo({ size = 'md', style }: Props) {
  const dims = SIZES[size] || SIZES.md;
  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={require('../../../../assets/MyToDoo_logo.gif')}
        style={{ width: dims.width, height: dims.height }}
        resizeMode="contain"
        accessibilityLabel="MyToDoo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
