import { ConfigContext, ExpoConfig } from '@expo/config';
import 'dotenv/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'MyToDoo',
  slug: 'MyToDooMobile',
  owner: 'rusith123',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/mytodoo-icon.png',
  scheme: 'mytodoo',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/images/mytodoo-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#004aad',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.nowanya.mytodoomobile',
    associatedDomains: ['applinks:mytodoomobile.com'],
  },
  android: {
    package: 'com.nowanya.mytodoomobile',
    adaptiveIcon: {
      foregroundImage: './assets/images/mytodoo-adaptive-icon.png',
      backgroundColor: '#004aad',
    },
    splash: {
      image: './assets/images/mytodoo-adaptive-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#004aad',
    },
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
    [
      'expo-splash-screen',
      {
        image: './assets/images/mytodoo-adaptive-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#004aad',
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
    apiUrl: process.env.API_URL,
    easApiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://134.199.172.167:5001/api',
    environment: process.env.ENVIRONMENT,
    mapboxAccessToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
    googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    eas: {
      projectId: "29db80f5-37c0-49d6-82ac-507560f16c71"
    },
  },
});
