import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 0,
          height: 65,
          backgroundColor: "#ECEBEC",
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontFamily: "Poppins_500Medium",
          fontSize: 9,
        },
        tabBarItemStyle: {
          marginHorizontal: 12,
          marginVertical: 8,
          borderRadius: 16,
          overflow: "hidden",
        },
        tabBarActiveBackgroundColor: "#DADADA",
        tabBarInactiveBackgroundColor: "transparent",
        tabBarActiveTintColor: "#111",
        tabBarInactiveTintColor: "#666",
        tabBarLabelPosition: "below-icon",
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => {
            return focused ? (
              <MaterialCommunityIcons
                name="home-variant"
                size={24}
                color={color}
              />
            ) : (
              <MaterialCommunityIcons
                name="home-variant-outline"
                size={24}
                color={color}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: "Message",
          tabBarIcon: ({ focused }) => {
            return focused ? (
              <MaterialCommunityIcons
                name="message-processing"
                size={24}
                color="black"
              />
            ) : (
              <MaterialCommunityIcons
                name="message-processing-outline"
                size={24}
                color="black"
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => {
            return focused ? (
              <MaterialCommunityIcons name="account" size={24} color="black" />
            ) : (
              <MaterialCommunityIcons
                name="account-outline"
                size={24}
                color="black"
              />
            );
          },
        }}
      />
    </Tabs>
  );
}
