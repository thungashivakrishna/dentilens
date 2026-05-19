module.exports = function (api) {
  const isTest = api.env("test");
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      !isTest ? "nativewind/babel" : null,
      "react-native-worklets/plugin",
    ].filter(Boolean),
  };
};
