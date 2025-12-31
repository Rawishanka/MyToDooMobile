import { ConfigContext, ExpoConfig } from '@expo/config';
import 'dotenv/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'MyToDoo',
  slug: 'MyToDooMobile',
  owner: 'rasindu123',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/mytodoo-icon.png',
  scheme: 'mytodoo',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  assetBundlePatterns: ['**/*'],
  runtimeVersion: '1.0.0',
  android: {
    package: 'com.unexo.mytodoomobile',
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
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON || './google-services.json',
  },
  ios: {
    bundleIdentifier: 'com.unexo.mytodoomobile',
    buildNumber: '1.0.0',
    supportsTablet: true,
    googleServicesFile: process.env.GOOGLE_SERVICES_INFOPLIST || './GoogleService-Info.plist',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSCameraUsageDescription: 'MyToDoo needs access to your camera to capture photos for task creation and profile pictures.',
      NSPhotoLibraryUsageDescription: 'MyToDoo needs access to your photo library to select images for tasks and profile pictures.',
      NSPhotoLibraryAddUsageDescription: 'MyToDoo needs permission to save photos to your photo library.',
      NSLocationWhenInUseUsageDescription: 'MyToDoo uses your location to show nearby tasks and provide location-based services.',
      NSLocationAlwaysUsageDescription: 'MyToDoo uses your location to show nearby tasks even when the app is in the background.',
      NSLocationAlwaysAndWhenInUseUsageDescription: 'MyToDoo uses your location to show nearby tasks and provide location-based services.',
      NSMicrophoneUsageDescription: 'MyToDoo needs access to your microphone for video recording features.',
      NSContactsUsageDescription: 'MyToDoo needs access to your contacts to help you connect with others.',
      NSCalendarsUsageDescription: 'MyToDoo needs access to your calendar to schedule tasks.',
      NSRemindersUsageDescription: 'MyToDoo needs access to your reminders to help you manage tasks.',
      UIBackgroundModes: ['location', 'fetch', 'remote-notification'],
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: false,
        NSExceptionDomains: {
          'mytodoo.com': {
            NSExceptionAllowsInsecureHTTPLoads: false,
            NSIncludesSubdomains: true,
            NSExceptionRequiresForwardSecrecy: true,
            NSExceptionMinimumTLSVersion: 'TLSv1.2',
          },
          'api.mytodoo.com': {
            NSExceptionAllowsInsecureHTTPLoads: false,
            NSIncludesSubdomains: true,
            NSExceptionRequiresForwardSecrecy: true,
            NSExceptionMinimumTLSVersion: 'TLSv1.2',
          },
        },
      },
    },
    associatedDomains: ['applinks:mytodoo.com', 'applinks:www.mytodoo.com'],
    usesAppleSignIn: false,
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
        ios: {
          deploymentTarget: '15.1',
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
        isIosBackgroundLocationEnabled: true,
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission: 'MyToDoo needs access to your camera to capture photos for task creation and profile pictures.',
      },
    ],
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme: process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME || 'com.googleusercontent.apps.YOUR_IOS_CLIENT_ID',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: 'ec4b349c-e90f-46a7-89c5-b1c6ad4bb769',
    },
    apiUrl: process.env.API_URL,
    easApiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.mytodoo.com/api',
    environment: process.env.ENVIRONMENT,
    mapboxAccessToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
    googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  },
});
