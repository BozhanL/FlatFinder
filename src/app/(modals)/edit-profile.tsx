import ProfilePreview from "@/components/ProfilePreview";
import type { Flatmate } from "@/types/flatmate";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "@react-native-firebase/firestore";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as yup from "yup";

const app = getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export enum Tab {
  Edit = "Edit",
  Preview = "Preview",
}

type Draft = Omit<Partial<Flatmate>, "age" | "budget" | "location"> & {
  age?: number | null;
  budget?: number | null;
  location?: string | null;
  avatarUrl?: string;
  name?: string;
};

function toDraft(uid: string, d: any): Draft {
  return {
    id: uid,
    name: d?.name ?? "",
    age: d?.age ?? undefined,
    bio: d?.bio ?? "",
    budget: d?.budget ?? undefined,
    location: d?.location ?? "",
    tags: Array.isArray(d?.tags) ? d.tags : [],
    avatar: d?.avatarUrl
      ? { uri: d.avatarUrl }
      : {
          uri: `https://ui-avatars.com/api/?background=EAEAEA&color=111&name=${encodeURIComponent(
            d?.name ?? "U",
          )}`,
        },
    avatarUrl: d?.avatarUrl ?? "",
  };
}

function toFirestorePayload(x: Draft) {
  return {
    name: x.name ?? null,
    age: x.age ?? null,
    bio: x.bio ?? null,
    budget: x.budget ?? null,
    location: x.location ?? null,
    tags: x.tags ?? [],
    avatarUrl: x.avatarUrl ?? null,
    lastActiveAt: serverTimestamp(),
  };
}

async function isUsernameTaken(v: string, myUid: string) {
  const q = query(collection(db, "users"), where("name", "==", v));
  const snap = await getDocs(q);
  const first = snap.docs.at(0);
  return !!first && first.id !== myUid;
}

/* ---------------- Yup schema ---------------- */
const usernameRegex = /^[a-zA-Z0-9._]{3,20}$/;

const draftSchema = yup.object({
  name: yup
    .string()
    .required("Username cannot be empty")
    .matches(usernameRegex, "3-20 characters, letters/numbers/._ only")
    .test("no-edge-dot-underscore", "Cannot start or end with . or _", (v) =>
      v ? !/^[._]/.test(v) && !/[._]$/.test(v) : false,
    ),
  age: yup
    .number()
    .nullable()
    .transform((_, o) => (o === "" || o == null ? null : Number(o))),

  budget: yup
    .number()
    .nullable()
    .transform((_, o) => (o === "" || o == null ? null : Number(o)))
    .min(0, "Budget must be ≥ 0")
    .max(100000, "Budget looks wrong"),
  location: yup.string().nullable().max(80, "Location too long"),
  bio: yup.string().nullable().max(400, "Bio up to 400 chars"),
  tags: yup.array(yup.string().trim()).max(5, "Too many tags"),
});
/* -------------------------------------------- */

