import MyToDooLogo from '@/assets/images/MyToDoo_logo.svg';
import { FORM_MAX_WIDTH, RFValue, isTablet } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View, ViewStyle, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

/** Shared brand tokens for the auth flow. */
export const AUTH_COLORS = {
  blue: '#003399',
  blueDeep: '#00287A',
  orange: '#ff6b35',
  inputBg: '#F4F7FF',
  inputBorder: '#D6E2FF',
  inputBorderFocus: '#003399',
  navy: '#0B1F4D',
  placeholder: '#8A9BC4',
  icon: '#003399',
  error: '#DC2626',
};

/** How far the white sheet slides up over the hero. */
export const AUTH_SHEET_OVERLAP = 28;

type Props = {
  title: string;
  subtitle?: React.ReactNode;
  compact?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  children?: React.ReactNode;
};

const DotGrid = ({ cols, rows, gap = 14 }: { cols: number; rows: number; gap?: number }) => (
  <Svg width={cols * gap} height={rows * gap}>
    {Array.from({ length: rows }).map((_, r) =>
      Array.from({ length: cols }).map((__, c) => (
        <Circle key={`${r}-${c}`} cx={c * gap + gap / 2} cy={r * gap + gap / 2} r={1.6} fill="#FFFFFF" fillOpacity={0.28} />
      ))
    )}
  </Svg>
);

/**
 * Blue artwork hero used by every auth screen (login, sign up, forgot / set-new password).
 * Pair with <AuthSheet> which slides over the hero's bottom edge.
 */
export function AuthArtHeader({ title, subtitle, compact = false, showBack, onBack, onClose, children }: Props) {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'android' ? Math.max(insets.top, StatusBar.currentHeight || 0) : insets.top;
  const logoSize = compact ? 34 : 46;

  return (
    <LinearGradient
      colors={isDarkMode ? ['#0A2670', '#061A4F'] : [AUTH_COLORS.blue, AUTH_COLORS.blueDeep]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={[styles.hero, { paddingTop: topInset + (compact ? 12 : 22), paddingBottom: AUTH_SHEET_OVERLAP + (compact ? 14 : 26) }]}
    >
      <StatusBar barStyle="light-content" />

      {/* Artwork (purely decorative) */}
      <View pointerEvents="none" style={styles.art}>
        <View style={styles.ringBig} />
        <View style={styles.discSoft} />
        <View style={styles.discSmall} />
        <View style={styles.orangeArc} />
        <View style={styles.orangeDot} />
        <View style={styles.dots}>
          <DotGrid cols={6} rows={4} />
        </View>
        {!compact && (
          <>
            <Ionicons name="checkmark-circle-outline" size={44} color="#FFFFFF" style={[styles.artIcon, { top: topInset + 74, left: 22, transform: [{ rotate: '-12deg' }] }]} />
            <Ionicons name="location-outline" size={40} color="#FFFFFF" style={[styles.artIcon, { top: topInset + 118, right: 26, transform: [{ rotate: '10deg' }] }]} />
            <Ionicons name="construct-outline" size={38} color="#FFFFFF" style={[styles.artIcon, { bottom: AUTH_SHEET_OVERLAP + 24, left: 34, transform: [{ rotate: '14deg' }] }]} />
          </>
        )}
      </View>

      {(showBack || onClose) && (
        <View style={[styles.topRow, { top: topInset + 8 }]} pointerEvents="box-none">
          {showBack ? (
            <TouchableOpacity style={styles.roundBtn} onPress={onBack} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View />
          )}
          {onClose ? (
            <TouchableOpacity style={styles.roundBtn} onPress={onClose} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </View>
      )}

      <View style={[styles.content, isTablet && styles.contentTablet]}>
        <View style={[styles.logoBadge, compact && styles.logoBadgeCompact]}>
          <MyToDooLogo width={logoSize} height={logoSize} />
        </View>
        <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>{subtitle}</Text> : null}
        {children}
      </View>
    </LinearGradient>
  );
}

/** White rounded form sheet that overlaps the hero. Fills the remaining screen height. */
export function AuthSheet({ children, style, forceLight }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; forceLight?: boolean }) {
  const { isDarkMode: themeDark } = useTheme();
  const isDarkMode = themeDark && !forceLight;
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.sheet,
        { paddingBottom: Math.max(insets.bottom, 24) },
        isDarkMode && { backgroundColor: '#0B1120', shadowColor: '#000' },
        style,
      ]}
    >
      <View style={[styles.sheetInner, isTablet && { maxWidth: FORM_MAX_WIDTH }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    overflow: 'hidden',
    paddingHorizontal: 24,
  },
  art: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ringBig: {
    position: 'absolute',
    top: -90,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 34,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  discSoft: {
    position: 'absolute',
    bottom: -70,
    left: -60,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  discSmall: {
    position: 'absolute',
    top: 60,
    left: '38%',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  orangeArc: {
    position: 'absolute',
    top: 34,
    right: 70,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 5,
    borderColor: 'transparent',
    borderTopColor: '#ff6b35',
    borderRightColor: '#ff6b35',
    transform: [{ rotate: '20deg' }],
    opacity: 0.95,
  },
  orangeDot: {
    position: 'absolute',
    bottom: 64,
    right: 46,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff6b35',
  },
  dots: {
    position: 'absolute',
    top: 24,
    left: 18,
  },
  artIcon: {
    position: 'absolute',
    opacity: 0.13,
  },
  topRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
  },
  roundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  contentTablet: {
    maxWidth: FORM_MAX_WIDTH,
  },
  logoBadge: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    padding: 12,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeCompact: {
    borderRadius: 14,
    padding: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: RFValue(26),
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  titleCompact: {
    fontSize: RFValue(22),
    marginBottom: 2,
  },
  subtitle: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    lineHeight: 20,
  },
  subtitleCompact: {
    fontSize: RFValue(13),
  },
  sheet: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -AUTH_SHEET_OVERLAP,
    paddingHorizontal: 24,
    paddingTop: 26,
    shadowColor: '#001a66',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 12,
  },
  sheetInner: {
    width: '100%',
    alignSelf: 'center',
  },
});
