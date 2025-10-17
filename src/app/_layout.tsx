import useInitialNotification from "@/hooks/useInitialNotification";
import useMessageToken from "@/hooks/useMessageToken";
import useNotification from "@/hooks/useNotification";
import useUser from "@/hooks/useUser";
import { SplashScreen, Stack } from "expo-router";
import { useEffect, type JSX } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderButtonsProvider } from "react-navigation-header-buttons/HeaderButtonsProvider";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout(): JSX.Element | null {
  const user = useUser();
  useNotification();
  useMessageToken();
  useInitialNotification();

  useEffect(() => {
    if (user !== undefined) {
      SplashScreen.hide();
    }
  }, [user]);

  if (user === undefined) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeaderButtonsProvider stackType={"native"}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ECEBEC" }}>
          <Stack>
            {/* True if not logged in */}
            <Stack.Protected guard={!user}>
              <Stack.Screen
                name="auth/AuthScreen"
                options={{ headerShown: false }}
              />
            </Stack.Protected>

            {/* True if logged in */}
            <Stack.Protected guard={!!user}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="(modals)"
                options={{ presentation: "modal", headerShown: false }}
              />
            </Stack.Protected>
          </Stack>
        </SafeAreaView>
      </HeaderButtonsProvider>
    </GestureHandlerRootView>
  );
}
