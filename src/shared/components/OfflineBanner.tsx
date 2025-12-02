import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export const OfflineBanner: React.FC = () => {
  const { isConnected } = useNetworkStatus();
  const [animation] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (!isConnected) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isConnected, animation]);

  if (isConnected) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          opacity: animation,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name="cloud-offline" size={18} color="#fff" />
        <Text style={styles.text}>You are offline. Features may not work until you reconnect.</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 70, // Above bottom navigation (typically 60px) + 10px margin
    right: 16,
    left: 16,
    borderRadius: 8,
    zIndex: 9999,
    elevation: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
});
