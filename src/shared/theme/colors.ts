/**
 * Color palette for MyToDoo Mobile App
 * All colors used throughout the application
 */
export const colors = {
  // Primary Brand Colors
  primary: '#1A2980', // Deep royal blue — main brand color
  primaryLight: '#26D0CE',
  primaryDark: '#0D1B2A',
  
  // Secondary/Accent Colors
  accent: '#FF7A00', // Orange — Call-to-action buttons
  accentLight: '#FFA040',
  accentDark: '#E56D00',
  
  // Background Colors
  background: '#F4F6FB', // Off-white with slight blue tint
  backgroundWhite: '#FFFFFF',
  backgroundDark: '#E8ECF4',
  
  // Text Colors
  textPrimary: '#1A1D2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textLight: '#FFFFFF',
  textMuted: '#9CA3AF',
  
  // Status Colors
  success: '#00A651',
  successLight: '#34C77A',
  error: '#EF4444',
  errorLight: '#F87171',
  warning: '#F59E0B',
  warningLight: '#FBD38D',
  info: '#2196F3',
  infoLight: '#64B5F6',
  
  // Border Colors
  border: '#E8ECF4',
  borderLight: '#F1F4FC',
  borderDark: '#D1D9E6',
  
  // Shadow Colors
  shadow: '#000000',
  
  // Overlay/Modal
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Input/Form Colors
  inputBackground: '#FFFFFF',
  inputBorder: '#E8ECF4',
  inputPlaceholder: '#9CA3AF',
  inputFocus: '#1A2980',
  
  // Card Colors
  cardBackground: '#FFFFFF',
  cardBorder: '#E8ECF4',
  
  // Task Status Colors
  taskOpen: '#1A2980',
  taskInProgress: '#F59E0B',
  taskCompleted: '#00A651',
  taskCancelled: '#EF4444',
  
  // Rating Colors
  ratingActive: '#FFD700',
  ratingInactive: '#CCCCCC',
} as const;

export type Colors = typeof colors;
