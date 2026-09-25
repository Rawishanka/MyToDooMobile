/**
 * "Full blue glass" design kit for the Account family (light mode = whole screen blue,
 * dark mode keeps the existing navy surfaces). Purely presentational helpers.
 *
 *  - BluePage      page root: #003399 -> #00287A gradient, light status bar, safe-area blends in
 *  - LightHeader   transparent header band (same blue as page), centred white title, glass back pill
 *  - IconChip      36px glass chip with white glyph (tones: blue/white, green=mint, amber, red=coral)
 *  - SectionCard   glass card with optional chip + title
 *  - tokens        LC (colours), glassCard, fieldLabel, inputBase, primaryButton, secondaryButton
 */
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/shared/theme';

export const LC = {
  blue: '#003399',
  blueDeep: '#00287A',
  orange: '#ff6b35',
  page: '#003399',
  card: 'rgba(255,255,255,0.10)',
  border: 'rgba(255,255,255,0.18)',
  chip: 'rgba(255,255,255,0.16)',
  text: '#FFFFFF',
  label: '#FFFFFF',
  muted: 'rgba(255,255,255,0.75)',
  faint: 'rgba(255,255,255,0.55)',
  chevron: 'rgba(255,255,255,0.6)',
  inputFill: '#FFFFFF',
  inputText: '#0F172A',
  placeholder: '#94A3B8',
  green: '#4ADE80',
  greenBg: 'rgba(74,222,128,0.18)',
  amber: '#FBBF24',
  amberBg: 'rgba(251,191,36,0.18)',
  red: '#FCA5A5',
  redBg: 'rgba(252,165,165,0.18)',
  dark: {
    page: '#0B1120',
    card: '#1E293B',
    border: '#334155',
    text: '#F8FAFC',
    muted: '#94A3B8',
    accent: '#38BDF8',
    inputFill: '#0F172A',
  },
} as const;

export const cardShadow = {
  shadowColor: '#00114D',
  shadowOpacity: 0.25,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
} as const;

/** Glass card surface (light). Spread into a style. */
export const glassCard = {
  backgroundColor: LC.card,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: LC.border,
  padding: 16,
  ...cardShadow,
} as const;

export const fieldLabel = {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '600',
  marginBottom: 8,
} as const;

export const inputBase = {
  backgroundColor: LC.inputFill,
  borderRadius: 14,
  borderWidth: 1.5,
  borderColor: 'transparent',
  color: LC.inputText,
  paddingHorizontal: 14,
  minHeight: 50,
  fontSize: 15,
} as const;

export const primaryButton = {
  backgroundColor: LC.orange,
  borderRadius: 14,
  height: 52,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: LC.orange,
  shadowOpacity: 0.3,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
} as const;

export const secondaryButton = {
  backgroundColor: 'transparent',
  borderRadius: 14,
  height: 52,
  borderWidth: 1.5,
  borderColor: '#FFFFFF',
  alignItems: 'center',
  justifyContent: 'center',
} as const;

/** Page root: full blue (light) with subtle gradient; navy in dark mode. */
export const BluePage: React.FC<{ children?: React.ReactNode; style?: StyleProp<ViewStyle> }> = ({ children, style }) => {
  const { isDarkMode } = useTheme();
  return (
    <View style={[{ flex: 1, backgroundColor: isDarkMode ? LC.dark.page : LC.blue }, style]}>
      <StatusBar barStyle="light-content" />
      {!isDarkMode && (
        <LinearGradient
          colors={[LC.blue, LC.blueDeep]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
};

/**
 * Drop-in first child for a screen root whose base background is already LC.blue:
 * adds the subtle #003399 -> #00287A gradient in light mode (renders nothing in dark).
 */
export const BlueBackdrop: React.FC = () => {
  const { isDarkMode } = useTheme();
  if (isDarkMode) return null;
  return (
    <LinearGradient
      colors={[LC.blue, LC.blueDeep]}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );
};

interface HeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  /** Use when the screen already sits below a safe-area / custom top padding */
  topPadding?: number;
  backIcon?: 'chevron-back' | 'close';
  /** Opaque blue band for the few (legacy) screens whose body is still a light page */
  solid?: boolean;
}

/** Header band (same blue as the page) with translucent back pill and centred white title. */
export const LightHeader: React.FC<HeaderProps> = ({ title, onBack, right, topPadding, backIcon = 'chevron-back', solid = false }) => {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const pad = topPadding ?? (Platform.OS === 'ios' ? insets.top + 6 : Math.max(insets.top, 24) + 6);
  return (
    <View style={[hs.header, { paddingTop: pad }, solid && { backgroundColor: LC.blue }, isDarkMode && { backgroundColor: LC.dark.page }]}>
      <StatusBar barStyle="light-content" />
      <View style={hs.side}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={hs.pill}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name={backIcon} size={22} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={hs.title} numberOfLines={1}>{title}</Text>
      <View style={[hs.side, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
};

/** 36px rounded glass icon chip used on every row / section title. */
export const IconChip: React.FC<{
  name: React.ComponentProps<typeof Ionicons>['name'];
  tone?: 'blue' | 'green' | 'amber' | 'red';
  size?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ name, tone = 'blue', size = 36, style }) => {
  const { isDarkMode } = useTheme();
  const map = {
    blue: { bg: isDarkMode ? 'rgba(56,189,248,0.14)' : LC.chip, fg: isDarkMode ? LC.dark.accent : '#FFFFFF' },
    green: { bg: LC.greenBg, fg: LC.green },
    amber: { bg: LC.amberBg, fg: LC.amber },
    red: { bg: LC.redBg, fg: LC.red },
  }[tone];
  return (
    <View style={[{ width: size, height: size, borderRadius: 12, backgroundColor: map.bg, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Ionicons name={name} size={Math.round(size * 0.52)} color={map.fg} />
    </View>
  );
};

/** Glass card with a bold white title and optional icon chip. */
export const SectionCard: React.FC<{
  title?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}> = ({ title, icon, children, style }) => {
  const { isDarkMode } = useTheme();
  return (
    <View style={[cs.card, isDarkMode && { backgroundColor: LC.dark.card, borderColor: LC.dark.border }, style]}>
      {title ? (
        <View style={cs.titleRow}>
          {icon ? <IconChip name={icon} style={{ marginRight: 10 }} /> : null}
          <Text style={[cs.title, isDarkMode && { color: LC.dark.text }]} numberOfLines={1}>{title}</Text>
        </View>
      ) : null}
      {children}
    </View>
  );
};

const hs = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  side: { width: 44, justifyContent: 'center' },
  pill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

const cs = StyleSheet.create({
  card: {
    ...glassCard,
    marginBottom: 14,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  title: { flex: 1, fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});
