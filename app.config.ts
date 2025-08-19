import { ExpoConfig } from "expo/config";
import "tsx/cjs";

module.exports = ({ config }: { config: ExpoConfig }) => ({
  expo: {
    name: "FlatFinder",
    slug: "FlatFinder",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "flatfinder",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.flatfinder",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "./plugins/withAbiFilters.ts",
        {
          abiFilters: ["arm64-v8a", "armeabi-v7a"],
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "1fbbbe15-85bb-4bb8-a31f-620dd8ae462c",
      },
    },
    owner: "lbz",
  },
});
