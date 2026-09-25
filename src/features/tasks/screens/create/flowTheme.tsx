import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

/**
 * "Full blue glass" design tokens shared by every step of the Post Task flow.
 * Style only - no behaviour lives here.
 */
export const FLOW = {
  blue: '#003399',
  blueDeep: '#00287A',
  orange: '#ff6b35',
  white: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.75)',
  glass: 'rgba(255,255,255,0.10)',
  glassStrong: 'rgba(255,255,255,0.16)',
  glassBorder: 'rgba(255,255,255,0.18)',
  dashed: 'rgba(255,255,255,0.5)',
  disabledFill: 'rgba(255,255,255,0.22)',
  disabledText: 'rgba(255,255,255,0.6)',
  line: 'rgba(255,255,255,0.15)',
  ink: '#0F172A',
  placeholder: '#94A3B8',
  error: '#FCA5A5',
  required: '#FCA5A5',
  mint: '#4ADE80',
  amber: '#FBBF24',
  darkPage: '#0B1120',
  darkCard: '#1E293B',
  darkBorder: '#334155',
} as const;

/** Page background: subtle blue gradient (light) or flat navy (dark). */
export function FlowBackground({ isDarkMode }: { isDarkMode: boolean }) {
  if (isDarkMode) return null;
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[FLOW.blue, FLOW.blueDeep]}
      style={StyleSheet.absoluteFill}
    />
  );
}

/** Orange primary button shadow. */
export const primaryShadow = {
  shadowColor: FLOW.orange,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.35,
  shadowRadius: 12,
  elevation: 5,
} as const;
