/**
 * "Home style" design tokens — the look of the Home / Post Task landing screen extended app-wide
 * (light mode): a dark-blue hero/header with white text on top, a light blue-white page below,
 * white cards with soft light-blue tinted chips/panels, navy text and orange primary buttons.
 * Dark mode keeps its own dark surfaces and does not use these tokens.
 */
import { ViewStyle } from 'react-native';

export const HS = {
  // Brand
  blue: '#003399',
  blueDeep: '#00287A',
  orange: '#ff6b35',

  // Surfaces
  page: '#F4F7FF',
  card: '#FFFFFF',
  cardBorder: '#E3EAFB',
  tint: '#EAF1FF', // light-blue panel / chip background
  tintStrong: '#DCE8FF',
  tintBorder: '#D6E2FF',
  inputBorder: '#D6E2FF',

  // Text
  navy: '#0B1B4D', // titles
  text: '#3B4A6B', // body
  muted: '#6B7A99', // secondary
  placeholder: '#94A3B8',
  onHero: '#FFFFFF',
  onHeroMuted: 'rgba(255,255,255,0.78)',

  // Semantic (chip background / text)
  amberBg: '#FEF3C7',
  amberText: '#B45309',
  greenBg: '#DCFCE7',
  greenText: '#15803D',
  redBg: '#FEE2E2',
  redText: '#B91C1C',
  blueBg: '#EAF1FF',
  blueText: '#003399',
} as const;

/** White card: radius 20, hairline border, soft blue-tinted shadow. */
export const homeCard: ViewStyle = {
  backgroundColor: HS.card,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: HS.cardBorder,
  shadowColor: HS.blue,
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

/** Rounded icon chip (36 px) on the light-blue tint. */
export const homeIconChip: ViewStyle = {
  width: 36,
  height: 36,
  borderRadius: 12,
  backgroundColor: HS.tint,
  alignItems: 'center',
  justifyContent: 'center',
};

/** Hero band that carries a title/avatar: dark blue with rounded bottom corners. */
export const homeHero: ViewStyle = {
  backgroundColor: HS.blue,
  borderBottomLeftRadius: 28,
  borderBottomRightRadius: 28,
};
