import { ConfigContext, ExpoConfig } from '@expo/config';
import 'dotenv/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'MyToDoo',
  slug: 'MyToDooMobile',
  owner: 'novadya',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/mytodoo-icon.png',
  scheme: 'mytodoo',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  assetBundlePatterns: ['**/*'],
  runtimeVersion: '1.0.0',
  android: {
    package: 'com.mytodoo.mytodoolive',
    adaptiveIcon: {
      foregroundImage: './assets/images/mytodoo-adaptive-icon.png',
      backgroundColor: '#004aad',
    },
    permissions: [
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'NOTIFICATIONS',
    ],
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'mytodoomobile',
            host: '*',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
    edgeToEdgeEnabled: true,
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-video',
    'expo-updates',
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          minSdkVersion: 24,
        },
      },
    ],
    'expo-web-browser',
    '@react-native-firebase/app',
    '@react-native-firebase/messaging',
    [
      'expo-notifications',
      {
        color: '#004aad',
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow MyToDoo to use your location to show nearby tasks and provide location-based services.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: '5ad77f0f-ad33-4a24-8c41-f2115921cb55',
    },
    apiUrl: process.env.API_URL,
    easApiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://au-live-api.mytodoo.com/api',
    environment: process.env.ENVIRONMENT,
    mapboxAccessToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
    googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  },
});
