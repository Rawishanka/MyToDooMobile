/**
 * Card styles for MyToDoo Mobile App
 * Reusable card/container style definitions
 */
import { StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../colors';
import { shadows } from '../shadows';
import { borderRadius, spacing } from '../spacing';

export const cardStyles = StyleSheet.create({
  // Base Card
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    ...shadows.card,
  } as ViewStyle,
  
  // Card with border
  cardBordered: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  } as ViewStyle,
  
  // Flat card (no shadow)
  cardFlat: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
  } as ViewStyle,
  
  // Elevated card (more shadow)
  cardElevated: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    ...shadows.lg,
  } as ViewStyle,
  
  // Compact card (less padding)
  cardCompact: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    ...shadows.card,
  } as ViewStyle,
  
  // Task Card (specific for task items)
  taskCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.card,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.card,
  } as ViewStyle,
  
  // Section Container
  section: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.card,
    padding: spacing.base,
    marginBottom: spacing.sectionGap,
  } as ViewStyle,
  
  // Modal Container
  modal: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: spacing.xl,
    ...shadows.modal,
  } as ViewStyle,
  
  // Bottom Sheet
  bottomSheet: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['2xl'],
  } as ViewStyle,
  
  // Header Card
  headerCard: {
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    ...shadows.header,
  } as ViewStyle,
});

// Export type for TypeScript
export type CardStyles = typeof cardStyles;
