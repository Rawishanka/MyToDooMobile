/**
 * Spacing system for MyToDoo Mobile App
 * Consistent spacing values for margins, padding, and gaps
 */
export const spacing = {
  // Base unit (4px)
  unit: 4,
  
  // Spacing scale
  xs: 4,   // 4px
  sm: 8,   // 8px
  md: 12,  // 12px
  base: 16, // 16px
  lg: 20,  // 20px
  xl: 24,  // 24px
  '2xl': 32, // 32px
  '3xl': 40, // 40px
  '4xl': 48, // 48px
  '5xl': 64, // 64px
  '6xl': 80, // 80px
  
  // Common use cases
  screenPadding: 16,
  cardPadding: 16,
  buttonPadding: 12,
  inputPadding: 12,
  sectionGap: 24,
  itemGap: 12,
} as const;

// Border radius values
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 28,
  '4xl': 32,
  full: 9999,
  
  // Common use cases
  button: 30,
  card: 12,
  input: 8,
  badge: 16,
} as const;

// Container widths
export const containerWidth = {
  full: '100%',
  xl: '90%',
  lg: '85%',
  md: '80%',
  sm: '75%',
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type ContainerWidth = typeof containerWidth;
