import HeaderLogo from "@/components/HeaderLogo";
import useUser from "@/hooks/useUser";
import { logout } from "@/services/logout";
import type { Flatmate } from "@/types/Flatmate";
import { calculateAge } from "@/utils/date";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  doc,
  getFirestore,
  onSnapshot,
  Timestamp,
} from "@react-native-firebase/firestore";
import { router } from "expo-router";
import { useEffect, useState, type JSX } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type UserDocData = {
  name?: string;
  dob?: Timestamp;
  bio?: string;
  budget?: number;
  location?: string;
  tags?: unknown;
};

export default function Profile(): JSX.Element {
  const user = useUser();
  const [profile, setProfile] = useState<Flatmate | null>(null);
  const [loading, setLoading] = useState(true);

  const uid = user?.uid;

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const ref = doc(getFirestore(), "users", uid);
    setLoading(true);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        const d = (snap.data() as UserDocData | undefined) ?? {};
        setProfile({
          id: snap.id,
          name: d.name ?? "Unnamed",
          dob: d.dob ?? null,
          bio: d.bio ?? "",
          budget: d.budget ?? 0,
          location: d.location ?? "",
          tags: Array.isArray(d.tags) ? (d.tags as string[]) : [],
        });
        setLoading(false);
      },
      (err) => {
        console.error("profile onSnapshot error:", err);
        setLoading(false);
      },
    );

    return unsub;
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

  // avatar place holder

  const avatar = require("../../../assets/images/react-logo.png");

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
              testID="edit-btn"
              style={styles.pencil}
              activeOpacity={0.9}
              onPress={() => {
                router.push("/edit-profile");
              }}
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
              {profile.name + ", "}
              {profile.dob ? calculateAge(profile.dob) : ""}
            </Text>
            <MaterialCommunityIcons
              name="star-circle"
              size={18}
              color="#d8d2d2ff"
            />
          </View>
        </View>

        {/* Menu */}
        <View style={{ marginTop: 24 }}>
          <MenuItem
            icon="star-outline"
            title="Watchlist"
            onPress={() => undefined}
          />
          <MenuItem
            icon="cog-outline"
            title="Settings"
            onPress={() => undefined}
          />
          <MenuItem
            icon="information-outline"
            title="About Us"
            onPress={() => undefined}
          />
          <MenuItem
            icon="email-outline"
            title="Support"
            onPress={() => {
              router.push("/(modals)/support/support");
            }}
          />
        </View>

        {/* Sign out Button */}
        <View style={{ alignItems: "center", marginTop: 28 }}>
          <TouchableOpacity
            testID="signout-btn"
            onPress={() => {
              logout().catch((e: unknown) => {
                const msg = e instanceof Error ? e.message : String(e);
                Alert.alert("Sign out failed", msg);
              });
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

function MenuItem({
  icon,
  title,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  onPress: () => void;
}): JSX.Element {
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
