/* istanbul ignore file */
// This file contains only type definitions.
// No need to test it in unit tests.
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "modal",
      }}
    />
  );
}