export default function EditProfileModal() {
  const uid = auth.currentUser?.uid ?? null;

  const [tab, setTab] = useState<Tab>(Tab.Edit);
  const [form, setForm] = useState<Draft | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (!uid) {
      router.replace("/login");
      return;
    }
    let alive = true;
    (async () => {
      const snap = await getDoc(doc(db, "users", uid));
      if (!alive) return;
      const d = toDraft(uid, snap.data());
      setForm(d);
      setPhotos([d.avatarUrl ?? "", "", ""]);
    })().catch(console.error);
    return () => {
      alive = false;
    };
  }, [uid]);

  const avatarSource = useMemo(
    () =>
      form?.avatarUrl
        ? { uri: form.avatarUrl }
        : (form?.avatar ?? {
            uri: "https://ui-avatars.com/api/?background=EAEAEA&color=111&name=U",
          }),
    [form?.avatarUrl, form?.avatar],
  );

  async function onSave() {
    if (!uid || !form) return;

    try {
      const candidate = {
        name: form.name ?? "",
        age: form.age ?? null,
        budget: form.budget ?? null,
        location: form.location ?? null,
        bio: form.bio ?? null,
        tags: form.tags ?? [],
      };
      await draftSchema.validate(candidate, { abortEarly: false });

      if (await isUsernameTaken(candidate.name, uid)) {
        Alert.alert("Username taken", "Try another one.");
        return;
      }

      await setDoc(
        doc(db, "users", uid),
        toFirestorePayload({ ...form, name: candidate.name }),
        { merge: true },
      );

      Alert.alert("Saved", "Your profile has been updated.");
      setTab(Tab.Preview);
    } catch (e: any) {
      if (e?.name === "ValidationError") {
        const msg = Array.isArray(e.errors)
          ? e.errors.join("\n")
          : String(e.message);
        Alert.alert("Invalid input", msg);
      } else {
        Alert.alert("Save failed", String(e));
      }
    }
  }

  if (!form)
    return (
      <View style={styles.center}>
        <Text>Loading…</Text>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Profile</Text>
        {tab === Tab.Edit ? (
          <TouchableOpacity onPress={onSave} style={{ padding: 8 }}>
            <Text style={{ color: "#6B46FF", fontWeight: "700" }}>Save</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TabButton
          label="Edit"
          active={tab === Tab.Edit}
          onPress={() => setTab(Tab.Edit)}
        />
        <TabButton
          label="Preview"
          active={tab === Tab.Preview}
          onPress={() => setTab(Tab.Preview)}
        />
      </View>

      {tab === Tab.Edit ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
          {/* Photos */}
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>
              Photos{" "}
              <Text style={{ fontSize: 12, color: "#777" }}>
                (Maximum of 3)
              </Text>
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                marginTop: 12,
              }}
            >
              <TouchableOpacity activeOpacity={0.8}>
                <Image source={avatarSource as any} style={styles.bigAvatar} />
              </TouchableOpacity>

              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <CircleThumb uri={photos[1] ?? ""} onPress={() => {}} />
                  <CircleThumb uri={photos[2] ?? ""} onPress={() => {}} />
                </View>
                <TouchableOpacity
                  style={styles.addCircle}
                  onPress={() => {}}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="plus" size={22} color="#555" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* About me */}
          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionTitle}>About me</Text>

            {/* Username */}
            <FieldInput
              label="Username"
              value={form.name ?? ""}
              placeholder="yourname"
              onChangeText={(t) => setForm((p) => ({ ...p!, name: t.trim() }))}
            />
            {/* Age */}
            <FieldInput
              label="Age"
              value={form.age != null ? String(form.age) : ""}
              onChangeText={(t) =>
                setForm((p) => ({
                  ...p!,
                  age: t.trim() ? Number(t) : null,
                }))
              }
              keyboardType="numeric"
            />

            {/* Budget */}
            <FieldInput
              label="Budget"
              value={form.budget != null ? String(form.budget) : ""}
              onChangeText={(t) =>
                setForm((p) => ({
                  ...p!,
                  budget: t.trim() ? Number(t) : null,
                }))
              }
              keyboardType="numeric"
            />

            {/* Preferred Location */}
            <FieldInput
              label="Preferred Location"
              value={form.location ?? ""}
              onChangeText={(t) =>
                setForm((p) => ({
                  ...p!,
                  location: t.trim() || null,
                }))
              }
            />

            {/* Tag */}
            <FieldInput
              label="Tag"
              value={(form.tags ?? []).join(", ")}
              placeholder="e.g. student, cat lover"
              onChangeText={(t) =>
                setForm((p) => ({
                  ...p!,
                  tags: t
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                }))
              }
            />

            {/* Bio */}
            <FieldInput
              label="Bio"
              placeholder="Tell the world about YOU.."
              value={form.bio ?? ""}
              onChangeText={(t) => setForm((p) => ({ ...p!, bio: t }))}
              multiline
            />
          </View>
        </ScrollView>
      ) : (
        <ProfilePreview
          source="data"
          data={{
            id: form.id!,
            name: form.name ?? "Unnamed",
            ...(form.age != null ? { age: form.age } : {}),
            ...(form.bio ? { bio: form.bio } : {}),
            ...(form.budget != null ? { budget: form.budget } : {}),
            ...(form.location ? { location: form.location } : {}),
            ...(form.tags && form.tags.length ? { tags: form.tags } : {}),
            ...(form.avatarUrl
              ? { avatar: { uri: form.avatarUrl }, avatarUrl: form.avatarUrl }
              : {
                  avatar:
                    form.avatar ??
                    ({
                      uri: "https://ui-avatars.com/api/?background=EAEAEA&color=111&name=U",
                    } as const),
                  avatarUrl: null,
                }),
          }}
        />
      )}
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.tabBtn}
      activeOpacity={0.8}
    >
      <Text style={[styles.tabText, active && { color: "#6B46FF" }]}>
        {label}
      </Text>
      <View
        style={[styles.tabUnderline, active && { backgroundColor: "#6B46FF" }]}
      />
    </TouchableOpacity>
  );
}

function CircleThumb({ uri, onPress }: { uri?: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Image
        source={
          uri
            ? { uri }
            : {
                uri: "https://ui-avatars.com/api/?background=EAEAEA&color=111&name=+",
              }
        }
        style={styles.smallAvatar}
      />
    </TouchableOpacity>
  );
}

function FieldInput({
  label,
  value,
  placeholder,
  onChangeText,
  keyboardType = "default",
  multiline = false,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChangeText: (t: string) => void;
  keyboardType?: "default" | "numeric";
  multiline?: boolean;
}) {
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
      <Text style={{ fontSize: 14, fontWeight: "700", marginBottom: 8 }}>
        {label}
      </Text>
      <TextInput
        placeholder={placeholder ?? label}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[
          styles.input,
          multiline && { height: 110, textAlignVertical: "top" },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  topbar: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#E8E8E8",
  },
  topTitle: { fontSize: 18, fontWeight: "700" },
  tabs: {
    flexDirection: "row",
    gap: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  tabBtn: { alignItems: "center" },
  tabText: { fontSize: 14, fontWeight: "700", color: "#999" },
  tabUnderline: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: "transparent",
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
  },
  bigAvatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "#eee",
  },
  smallAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#eee",
  },
  addCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#D7D7D7",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F2F2",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
});
