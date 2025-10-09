import useInitialNotification from "@/hooks/useInitialNotification";
import useMessageToken from "@/hooks/useMessageToken";
import useNotification from "@/hooks/useNotification";
import useUser from "@/hooks/useUser"; // <-- Using the existing hook
import { SplashScreen, Stack } from "expo-router";
import type { JSX } from "react";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderButtonsProvider } from "react-navigation-header-buttons/HeaderButtonsProvider";

import AuthScreen from "./auth/AuthScreen";

void SplashScreen.preventAutoHideAsync();

const AuthenticatedAppProviders = (): JSX.Element => {
  useNotification();
  useMessageToken();
  useInitialNotification();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeaderButtonsProvider stackType={"native"}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ECEBEC" }}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="(modals)"
              options={{ presentation: "modal", headerShown: false }}
            />
          </Stack>
        </SafeAreaView>
      </HeaderButtonsProvider>
    </GestureHandlerRootView>
  );
};

export default function RootAuthLayout(): JSX.Element | null {
  const user = useUser();
  const isInitializing = user === undefined;

  useEffect(() => {
    if (!isInitializing) {
      void SplashScreen.hideAsync(); // Line 58
    }
  }, [isInitializing]);

  // 1. If still initializing (user is undefined), return null to keep the splash screen visible.
  if (isInitializing) {
    return null;
  }

  // 2. If the user is authenticated (user is a User object), render the main app.
  if (user) {
    return <AuthenticatedAppProviders />;
  }

  // 3. If the user is not authenticated (user is null), show the AuthScreen.
  return <AuthScreen />;
}
