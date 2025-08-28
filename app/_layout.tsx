import firebaseConfig from "@/firebaseConfig";
import { initializeApp } from "@react-native-firebase/app";
import { Stack } from "expo-router";
import { Platform } from "react-native";

if (Platform.OS === "web") {
  initializeApp(firebaseConfig);
}

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(modals)"
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack>
  );
}
