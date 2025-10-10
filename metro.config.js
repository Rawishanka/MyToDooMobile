const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add custom configuration to handle symbolication issues
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Improve error handling and symbolication
config.transformer.minifierConfig = {
  keep_classnames: true,
  keep_fnames: true,
  mangle: {
    keep_classnames: true,
    keep_fnames: true,
  },
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