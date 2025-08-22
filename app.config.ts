import { ConfigContext, ExpoConfig } from "expo/config";
import "tsx/cjs";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
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
        abiFilters: ["arm64-v8a", "x86_64"],
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
    [
      "expo-font",
      {
        fonts: [
          "node_modules/@expo-google-fonts/playfair-display/700Bold/PlayfairDisplay_700Bold.ttf",
          "node_modules/@expo-google-fonts/poppins/500Medium/Poppins_500Medium.ttf",
          "node_modules/@expo-google-fonts/poppins/600SemiBold/Poppins_600SemiBold.ttf",
        ],
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});
