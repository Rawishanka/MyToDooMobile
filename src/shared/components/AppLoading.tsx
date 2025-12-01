import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AnimatedLoading from './AnimatedLoading';

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
  
  if (variant === 'minimal') {
    return (
      <View style={styles.minimalContainer}>
        <ActivityIndicator size={size === 'small' ? 'small' : 'large'} color="#004aad" />
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
    <View style={styles.container}>
      <AnimatedLoading size={size} color="#004aad" />
      {showMessage && (
        <Text style={styles.message}>{message}</Text>
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
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  brandedMessage: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
});