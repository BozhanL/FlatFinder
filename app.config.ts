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
    googleServicesFile: "./google-services.json",
    permissions: ["android.permission.POST_NOTIFICATIONS"],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "@react-native-firebase/app",
    "@react-native-firebase/auth",
    "@maplibre/maplibre-react-native",
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
      "./plugins/withAbiFilters.ts",
      {
        abiFilters: ["arm64-v8a", "x86_64"],
      },
    ],
    [
      "./plugins/withGradlePropertiesWhenCI",
      {
        gradle_properties: [
          {
            key: "org.gradle.jvmargs",
            value: "-Xmx14g -XX:MaxMetaspaceSize=512m",
          },
          {
            key: "org.gradle.parallel",
            value: "true",
          },
          {
            key: "org.gradle.configureondemand",
            value: "true",
          },
          {
            key: "org.gradle.daemon",
            value: "false",
          },
        ],
        ci_environment: "CI",
      },
    ],
    [
      "expo-font",
      {
        fonts: [
          "node_modules/@expo-google-fonts/playfair-display/700Bold/PlayfairDisplay_700Bold.ttf",
          "node_modules/@expo-google-fonts/poppins/500Medium/Poppins_500Medium.ttf",
          "node_modules/@expo-google-fonts/poppins/600SemiBold/Poppins_600SemiBold.ttf",
          "node_modules/@expo-google-fonts/roboto/400Regular/Roboto_400Regular.ttf",
          "node_modules/@expo-google-fonts/roboto/500Medium/Roboto_500Medium.ttf",
        ],
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          extraMavenRepos: [
            // https://github.com/invertase/notifee/issues/1226#issuecomment-3228701613
            "$rootDir/../../../node_modules/@notifee/react-native/android/libs",
          ],
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});
