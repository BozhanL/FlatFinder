import HeaderLogo from "@/components/HeaderLogo";
import type { Flatmate } from "@/types/flatmate";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const user = auth().currentUser;
  const uid = user?.uid!;
  const [profile, setProfile] = useState<Flatmate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    //Lead to login page if unlogin
    if (!uid) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        const snap = await firestore().collection("users").doc(uid).get();
        if (!alive) return;

        const d = (snap.data() as any) ?? {};
        const fm: Flatmate = {
          id: snap.id,
          name: d.name ?? "Unnamed",
          age: d.age ?? undefined,
          bio: d.bio ?? "",
          budget: d.budget ?? 0,
          location: d.location,
          tags: Array.isArray(d.tags) ? d.tags : [],
        };
        setProfile(fm);
      } catch (e) {
        console.error("load profile failed:", e);
        setProfile(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [uid]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading…</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text>Profile not found</Text>
      </View>
    );
  }

  const avatar = require("../../../assets/images/react-logo.png"); //avatar place holder

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        {/* Logo */}
        <HeaderLogo />

        {/* Avatar and Edit Button */}
        <View style={{ alignItems: "center", marginTop: 8 }}>
          <View style={{ width: 148, height: 148 }}>
            <Image source={avatar} style={styles.avatar} />
            <TouchableOpacity
              style={styles.pencil}
              activeOpacity={0.9}
              onPress={() => router.push("/(modals)/edit-profile")}
            >
              <MaterialCommunityIcons name="pencil" size={18} color="#111" />
            </TouchableOpacity>
          </View>

          {/* Name and Age */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 12,
              gap: 6,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "700" }}>
              {profile.name}
              {profile.age ? `, ${profile.age}` : ""}
            </Text>
            <MaterialCommunityIcons
              name="star-circle"
              size={18}
              color="#d8d2d2ff"
            />
          </View>
        </View>

        {/* Menu Adding functionality in sprint 2??*/}
        <View style={{ marginTop: 24 }}>
          <MenuItem icon="star-outline" title="Watchlist" onPress={() => {}} />
          <MenuItem icon="cog-outline" title="Settings" onPress={() => {}} />
          <MenuItem
            icon="information-outline"
            title="About Us"
            onPress={() => {}}
          />
          <MenuItem icon="email-outline" title="Support" onPress={() => {}} />
        </View>

        {/* Sign out Button */}
        <View style={{ alignItems: "center", marginTop: 28 }}>
          <TouchableOpacity
            onPress={async () => {
              try {
                await auth().signOut();
                router.replace("/login");
              } catch (e) {
                Alert.alert("Sign out failed", String(e));
              }
            }}
            style={styles.signout}
            activeOpacity={0.8}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

//for future use
function MenuItem({
  icon,
  title,
  onPress,
}: {
  icon: any;
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.item} activeOpacity={0.7}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <MaterialCommunityIcons name={icon} size={20} color="#444" />
        <Text style={{ fontSize: 16 }}>{title}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  avatar: {
    width: 148,
    height: 148,
    borderRadius: 148 / 2,
    backgroundColor: "#eee",
  },
  pencil: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EDEDED",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D5D5D5",
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6E6E6",
    backgroundColor: "#fff",
  },
  signout: {
    backgroundColor: "#3C3C3C",
    paddingHorizontal: 28,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
