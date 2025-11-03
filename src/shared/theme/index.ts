/**
 * Main theme export
 * Central access point for all theme values
 */
export { colors } from './colors';
export type { Colors } from './colors';

export { textStyles, typography } from './typography';
export type { TextStyles, Typography } from './typography';

export { borderRadius, containerWidth, spacing } from './spacing';
export type { BorderRadius, ContainerWidth, Spacing } from './spacing';

export { shadows } from './shadows';
export type { Shadows } from './shadows';

// Component styles
export { buttonStyles } from './components/buttons';
export type { ButtonStyles } from './components/buttons';

export { cardStyles } from './components/cards';
export type { CardStyles } from './components/cards';

export { inputStyles } from './components/inputs';
export type { InputStyles } from './components/inputs';

// Default theme object
import { colors } from './colors';
import { buttonStyles } from './components/buttons';
import { cardStyles } from './components/cards';
import { inputStyles } from './components/inputs';
import { shadows } from './shadows';
import { borderRadius, containerWidth, spacing } from './spacing';
import { textStyles, typography } from './typography';

export const theme = {
  colors,
  typography,
  textStyles,
  spacing,
  borderRadius,
  containerWidth,
  shadows,
  components: {
    buttons: buttonStyles,
    cards: cardStyles,
    inputs: inputStyles,
  },
} as const;

export type Theme = typeof theme;

// Helper hook for using theme in components
import { useMemo } from 'react';

export const useTheme = () => {
  return useMemo(() => theme, []);
};
