import BudgetField from "@/components/profile/BudgetField";
import NZLocationPickerField from "@/components/profile/NZLocationPickerField";
import TagInputField from "@/components/profile/TagInputField";
import ProfilePreview from "@/components/ProfilePreview";
import useUser from "@/hooks/useUser";
import type { Flatmate } from "@/types/Flatmate";
import { formatDDMMYYYY, parseDDMMYYYY } from "@/utils/date";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from "@react-native-firebase/firestore";
import { useHeaderHeight } from "@react-navigation/elements";
import dayjs from "dayjs";
import { Stack } from "expo-router";
import { useEffect, useMemo, useState, type JSX } from "react";
import type { ImageSourcePropType } from "react-native";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as yup from "yup";

export const enum Tab {
  Edit = "Edit",
  Preview = "Preview",
}

type Draft = Omit<Partial<Flatmate>, "dob" | "location"> & {
  dob?: Timestamp | string | null;
  location?: string | null;
  avatarUrl?: string | null;
  name?: string | null;
};

type UserDocData = {
  name?: string | null;
  dob?: Timestamp | null;
  bio?: string | null;
  budget?: number | null;
  location?: string | null;
  tags?: unknown;
  avatarUrl?: string | null;
};

type FirestoreServerTimestamp = ReturnType<typeof serverTimestamp>;

type FirestorePayload = {
  name: string | null;
  dob: Timestamp | null;
  bio: string | null;
  budget: number | null;
  location: string | null;
  tags: string[];
  avatarUrl: string | null;
  lastActiveAt: FirestoreServerTimestamp;
};

function toDraft(uid: string, d?: UserDocData): Draft {
  const name: string = d?.name ?? "";
  const dob: Timestamp | null = d?.dob ?? null;
  const bio: string = d?.bio ?? "";
  const budget: number | null = d?.budget ?? null;
  const location: string = d?.location ?? "";
  const tags: string[] = Array.isArray(d?.tags) ? (d.tags as string[]) : [];
  const avatarUrl: string = d?.avatarUrl ?? "";

  const avatar: ImageSourcePropType = avatarUrl
    ? { uri: avatarUrl }
    : {
        uri: `https://ui-avatars.com/api/?background=EAEAEA&color=111&name=${encodeURIComponent(
          name || "U",
        )}`,
      };

  return {
    id: uid,
    name,
    dob,
    bio,
    budget,
    location,
    tags,
    avatar,
    avatarUrl,
  };
}

function dobToDateString(dob: Timestamp | string | null | undefined): string {
  if (!dob) return "";
  let date: dayjs.Dayjs;
  if (dob instanceof Timestamp) date = dayjs(dob.toDate());
  else date = dayjs(dob);

  return date.isValid() ? date.format("DD-MM-YYYY") : "";
}

function dateStringToTimestamp(dateStr: string): Timestamp | null {
  if (!dateStr) return null;
  const date = dayjs(dateStr, "DD-MM-YYYY");
  return date.isValid() ? Timestamp.fromDate(date.toDate()) : null;
}

function normalizeTag(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

function toFirestorePayload(x: Draft): FirestorePayload {
  const raw = Array.isArray(x.tags) ? x.tags : [];
  const tags = Array.from(new Set(raw.map(normalizeTag).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }),
  );

  return {
    name: x.name ?? null,
    dob: x.dob
      ? typeof x.dob === "string"
        ? dateStringToTimestamp(x.dob)
        : x.dob
      : null,
    bio: x.bio ?? null,
    budget: x.budget ?? null,
    location: x.location ?? null,
    tags,
    avatarUrl: x.avatarUrl ?? null,
    lastActiveAt: serverTimestamp(),
  };
}
async function isUsernameTaken(v: string, myUid: string): Promise<boolean> {
  const q = query(collection(getFirestore(), "users"), where("name", "==", v));
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

  dob: yup
    .string()
    .nullable()
    .test("valid-date", "Invalid date format (use DD-MM-YYYY)", (v) => {
      if (!v) return true;
      const parts = v.split("-");
      if (parts.length !== 3) return false;
      const [day, month, year] = parts.map(Number);
      if (!day || !month || !year) return false;
      const date = new Date(year, month - 1, day);
      return date instanceof Date && !isNaN(date.getTime());
    })
    .test("not-future", "Date of birth cannot be in the future", (v) => {
      if (!v) return true;
      const [dayStr, monthStr, yearStr] = v.split("-");
      const day = Number(dayStr) || 0;
      const month = Number(monthStr) || 0;
      const year = Number(yearStr) || 0;
      if (!day || !month || !year) return false;
      const date = new Date(year, month - 1, day);
      return date < new Date();
    }),

  budget: yup
    .number()
    .nullable()
    .transform((_, o) => {
      if (o == null || o === "") return null;
      const n = Number(String(o).replace(/[^\d]/g, ""));
      return Number.isFinite(n) ? n : null;
    })
    .integer("Budget must be an integer")
    .min(50, "Minimum is $50/week")
    .max(2000, "Maximum is $2000/week"),
  location: yup.string().nullable().max(80, "Location too long"),
  bio: yup.string().nullable().max(400, "Bio up to 400 chars"),
  tags: yup
    .array()
    .of(
      yup
        .string()
        .transform((v) => (typeof v === "string" ? normalizeTag(v) : ""))
        .max(16, "Tag too long")
        .matches(
          /^[a-z0-9](?:[a-z0-9 ]*[a-z0-9])?$/i,
          "Only letters, numbers, space",
        ),
    )
    .max(5, "Too many tags"),
});

