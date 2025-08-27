const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for TypeScript files
config.resolver.sourceExts.push('ts', 'tsx');

module.exports = config; 