module.exports = function (api) {
  const isTest = api.env("test");
  api.cache(true);

  const presets = [
    ["babel-preset-expo", { jsxImportSource: "nativewind" }]
  ];

  if (!isTest) {
    presets.push("nativewind/babel");
  }

  return {
    presets,
    plugins: [
      "react-native-worklets/plugin",
    ].filter(Boolean),
  };
};

