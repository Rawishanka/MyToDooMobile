/**
 * Input/Form styles for MyToDoo Mobile App
 * Reusable input and form control style definitions
 */
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { colors } from '../colors';
import { borderRadius, spacing } from '../spacing';
import { typography } from '../typography';

export const inputStyles = StyleSheet.create({
  // Text Input
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.input,
    paddingVertical: spacing.inputPadding,
    paddingHorizontal: spacing.base,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  } as ViewStyle & TextStyle,
  
  // Focused Input
  inputFocused: {
    borderColor: colors.inputFocus,
    borderWidth: 2,
  } as ViewStyle,
  
  // Error Input
  inputError: {
    borderColor: colors.error,
    borderWidth: 1.5,
  } as ViewStyle,
  
  // Disabled Input
  inputDisabled: {
    backgroundColor: colors.backgroundDark,
    color: colors.textTertiary,
  } as ViewStyle & TextStyle,
  
  // Input Label
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  } as TextStyle,
  
  // Input Helper Text
  helperText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  } as TextStyle,
  
  // Error Text
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
  } as TextStyle,
  
  // Textarea (multiline input)
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.inputPadding,
  } as ViewStyle & TextStyle,
  
  // Search Input
  searchInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  } as ViewStyle & TextStyle,
  
  // Input Container (wrapper for inputs with icons)
  inputContainer: {
    marginBottom: spacing.base,
  } as ViewStyle,
  
  // Input Row (for side-by-side inputs like first/last name)
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  } as ViewStyle,
  
  // Half Width Input (for input rows)
  inputHalf: {
    flex: 1,
  } as ViewStyle,
});

// Export type for TypeScript
export type InputStyles = typeof inputStyles;
