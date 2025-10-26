import { initializeApp } from "@react-native-firebase/app";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
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

// Configure Google Sign-In
// It is safe to assume the configuration object exists in app.config.ts
// Because this software needs this ID, and should stop if not exist
GoogleSignin.configure({
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  webClientId: Constants.expoConfig!.extra!["googleWebClientId"],
});
