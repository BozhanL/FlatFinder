import useInitialNotification from "@/hooks/useInitialNotification";
import useMessageToken from "@/hooks/useMessageToken";
import useNotification from "@/hooks/useNotification";
import useUser from "@/hooks/useUser"; // <-- Using the existing hook
import { SplashScreen, Stack } from "expo-router";
import type { JSX } from "react";
import { useEffect } from "react"; // Only need useEffect and not useState/auth imports
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderButtonsProvider } from "react-navigation-header-buttons/HeaderButtonsProvider";

import AuthScreen from "./auth/AuthScreen";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

/**
 * Component that wraps the main application routes with providers and hooks.
 */
const AuthenticatedAppProviders = (): JSX.Element => {
  // These hooks run only when the user is logged in and the main app is rendered.
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

/**
 * The single default export that handles authentication state and renders
 * either the main app or the auth screen. This now uses the useUser hook.
 */
export default function RootAuthLayout() {
  // Use the existing useUser hook.
  // user will be: undefined (loading), null (logged out), or User (logged in)
  const user = useUser();
  const isInitializing = user === undefined;

  // CRITICAL: This effect manages the splash screen visibility.
  // We only hide the splash screen once 'isInitializing' becomes false,
  // which indicates the hook has finished its initial Firebase check.
  useEffect(() => {
    if (!isInitializing) {
      SplashScreen.hideAsync();
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