/* -------------------------------------------- */

export default function EditProfileModal(): JSX.Element {
  const uid = useUser()?.uid;

  const [tab, setTab] = useState<Tab>(Tab.Edit);
  const [form, setForm] = useState<Draft | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  const [dobPickerOpen, setDobPickerOpen] = useState(false);

  const dobDisplay = useMemo(() => {
    if (!form?.dob) return "";
    if (form.dob instanceof Timestamp) return formatDDMMYYYY(form.dob.toDate());
    if (typeof form.dob === "string") return form.dob;
    return "";
  }, [form?.dob]);

  const dobInitialDate = useMemo(() => {
    if (form?.dob instanceof Timestamp) return form.dob.toDate();
    if (typeof form?.dob === "string")
      return parseDDMMYYYY(form.dob) ?? new Date(2000, 0, 1);
    return new Date(2000, 0, 1);
  }, [form?.dob]);

  useEffect(() => {
    if (!uid) {
      return;
    }

    const alive = { current: true };

    const run = async (): Promise<void> => {
      try {
        const snap = await getDoc(doc(getFirestore(), "users", uid));
        if (!alive.current) return;
        const d = toDraft(uid, snap.data() as UserDocData | undefined);
        setForm(d);
        setPhotos([d.avatarUrl || "", "", ""]);
      } catch (err) {
        console.error(err);
      }
    };

    void run();

    return (): void => {
      alive.current = false;
    };
  }, [uid]);

  const avatarSource: ImageSourcePropType | undefined = useMemo(
    () =>
      form?.avatarUrl
        ? { uri: form.avatarUrl }
        : (form?.avatar ?? {
            uri: "https://ui-avatars.com/api/?background=EAEAEA&color=111&name=U",
          }),
    [form?.avatarUrl, form?.avatar],
  );

  async function onSave(): Promise<void> {
    if (!uid || !form) return;

    try {
      const candidate = {
        name: form.name ?? "",
        dob: dobToDateString(form.dob) || null,
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
        doc(getFirestore(), "users", uid),
        toFirestorePayload({
          ...form,
          dob:
            typeof form.dob === "string"
              ? dateStringToTimestamp(form.dob)
              : (form.dob ?? null),
        }),
        { merge: true },
      );

      Alert.alert("Saved", "Your profile has been updated.");
      setTab(Tab.Preview);
    } catch (e: unknown) {
      const isYupValidationError =
        typeof e === "object" &&
        e !== null &&
        "name" in e &&
        (e as { name?: unknown }).name === "ValidationError";

      if (isYupValidationError) {
        const err = e as { errors?: unknown; message?: unknown };
        const msg = Array.isArray(err.errors)
          ? err.errors.join("\n")
          : typeof err.message === "string"
            ? err.message
            : "Invalid input";
        Alert.alert("Invalid input", msg);
      } else {
        Alert.alert("Save failed", e instanceof Error ? e.message : String(e));
      }
    }
  }

  const headerOffset = useHeaderHeight();

  if (!form) {
    return (
      <View style={styles.center}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen
        options={{
          title: "Profile",
          headerShown: true,
          headerRight: () => (
            <Text
              onPress={() => { void onSave(); }}
              style={{ color: "#6846FF", fontWeight: "700", fontSize: 16 }}
            >
              Save
            </Text>
          ),
        }}
      />

      {/* Tabs */}
      <View style={styles.tabs}>
        <TabButton
          label="Edit"
          active={tab === Tab.Edit}
          onPress={() => {
            setTab(Tab.Edit);
          }}
        />
        <TabButton
          label="Preview"
          active={tab === Tab.Preview}
          onPress={() => {
            setTab(Tab.Preview);
          }}
        />
      </View>

      {tab === Tab.Edit ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="height"
          keyboardVerticalOffset={headerOffset || 0}
        >
          <FlatList
            data={[0]}
            keyExtractor={() => "form"}
            renderItem={() => null}
            ListHeaderComponent={
              <>
                {/* Photos */}
                <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: "700" }}>
                    Photos{" "}
                    <Text style={{ fontSize: 12, color: "#777" }}>
                      (Maximum of 3)
                    </Text>
                  </Text>
                  {/* TODO: actual avatar upload */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 16,
                      marginTop: 12,
                    }}
                  >
                    <TouchableOpacity activeOpacity={0.8}>
                      <Image source={avatarSource} style={styles.bigAvatar} />
                    </TouchableOpacity>

                    <View style={{ gap: 12 }}>
                      <View style={{ flexDirection: "row", gap: 12 }}>
                        <CircleThumb
                          uri={photos[1] ?? ""}
                          onPress={() => void 0}
                        />
                        <CircleThumb
                          uri={photos[2] ?? ""}
                          onPress={() => void 0}
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.addCircle}
                        onPress={() => void 0}
                        activeOpacity={0.8}
                      >
                        <MaterialCommunityIcons
                          name="plus"
                          size={22}
                          color="#555"
                        />
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
                    onChangeText={(t) => {
                      setForm((prev) =>
                        prev ? { ...prev, name: t.trim() } : prev,
                      );
                    }}
                  />
                  {/* Date of Birth */}
                  <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        marginBottom: 8,
                      }}
                    >
                      Date of Birth
                    </Text>

                    <TouchableOpacity
                      onPress={() => {
                        setDobPickerOpen(true);
                      }}
                      activeOpacity={0.8}
                      style={styles.input}
                    >
                      <Text style={{ color: dobDisplay ? "#111" : "#999" }}>
                        {dobDisplay || "DD-MM-YYYY"}
                      </Text>
                    </TouchableOpacity>

                    <DateTimePickerModal
                      isVisible={dobPickerOpen}
                      mode="date"
                      date={dobInitialDate}
                      maximumDate={new Date()}
                      minimumDate={new Date(1900, 0, 1)}
                      onConfirm={(date) => {
                        const str = formatDDMMYYYY(date);
                        setForm((prev) =>
                          prev ? { ...prev, dob: str } : prev,
                        );
                        setDobPickerOpen(false);
                      }}
                      onCancel={() => {
                        setDobPickerOpen(false);
                      }}
                    />
                  </View>

                  {/* Budget */}
                  <BudgetField
                    value={form.budget ?? null}
                    onChange={(n) => {
                      setForm((prev) => (prev ? { ...prev, budget: n } : prev));
                    }}
                    min={50}
                    max={2000}
                    step={10}
                  />

                  {/* Preferred Location */}
                  <NZLocationPickerField
                    value={form.location ?? ""}
                    onChange={(loc) => {
                      setForm((prev) =>
                        prev ? { ...prev, location: loc } : prev,
                      );
                    }}
                  />

                  {/* Tag */}
                  <TagInputField
                    value={form.tags ?? []}
                    onChange={(tags) => {
                      setForm((prev) => (prev ? { ...prev, tags } : prev));
                    }}
                  />

                  {/* Bio */}
                  <FieldInput
                    label="Bio"
                    placeholder="Tell the world about YOU.."
                    value={form.bio ?? ""}
                    onChangeText={(t) => {
                      setForm((prev) => (prev ? { ...prev, bio: t } : prev));
                    }}
                    multiline
                  />
                </View>
              </>
            }
          />
        </KeyboardAvoidingView>
      ) : (
        <ProfilePreview
          source="data"
          data={{
            id: form.id ?? "unknown",
            name: form.name ?? "Unnamed",
            dob:
              form.dob instanceof Timestamp
                ? form.dob
                : typeof form.dob === "string" && form.dob
                  ? dateStringToTimestamp(form.dob)
                  : null,
            ...(form.bio ? { bio: form.bio } : {}),
            ...(form.budget != null ? { budget: form.budget } : {}),
            ...(form.location ? { location: form.location } : {}),
            ...(Array.isArray(form.tags) && form.tags.length > 0
              ? { tags: form.tags }
              : {}),
            ...(form.avatarUrl
              ? { avatar: { uri: form.avatarUrl }, avatarUrl: form.avatarUrl }
              : {
                  avatar:
                    form.avatar ??
                    ({
                      uri: "https://ui-avatars.com/api/?background=EAEAEA&color=111&name=U",
                    } as ImageSourcePropType),
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
}): JSX.Element {
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

function CircleThumb({
  uri,
  onPress,
}: {
  uri?: string;
  onPress: () => void;
}): JSX.Element {
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
}): JSX.Element {
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
