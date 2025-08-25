import { Stack } from "expo-router";
import { Text, View } from "react-native";

export default function FilterScreen() {
  return (
    <>
      <Stack.Screen
        options={{ headerShown: true, title: "Filter", presentation: "modal" }}
      />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Filter Page</Text>
      </View>
    </>
  );
}
