/**
 * Blue-scheme tokens for popups (bottom sheets, dialogs, modals) — light mode only.
 * Same language as the full-blue pages: deep blue surface, white text, translucent glass rows,
 * white inputs with navy text, orange primary buttons. Dark mode keeps its own dark surfaces.
 */
import { ViewStyle } from 'react-native';

export const BS = {
  surface: '#003399',
  surfaceDeep: '#00287A',
  overlay: 'rgba(0, 12, 48, 0.6)',
  handle: 'rgba(255,255,255,0.35)',

  glass: 'rgba(255,255,255,0.12)',
  glassStrong: 'rgba(255,255,255,0.20)',
  glassBorder: 'rgba(255,255,255,0.22)',
  divider: 'rgba(255,255,255,0.18)',

  title: '#FFFFFF',
  text: 'rgba(255,255,255,0.92)',
  muted: 'rgba(255,255,255,0.72)',
  placeholder: '#94A3B8',

  inputBg: '#FFFFFF',
  inputText: '#0B1B4D',

  orange: '#ff6b35',
  green: '#7ED957',
  danger: '#EF4444',
  dangerSoft: '#FCA5A5',
  amber: '#FCD34D',
} as const;

/** Bottom sheet container (rounded top, blue). */
export const blueSheet: ViewStyle = {
  backgroundColor: BS.surface,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  borderTopWidth: 1,
  borderColor: BS.glassBorder,
};

/** Centered dialog card (blue). */
export const blueDialog: ViewStyle = {
  backgroundColor: BS.surface,
  borderRadius: 24,
  borderWidth: 1,
  borderColor: BS.glassBorder,
};

/** Glass row/card inside a sheet or dialog. */
export const blueGlassCard: ViewStyle = {
  backgroundColor: BS.glass,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: BS.glassBorder,
};
