const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Optimize asset loading and configure SVG support
const assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.assetExts = [...assetExts, 'mp4', 'mov'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg', 'mjs'];

// Configure SVG transformer
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// Optimize bundle performance for production
config.transformer.minifierConfig = {
  compress: {
    drop_console: false,
  },
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;