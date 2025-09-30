/*
import { initializeApp } from "@react-native-firebase/app";
import { Stack } from "expo-router";
import { Platform } from "react-native";

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
*/



/*

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

*/

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
