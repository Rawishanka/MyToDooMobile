/**
 * Button styles for MyToDoo Mobile App
 * Reusable button style definitions
 */
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { colors } from '../colors';
import { shadows } from '../shadows';
import { borderRadius, spacing } from '../spacing';
import { typography } from '../typography';

// Button base styles
const buttonBase: ViewStyle = {
  paddingVertical: spacing.buttonPadding,
  paddingHorizontal: spacing.xl,
  borderRadius: borderRadius.button,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
};

const buttonTextBase: TextStyle = {
  fontSize: typography.fontSize.md,
  fontWeight: typography.fontWeight.semibold,
  letterSpacing: typography.letterSpacing.wide,
};

export const buttonStyles = StyleSheet.create({
  // Primary Button (Orange/Accent)
  primary: {
    ...buttonBase,
    backgroundColor: colors.accent,
    ...shadows.button,
  } as ViewStyle,
  
  primaryText: {
    ...buttonTextBase,
    color: colors.textLight,
  } as TextStyle,
  
  // Secondary Button (Blue/Primary)
  secondary: {
    ...buttonBase,
    backgroundColor: colors.primary,
    ...shadows.button,
  } as ViewStyle,
  
  secondaryText: {
    ...buttonTextBase,
    color: colors.textLight,
  } as TextStyle,
  
  // Outline Button
  outline: {
    ...buttonBase,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.accent,
  } as ViewStyle,
  
  outlineText: {
    ...buttonTextBase,
    color: colors.accent,
  } as TextStyle,
  
  // Text Button (no background)
  text: {
    ...buttonBase,
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  } as ViewStyle,
  
  textText: {
    ...buttonTextBase,
    color: colors.primary,
  } as TextStyle,
  
  // Disabled Button
  disabled: {
    ...buttonBase,
    backgroundColor: colors.borderDark,
  } as ViewStyle,
  
  disabledText: {
    ...buttonTextBase,
    color: colors.textTertiary,
  } as TextStyle,
  
  // Success Button
  success: {
    ...buttonBase,
    backgroundColor: colors.success,
    ...shadows.button,
  } as ViewStyle,
  
  successText: {
    ...buttonTextBase,
    color: colors.textLight,
  } as TextStyle,
  
  // Error Button
  error: {
    ...buttonBase,
    backgroundColor: colors.error,
    ...shadows.button,
  } as ViewStyle,
  
  errorText: {
    ...buttonTextBase,
    color: colors.textLight,
  } as TextStyle,
  
  // Small Button
  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  } as ViewStyle,
  
  smallText: {
    fontSize: typography.fontSize.sm,
  } as TextStyle,
  
  // Large Button
  large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
  } as ViewStyle,
  
  largeText: {
    fontSize: typography.fontSize.lg,
  } as TextStyle,
  
  // Full Width Button
  fullWidth: {
    width: '100%',
  } as ViewStyle,
  
  // Icon Button
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
});

// Export type for TypeScript
export type ButtonStyles = typeof buttonStyles;
