import { initializeApp } from "@react-native-firebase/app";
import Constants from "expo-constants";
import "expo-router/entry";
import { Platform } from "react-native";
import { backgroundMessageHandler } from "./services/notification";
import "react-native-url-polyfill/auto";
import "react-native-get-random-values";

// https://github.com/expo/expo/issues/29757#issuecomment-2264715009
backgroundMessageHandler();

if (
  Platform.OS === "web" &&
  Constants.expoConfig?.extra?.["firebaseWebConfig"]
) {
  await initializeApp(Constants.expoConfig.extra["firebaseWebConfig"]);
}
