/* istanbul ignore file */
// It only provides navigation without containing any business or testable logic.
// No need to test it in unit tests.
import { Stack } from "expo-router";
import type { JSX } from "react";

export default function RootLayout(): JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "modal",
      }}
    />
  );
}
