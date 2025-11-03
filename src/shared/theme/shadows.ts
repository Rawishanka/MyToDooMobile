/**
 * Shadow styles for MyToDoo Mobile App
 * Consistent shadow elevations for depth and hierarchy
 */
import { Platform, ViewStyle } from 'react-native';

type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

/**
 * Creates a shadow style object compatible with both iOS and Android
 */
const createShadow = (
  elevation: number,
  shadowOpacity: number,
  shadowRadius: number,
  shadowOffsetHeight: number = elevation
): ShadowStyle => ({
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: shadowOffsetHeight,
      },
      shadowOpacity,
      shadowRadius,
    },
    android: {
      elevation,
    },
  }),
});

export const shadows = {
  // No shadow
  none: createShadow(0, 0, 0, 0),
  
  // Small shadows
  sm: createShadow(2, 0.1, 2, 1),
  
  // Medium shadows
  md: createShadow(4, 0.15, 4, 2),
  
  // Large shadows
  lg: createShadow(6, 0.18, 6, 3),
  
  // Extra large shadows
  xl: createShadow(8, 0.2, 8, 4),
  
  // 2XL shadows
  '2xl': createShadow(12, 0.25, 12, 6),
  
  // Common use cases
  card: createShadow(3, 0.12, 4, 2),
  button: createShadow(2, 0.1, 3, 1),
  modal: createShadow(10, 0.3, 10, 5),
  header: createShadow(4, 0.15, 4, 2),
} as const;

export type Shadows = typeof shadows;
