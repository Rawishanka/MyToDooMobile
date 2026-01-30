import { ConfigContext, ExpoConfig } from '@expo/config';
import 'dotenv/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'MyToDoo',
  slug: 'mytodoomobile-app',
  owner: 'sithila345',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/mytodoo-icon.png',
  scheme: 'mytodoo',
  userInterfaceStyle: 'light',
  newArchEnabled: false,
  jsEngine: 'jsc', // Use JavaScriptCore instead of Hermes to avoid inspector errors
  assetBundlePatterns: ['**/*'],
  runtimeVersion: '1.0.0',
  ios: {
    bundleIdentifier: 'com.mytodoo.mytodoolive',
    supportsTablet: true,
    buildNumber: '1.0.0',
    googleServicesFile: './GoogleService-Info.plist',
    infoPlist: {
      NSCameraUsageDescription: 'Allow MyToDoo to use your camera to capture and upload task photos.',
      NSPhotoLibraryUsageDescription: 'Allow MyToDoo to access your photo library to upload task images.',
      NSPhotoLibraryAddUsageDescription: 'Allow MyToDoo to save photos to your library.',
      NSLocationWhenInUseUsageDescription: 'Allow MyToDoo to use your location to show nearby tasks and provide location-based services.',
      NSLocationAlwaysUsageDescription: 'Allow MyToDoo to access your location to show nearby tasks.',
      NSMicrophoneUsageDescription: 'Required for video recording features.',
      NSUserTrackingUsageDescription: 'This identifier will be used to deliver personalized ads to you.',
      UIBackgroundModes: ['remote-notification', 'fetch'],
      ITSAppUsesNonExemptEncryption: false,
    },
    associatedDomains: ['applinks:mytodoo.com', 'applinks:mytodoomobile'],
  },
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
        ios: {
          deploymentTarget: '15.1',
          useFrameworks: 'static',
        },
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
    'expo-apple-authentication',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: 'ddff99e4-dea8-470b-8f81-c9d384ef2d0f',
    },
    apiUrl: process.env.API_URL,
    easApiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.mytodoo.com/api',
    environment: process.env.ENVIRONMENT,
    mapboxAccessToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
    googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  },
});
