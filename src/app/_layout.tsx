// src/app/layout.tsx

import useInitialNotification from "@/hooks/useInitialNotification";
import useMessageToken from "@/hooks/useMessageToken";
import useNotification from "@/hooks/useNotification";
import useUser from "@/hooks/useUser"; // <-- NEWLY CREATED/USED HOOK
import { SplashScreen, Stack } from "expo-router";
import type { JSX } from "react";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderButtonsProvider } from "react-navigation-header-buttons/HeaderButtonsProvider";

// Assuming AuthScreen is in a sibling directory like './auth/AuthScreen'
import AuthScreen from "./auth/AuthScreen";

// Prevent the splash screen from auto-hiding immediately
void SplashScreen.preventAutoHideAsync();

// This component wraps the actual authenticated app content.
const AuthenticatedAppProviders = (): JSX.Element => {
  // These hooks only run if the user is authenticated (as per RootAuthLayout logic)
  useNotification();
  useMessageToken();
  useInitialNotification();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeaderButtonsProvider stackType={"native"}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ECEBEC" }}>
          {/* This Stack contains all authenticated routes like (tabs), (modals), etc. */}
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
  const user = useUser(); // Get authentication status
  const isInitializing = user === undefined;

  // 1. Hide the splash screen once we know the authentication state
  useEffect(() => {
    if (!isInitializing) {
      void SplashScreen.hideAsync();
    }
  }, [isInitializing]);

  // 2. If still initializing (user is undefined), return a loading component or null to keep splash visible.
  // Using an ActivityIndicator here provides a smooth transition while waiting for the state to resolve.
  if (isInitializing) {
    return (
      <View style={layoutStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // 3. If the user is authenticated (user is an object/truthy), render the main app.
  if (user) {
    return <AuthenticatedAppProviders />;
  }

  // 4. If the user is not authenticated (user is null/falsy), show the AuthScreen.
  return <AuthScreen />;
}

const layoutStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
