import useInitialNotification from "@/hooks/useInitialNotification";
import useMessageToken from "@/hooks/useMessageToken";
import useNotification from "@/hooks/useNotification";
import { initializeApp } from "@react-native-firebase/app";
import { Stack } from "expo-router";
import { JSX } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

if (Platform.OS === "web") {
  const firebaseConfig = {
    apiKey: "AIzaSyCQ-uqsWqjm2GL9OazJS-sBBIu5_oES_zM",
    authDomain: "flatfinder-5b5c8.firebaseapp.com",
    databaseURL:
      "https://flatfinder-5b5c8-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "flatfinder-5b5c8",
    storageBucket: "flatfinder-5b5c8.firebasestorage.app",
    messagingSenderId: "245824951682",
    appId: "1:245824951682:web:793a4dda12802980ba6b9b",
    measurementId: "G-5XEP9G2HN9",
  };

  initializeApp(firebaseConfig);
}

export default function RootLayout(): JSX.Element {
  useNotification();
  useMessageToken();
  useInitialNotification();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaView style={{ backgroundColor: "#ECEBEC" }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(modals)"
          options={{ presentation: "modal", headerShown: false }}
        />
      </Stack>
    </SafeAreaView>
    </GestureHandlerRootView>
  );
}
