module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo', // Expo's Babel preset
    ],
    plugins: [
      'react-native-reanimated/plugin', // Needed for react-native-reanimated
    ],
  };
};
