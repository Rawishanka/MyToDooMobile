import { StyleSheet, View } from 'react-native';

interface AnimatedLoadingProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: any;
}

export default function AnimatedLoading({ 
  size = 'medium', 
  color = '#004aad',
  style 
}: AnimatedLoadingProps) {
  const sizeConfig = {
    small: { dotSize: 8, spacing: 6 },
    medium: { dotSize: 12, spacing: 8 },
    large: { dotSize: 16, spacing: 12 },
  };

  const { dotSize, spacing } = sizeConfig[size];

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.dot,
          { 
            width: dotSize, 
            height: dotSize, 
            borderRadius: dotSize / 2,
            backgroundColor: color,
            marginHorizontal: spacing / 2,
          }
        ]}
      />
      <View
        style={[
          styles.dot,
          { 
            width: dotSize, 
            height: dotSize, 
            borderRadius: dotSize / 2,
            backgroundColor: color,
            marginHorizontal: spacing / 2,
            opacity: 0.8,
          }
        ]}
      />
      <View
        style={[
          styles.dot,
          { 
            width: dotSize, 
            height: dotSize, 
            borderRadius: dotSize / 2,
            backgroundColor: color,
            marginHorizontal: spacing / 2,
            opacity: 0.6,
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    // Base dot styles are applied inline
  },
});