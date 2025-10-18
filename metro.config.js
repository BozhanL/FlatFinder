// https://github.com/invertase/react-native-firebase/issues/7921#issuecomment-3102680871
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = [...(config.resolver.sourceExts || []), "cjs"];

const webShims = {
  "@react-native-firebase/app": "firebase/app",
  "@react-native-firebase/auth": "firebase/auth",
  "@react-native-firebase/analytics": "firebase/analytics",
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web") {
    for (const [module, replacement] of Object.entries(webShims)) {
      if (moduleName === module) {
        return {
          filePath: require.resolve(replacement),
          type: "sourceFile",
        };
      }
    }
  }

  // Ensure you call the default resolver.
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
