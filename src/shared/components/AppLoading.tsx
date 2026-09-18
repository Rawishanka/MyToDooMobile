import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AnimatedLoading from './AnimatedLoading';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';

interface AppLoadingProps {
  message?: string;
  showMessage?: boolean;
  variant?: 'default' | 'minimal' | 'branded';
  size?: 'small' | 'medium' | 'large';
}

export default function AppLoading({ 
  message = 'Loading...', 
  showMessage = true,
  variant = 'default',
  size = 'medium'
}: AppLoadingProps) {
  const { isDarkMode } = useTheme();
  
  if (variant === 'minimal') {
    return (
      <View style={styles.minimalContainer}>
        <ActivityIndicator size={size === 'small' ? 'small' : 'large'} color={isDarkMode ? '#38BDF8' : '#004aad'} />
      </View>
    );
  }

  if (variant === 'branded') {
    return (
      <View style={styles.brandedContainer}>
        <View style={styles.brandedLogoContainer}>
          <AnimatedLoading size={size} color="#ffffff" />
        </View>
        {showMessage && (
          <Text style={styles.brandedMessage}>{message}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <AnimatedLoading size={size} color={isDarkMode ? '#38BDF8' : '#004aad'} />
      {showMessage && (
        <Text style={[styles.message, isDarkMode && { color: '#94A3B8' }]}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  minimalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  brandedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#004aad',
    paddingHorizontal: 20,
  },
  brandedLogoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  message: {
    marginTop: 16,
    fontSize: RFValue(16),
    color: '#666666',
    textAlign: 'center',
  },
  brandedMessage: {
    fontSize: RFValue(16),
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
});
