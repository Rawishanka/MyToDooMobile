/**
 * Light-cards design kit for the Account / Comms families.
 * Purely presentational helpers (tokens, header, icon chip, section card).
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

export const LC = {
  blue: '#003399',
  orange: '#ff6b35',
  page: '#F4F6FB',
  card: '#FFFFFF',
  border: '#E8ECF4',
  text: '#0F172A',
  label: '#334155',
  muted: '#64748B',
  chevron: '#94A3B8',
  inputFill: '#F8FAFC',
  chipBlue: 'rgba(0,51,153,0.08)',
  green: '#16A34A',
  greenBg: '#DCFCE7',
  amber: '#D97706',
  amberBg: '#FEF3C7',
  red: '#DC2626',
  redBg: '#FEE2E2',
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
  shadowColor: '#0F172A',
  shadowOpacity: 0.07,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
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

interface HeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  /** Use when the screen already sits below a safe-area / custom top padding */
  topPadding?: number;
  backIcon?: 'chevron-back' | 'close';
}

/** Blue band header with translucent back pill and centred white title. */
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

/** 36px rounded icon chip used on every row / section title. */
export const IconChip: React.FC<{
  name: React.ComponentProps<typeof Ionicons>['name'];
  tone?: 'blue' | 'green' | 'amber' | 'red';
  size?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ name, tone = 'blue', size = 36, style }) => {
  const { isDarkMode } = useTheme();
  const map = {
    blue: { bg: isDarkMode ? 'rgba(56,189,248,0.14)' : LC.chipBlue, fg: isDarkMode ? LC.dark.accent : LC.blue },
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

/** White card with a bold title and optional blue icon chip. */
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
    backgroundColor: LC.blue,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  side: { width: 44, justifyContent: 'center' },
  pill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
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
    backgroundColor: LC.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: LC.border,
    padding: 16,
    marginBottom: 14,
    ...cardShadow,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  title: { flex: 1, fontSize: 17, fontWeight: '700', color: LC.text },
});
