import HeaderLogo from "@/components/HeaderLogo";
import Segmented from "@/components/Segmented";
import { router } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const [mode, setMode] = useState(TabMode.Flatmates);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Logo */}
      <HeaderLogo />

      {/* Segmented & Filter Section */}
      <View
        style={{
          paddingHorizontal: 16,
          marginTop: 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Segmented */}
        <View style={{ flex: 1 }}>
          <Segmented
            options={[TabMode.Flatmates, TabMode.Properties]}
            onChange={(val) => setMode(val as TabMode)}
          />
        </View>

        {/* Filter buttons only, actual Content need to be added*/}
        <TouchableOpacity
          onPress={() => router.push("/filter")} // separated content page
          activeOpacity={0.8}
          style={{
            paddingHorizontal: 14,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#ECEBEC",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontWeight: "600" }}> Filter </Text>
        </TouchableOpacity>
      </View>

      {/* Main contents to be added*/}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {mode === TabMode.Flatmates ? (
          <View>
            <Text>Flatmate list </Text>
          </View>
        ) : (
          <View>
            <Text>Properties list </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const enum TabMode {
  Flatmates = "Flatmates",
  Properties = "Properties",
}
