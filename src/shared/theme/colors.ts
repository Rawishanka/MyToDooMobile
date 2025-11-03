/**
 * Color palette for MyToDoo Mobile App
 * All colors used throughout the application
 */
export const colors = {
  // Primary Brand Colors
  primary: '#004aad', // Blue - Main brand color
  primaryLight: '#0052CC',
  primaryDark: '#003580',
  
  // Secondary/Accent Colors
  accent: '#FF6B35', // Orange - Call-to-action buttons
  accentLight: '#FF8A5C',
  accentDark: '#FF4500',
  
  // Background Colors
  background: '#F0F0F0', // Light gray background
  backgroundWhite: '#FFFFFF',
  backgroundDark: '#E0E0E0',
  
  // Text Colors
  textPrimary: '#333333',
  textSecondary: '#666666',
  textTertiary: '#888888',
  textLight: '#FFFFFF',
  textMuted: '#999999',
  
  // Status Colors
  success: '#4CAF50',
  successLight: '#81C784',
  error: '#F44336',
  errorLight: '#E57373',
  warning: '#FF9800',
  warningLight: '#FFB74D',
  info: '#2196F3',
  infoLight: '#64B5F6',
  
  // Border Colors
  border: '#DDDDDD',
  borderLight: '#EEEEEE',
  borderDark: '#CCCCCC',
  
  // Shadow Colors
  shadow: '#000000',
  
  // Overlay/Modal
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Input/Form Colors
  inputBackground: '#FFFFFF',
  inputBorder: '#DDDDDD',
  inputPlaceholder: '#999999',
  inputFocus: '#004aad',
  
  // Card Colors
  cardBackground: '#FFFFFF',
  cardBorder: '#EEEEEE',
  
  // Task Status Colors
  taskOpen: '#2196F3',
  taskInProgress: '#FF9800',
  taskCompleted: '#4CAF50',
  taskCancelled: '#F44336',
  
  // Rating Colors
  ratingActive: '#FFD700',
  ratingInactive: '#CCCCCC',
} as const;

export type Colors = typeof colors;
