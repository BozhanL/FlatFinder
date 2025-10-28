import { router, useLocalSearchParams, useRootNavigationState } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function PropertyRedirectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Only attempt navigation once the router is ready
    if (!navigationState?.key) return;

    if (id) {
      console.log(`Deep Link matched /property/${id}. Redirecting to modal...`);
      router.replace({
        pathname: "/property", 
        params: { id: id },
      });
    } else {
      // Handle case where ID is missing or deep link is malformed
      console.error("Missing property ID in deep link. Navigating to home.");
      router.replace("/");
    }
  }, [id, navigationState?.key]);

  // Show a basic loading indicator while the redirect happens
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}
