import useInitialNotification from "@/hooks/useInitialNotification";
import useMessageToken from "@/hooks/useMessageToken";
import useNotification from "@/hooks/useNotification";
import { Stack } from "expo-router";
import type { JSX } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderButtonsProvider } from "react-navigation-header-buttons/HeaderButtonsProvider";

import auth from '@react-native-firebase/auth';
import { Slot, SplashScreen } from 'expo-router';
import { useEffect, useState } from 'react';
import AuthScreen from './auth/AuthScreen';

export default function RootLayout(): JSX.Element {
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
}


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const AppLayout = () => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) {
      setInitializing(false);
      SplashScreen.hideAsync();
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) {
    return null;
  }

  // If the user is authenticated, render the main app content.
  if (user) {
    return <Slot />;
  }

  // If the user is not authenticated, show the AuthScreen.
  return <AuthScreen />;
};

export default AppLayout;
