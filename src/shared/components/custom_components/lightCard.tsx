/**
 * "Home style" kit for the Account family (light mode = dark-blue header band + light blue-white
 * page + white cards; dark mode keeps the existing navy surfaces). Purely presentational helpers.
 *
 *  - BluePage      page root: HS.page background, light status bar
 *  - LightHeader   blue header band (white centred title, translucent back pill)
 *  - IconChip      36px tinted chip with blue glyph (tones: blue, green, amber, red)
 *  - SectionCard   white homeCard with optional chip + navy title
 *  - tokens        LC (colours), glassCard (= homeCard + padding), fieldLabel, inputBase,
 *                  primaryButton, secondaryButton
 */
import { Ionicons } from '@expo/vector-icons';
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
import { HS, homeCard, homeIconChip } from '@/src/shared/theme/homeStyle';

export const LC = {
  blue: HS.blue,
  blueDeep: HS.blueDeep,
  orange: HS.orange,
  page: HS.page,
  card: HS.card,
  border: HS.cardBorder,
  chip: HS.tint,
  text: HS.navy,
  label: HS.navy,
  muted: HS.muted,
  faint: HS.placeholder,
  chevron: HS.muted,
  inputFill: '#FFFFFF',
  inputText: HS.navy,
  inputBorder: HS.inputBorder,
  placeholder: HS.placeholder,
  required: '#DC2626',
  green: HS.greenText,
  greenBg: HS.greenBg,
  amber: HS.amberText,
  amberBg: HS.amberBg,
  red: HS.redText,
  redBg: HS.redBg,
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
  shadowColor: HS.blue,
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
} as const;

/** White card surface (light). Spread into a style. */
export const glassCard = {
  ...homeCard,
  padding: 16,
} as const;

export const fieldLabel = {
  color: HS.navy,
  fontSize: 14,
  fontWeight: '600',
  marginBottom: 8,
} as const;

export const inputBase = {
  backgroundColor: LC.inputFill,
  borderRadius: 14,
  borderWidth: 1.5,
  borderColor: HS.inputBorder,
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
  backgroundColor: '#FFFFFF',
  borderRadius: 14,
  height: 52,
  borderWidth: 1.5,
  borderColor: HS.blue,
  alignItems: 'center',
  justifyContent: 'center',
} as const;

/** Page root: light Home-style page (HS.page); navy in dark mode. */
export const BluePage: React.FC<{ children?: React.ReactNode; style?: StyleProp<ViewStyle> }> = ({ children, style }) => {
  const { isDarkMode } = useTheme();
  return (
    <View style={[{ flex: 1, backgroundColor: isDarkMode ? LC.dark.page : HS.page }, style]}>
      <StatusBar barStyle="light-content" />
      {children}
    </View>
  );
};

/** Legacy no-op (the gradient backdrop was removed with the Home-style redesign). */
export const BlueBackdrop: React.FC = () => null;

interface HeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  /** Use when the screen already sits below a safe-area / custom top padding */
  topPadding?: number;
  backIcon?: 'chevron-back' | 'close';
  /** Legacy prop, the band is always solid blue now */
  solid?: boolean;
}

/** Blue header band with translucent back pill and centred white title. */
export const LightHeader: React.FC<HeaderProps> = ({ title, onBack, right, topPadding, backIcon = 'chevron-back' }) => {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const pad = topPadding ?? (Platform.OS === 'ios' ? insets.top + 6 : Math.max(insets.top, 24) + 6);
  return (
    <View style={[hs.header, { paddingTop: pad }, isDarkMode && { backgroundColor: LC.dark.page }]}>
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

/** 36px rounded tinted icon chip used on every row / section title. */
export const IconChip: React.FC<{
  name: React.ComponentProps<typeof Ionicons>['name'];
  tone?: 'blue' | 'green' | 'amber' | 'red';
  size?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ name, tone = 'blue', size = 36, style }) => {
  const { isDarkMode } = useTheme();
  const map = {
    blue: { bg: isDarkMode ? 'rgba(56,189,248,0.14)' : HS.tint, fg: isDarkMode ? LC.dark.accent : HS.blue },
    green: { bg: HS.greenBg, fg: HS.greenText },
    amber: { bg: HS.amberBg, fg: HS.amberText },
    red: { bg: HS.redBg, fg: HS.redText },
  }[tone];
  return (
    <View style={[homeIconChip, { width: size, height: size }, { backgroundColor: map.bg }, style]}>
      <Ionicons name={name} size={Math.round(size * 0.52)} color={map.fg} />
    </View>
  );
};

/** White homeCard with a bold navy title and optional icon chip. */
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
    backgroundColor: HS.blue,
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
  title: { flex: 1, fontSize: 17, fontWeight: '700', color: HS.navy },
});
