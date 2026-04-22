import { ConfigContext, ExpoConfig } from '@expo/config';
import 'dotenv/config';

const IS_UAT = process.env.ENVIRONMENT === 'uat';
const IS_LIVE = process.env.ENVIRONMENT === 'live';

const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (IS_UAT) return 'https://api.mytodoo.com/api';
  return 'https://au-live-api.mytodoo.com/api';
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: IS_UAT ? 'MyToDoo UAT' : 'MyToDoo',
  slug: 'mytodoomobile-app',
  owner: 'sithila345',
  version: '1.0.2',
  orientation: 'portrait',
  icon: './assets/images/mytodoo-adaptive-icon.png',
  scheme: 'mytodoo',
  userInterfaceStyle: 'light',
  assetBundlePatterns: ['**/*'],
  runtimeVersion: '1.0.2',
  ios: {
    bundleIdentifier: IS_UAT ? 'com.unexo.mytodoomobile' : 'com.mytodoo.mytodoolive',
    supportsTablet: true,
    buildNumber: "35",
    googleServicesFile: './GoogleService-Info.plist',
    entitlements: {
      'com.apple.developer.in-app-payments': ['merchant.com.mytodoo.mytodoolive'],
    },
    infoPlist: {
      NSCameraUsageDescription: 'Allow MyToDoo to use your camera to capture and upload task photos.',
      NSPhotoLibraryUsageDescription: 'Allow MyToDoo to access your photo library to upload task images.',
      NSPhotoLibraryAddUsageDescription: 'Allow MyToDoo to save photos to your library.',
      NSLocationWhenInUseUsageDescription: 'Allow MyToDoo to use your location to show nearby tasks and provide location-based services.',
      NSLocationAlwaysUsageDescription: 'Allow MyToDoo to access your location to show nearby tasks.',
      NSMicrophoneUsageDescription: 'Required for video recording features.',
      UIBackgroundModes: ['remote-notification', 'fetch'],
      ITSAppUsesNonExemptEncryption: false,
    },
    associatedDomains: ['applinks:mytodoo.com', 'applinks:mytodoomobile'],
  },
  android: {
    package: 'com.mytodoo.mytodoolive',
    googleServicesFile: './android/app/google-services.json',
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
          deploymentTarget: '16.4',
          newArchEnabled: false,
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
    // '@react-native-firebase/auth' - Must be configured manually in Podfile for Swift AppDelegate
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
    'expo-secure-store',
    [
      '@stripe/stripe-react-native',
      {
        merchantIdentifier: 'merchant.com.mytodoo.mytodoolive',
        enableGooglePay: true,
      },
    ],
    './plugins/withFirebaseFix',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: 'ddff99e4-dea8-470b-8f81-c9d384ef2d0f',
    },
    apiUrl: process.env.API_URL || getApiUrl(),
    easApiUrl: process.env.EXPO_PUBLIC_API_URL || getApiUrl(),
    environment: process.env.ENVIRONMENT || 'live',
    mapboxAccessToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
    googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  },
});
