/**
 * Metro Bundler Internal Bytecode File
 * This file is used by Metro bundler for symbolication and debugging
 */

// Empty module to prevent Metro bundler errors
module.exports = {};

// Add error handling for symbolication
if (typeof global !== 'undefined' && global.__DEV__) {
  // Development mode - provide minimal symbolication support
  global.__fbBatchedBridge = global.__fbBatchedBridge || {};
}