import BlockedList from "@/components/block/BlockedList";
import { Stack } from "expo-router";
import type { JSX } from "react";

export default function BlockedListPage(): JSX.Element {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Blocked Users",
          presentation: "modal",
        }}
      />

      <BlockedList />
    </>
  );
}
