//code i need to overwrite in comments
import { Stack } from "expo-router";

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

/*

import auth from '@react-native-firebase/auth';
import { Slot, SplashScreen } from 'expo-router';
import { useEffect, useState } from 'react';
import AuthScreen from './auth/AuthScreen';

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
*/