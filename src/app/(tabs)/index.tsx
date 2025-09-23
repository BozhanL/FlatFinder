import HeaderLogo from "@/components/HeaderLogo";
import Segmented from "@/components/Segmented";
import SwipeDeck from "@/components/SwipeDeck";
import { useCandidates } from "@/hooks/useCandidates";
import { ensureMatchIfMutualLike, swipe } from "@/services/swipe";
import { getApp } from "@react-native-firebase/app";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const auth = getAuth(getApp());

const enum TabMode {
  Flatmates = "Flatmates",
  Properties = "Properties",
}

export default function Index() {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);
  const [authChecking, setAuthChecking] = useState(true);
  const [mode, setMode] = useState(TabMode.Flatmates);

  //Check Authentication State
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
      setAuthChecking(false);
    });
    return unsub;
  }, []);

  //Lead to login page if unlogin
  useEffect(() => {
    if (!authChecking && !uid) {
      router.replace("/login");
    }
  }, [authChecking, uid]);

  const { items, loading, setItems } = useCandidates(uid);

  //Loading condition
  if (authChecking || (!uid && !loading))
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Loading…</Text>
      </View>
    );

  if (!uid) return null;

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

      <View style={{ flex: 1, position: "relative" }}>
        {mode === TabMode.Flatmates ? (
          <SwipeDeck
            data={items}
            onLike={async (u) => {
              await swipe(uid, u.id, "like");
              await ensureMatchIfMutualLike(uid, u.id);
              setItems((prev) => prev.filter((x) => x.id !== u.id));
            }}
            onPass={async (u) => {
              await swipe(uid, u.id, "pass");
              setItems((prev) => prev.filter((x) => x.id !== u.id));
            }}
          />
        ) : (
          <View>
            <Text>Properties list </Text>
          </View>
        )}
      </View>
    </View>
  );
}
