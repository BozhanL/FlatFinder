import useInitialNotification from "@/hooks/useInitialNotification";
import useMessageToken from "@/hooks/useMessageToken";
import useNotification from "@/hooks/useNotification";
import { Stack } from "expo-router";
import { JSX } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout(): JSX.Element {
  useNotification();
  useMessageToken();
  useInitialNotification();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ECEBEC" }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(modals)"
          options={{ presentation: "modal", headerShown: false }}
        />
      </Stack>
    </SafeAreaView>
  );
}
