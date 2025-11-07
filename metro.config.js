const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add custom configuration to handle symbolication issues
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Optimize bundle performance
config.transformer.minifierConfig = {
  keep_classnames: true,
  keep_fnames: true,
  mangle: {
    keep_classnames: true,
    keep_fnames: true,
  },
};

// Improve development performance
config.transformer.enableBabelRCLookup = false;
config.transformer.cacheVersion = '1.0';

// Optimize asset loading and configure SVG support
const assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.assetExts = [...assetExts, 'mp4', 'mov'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

// Configure SVG transformer
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// Enable faster refresh
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, server) => {
    return middleware;
  }
};

// Handle missing source maps gracefully
config.symbolicator = {
  customizeFrame: (frame) => {
    if (frame.file === 'InternalBytecode.js') {
      return null; // Skip InternalBytecode.js frames
    }
    return frame;
  }
};

module.exports = config;