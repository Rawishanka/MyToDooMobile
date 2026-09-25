import { View } from 'react-native';
import { HS, homeCard, homeHero } from '@/src/shared/theme/homeStyle';

/**
 * "Home style" design tokens shared by every step of the Post Task flow (light mode):
 * dark-blue hero band on top, light blue-white page below, white cards, orange primary.
 * Style only - no behaviour lives here. Dark mode keeps its own inline surfaces.
 */
export const FLOW = {
  blue: HS.blue,
  blueDeep: HS.blueDeep,
  orange: HS.orange,
  white: '#FFFFFF',
  page: HS.page,
  card: HS.card,
  cardBorder: HS.cardBorder,
  tint: HS.tint,
  tintStrong: HS.tintStrong,
  tintBorder: HS.tintBorder,
  inputBorder: HS.inputBorder,
  navy: HS.navy,
  text: HS.text,
  muted: HS.muted,
  placeholder: HS.placeholder,
  onHero: HS.onHero,
  onHeroMuted: HS.onHeroMuted,
  heroPill: 'rgba(255,255,255,0.18)',
  disabledFill: HS.tintStrong,
  disabledText: HS.muted,
  line: HS.cardBorder,
  error: HS.redText,
  errorBg: '#FFF8F8',
  required: '#DC2626',
  mint: '#4ADE80',
  amber: '#FBBF24',
  darkPage: '#0B1120',
  darkCard: '#1E293B',
  darkBorder: '#334155',
} as const;

/** Page background: plain light page (light) or nothing (dark). Kept for compatibility. */
export function FlowBackground({ isDarkMode }: { isDarkMode: boolean }) {
  if (isDarkMode) return null;
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: HS.page }}
    />
  );
}

/** White card used for each form section. */
export const flowCard = homeCard;

/** Hero band (dark blue, rounded bottom corners 28). */
export const flowHero = homeHero;

/** Orange primary button shadow (soft). */
export const primaryShadow = {
  shadowColor: HS.orange,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.28,
  shadowRadius: 12,
  elevation: 4,
} as const;
