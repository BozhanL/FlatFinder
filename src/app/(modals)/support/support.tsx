import useUser from "@/hooks/useUser";
import { TicketStatus } from "@/types/TicketStatus";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import { Stack, router } from "expo-router";
import React, { useEffect, useMemo, useState, type JSX } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SupportModal(): JSX.Element {
  const user = useUser();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email ?? "");
    }
  }, [user]);

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      title.trim().length > 0 &&
      message.trim().length > 0
    );
  }, [name, email, title, message]);

  async function handleSubmit(): Promise<void> {
    if (!canSubmit) {
      Alert.alert("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(getFirestore(), "support_tickets"), {
        createdAt: serverTimestamp(),
        status: TicketStatus.Open,
        uid: user?.uid ?? null,
        name: name.trim(),
        email: email.trim(),
        title: title.trim(),
        message: message.trim(),
      });

      Alert.alert(
        "Ticket Submitted",
        "Your ticket has been created successfully.",
        [
          {
            text: "Close",
            style: "cancel",
            onPress: (): void => {
              router.back();
            },
          },
          {
            text: "View Tickets",
            onPress: (): void => {
              router.push("/support/support-history");
            },
          },
        ],
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert("Submit failed", msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          presentation: "modal",
          title: "Support",
          headerShadowVisible: true,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1, backgroundColor: "#fff" }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Name</Text>
          <TextInput
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Title</Text>
          <TextInput
            placeholder="What do you need help with?"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            autoCapitalize="sentences"
          />

          <Text style={styles.label}>Details</Text>
          <TextInput
            placeholder="Please provide as much detail as possible..."
            value={message}
            onChangeText={setMessage}
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <View style={{ height: 16 }} />

          <TouchableOpacity
            testID="submit-btn"
            disabled={!canSubmit || submitting}
            onPress={() => {
              void handleSubmit();
            }}
            activeOpacity={0.85}
            style={[
              styles.submitBtn,
              (!canSubmit || submitting) && { opacity: 0.6 },
            ]}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {submitting ? "Submitting…" : "Submit"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 8 }} />
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
            style={styles.cancelBtn}
            activeOpacity={0.85}
          >
            <Text style={{ color: "#111", fontWeight: "600" }}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              router.push("/support/support-history");
            }}
            style={[styles.cancelBtn, { marginTop: 8 }]}
            activeOpacity={0.85}
          >
            <Text style={{ color: "#111", fontWeight: "600" }}>
              View my tickets
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    color: "#444",
    marginBottom: 6,
    marginTop: 12,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E3E3E3",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    fontSize: 15,
  },
  textArea: {
    minHeight: 140,
  },
  submitBtn: {
    backgroundColor: "#111",
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F1F1",
  },
});
