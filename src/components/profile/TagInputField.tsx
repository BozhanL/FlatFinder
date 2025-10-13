import React, { useMemo, useRef, useState, type JSX } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SUGGESTED = [
  "student",
  "cat lover",
  "non-smoker",
  "gym",
  "early bird",
  "gamer",
  "quiet",
  "music",
  "vegan",
  "clean",
  "worker",
  "couple",
  "grad",
  "extrovert",
  "introvert",
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[,;:/\\|#@"'`~!$%^&*()+={}\[\]?<>]+/g, "");
}

export default function TagInputField({
  label = "Tag",
  value,
  onChange,
  maxTags = 5,
  maxLen = 16,
}: {
  label?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  maxLen?: number;
}): JSX.Element {
  const [token, setToken] = useState("");
  const inputRef = useRef<TextInput>(null);

  const canAddMore = value.length < maxTags;

  function addToken(raw: string): void {
    if (!canAddMore) return;
    const t = normalize(raw).slice(0, maxLen);
    if (!t) return;
    if (value.some((v) => v === t)) return;
    onChange([...value, t]);
    setToken("");
  }

  function removeAt(i: number): void {
    const next = value.slice();
    next.splice(i, 1);
    onChange(next);
  }

  function handleChangeText(t: string): void {
    if (/[ ,;\n]$/.test(t)) {
      addToken(t.slice(0, -1));
    } else {
      setToken(t);
    }
  }

  function handleSubmitEditing(): void {
    addToken(token);
  }

  const suggestions = useMemo<string[]>(() => {
    const q = normalize(token);
    if (!q) return [];
    const set = new Set(value);
    return SUGGESTED.filter((x) => x.includes(q) && !set.has(x)).slice(0, 8);
  }, [token, value]);

  return (
    <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
      <Text style={{ fontSize: 14, fontWeight: "700", marginBottom: 8 }}>
        {label}
      </Text>

      <View style={styles.box} onTouchEnd={() => inputRef.current?.focus()}>
        <View style={styles.row}>
          {value.map((t, i) => (
            <View key={t} style={styles.chip}>
              <Text style={styles.chipText}>{t}</Text>
              <TouchableOpacity
                onPress={() => {
                  removeAt(i);
                }}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={styles.close}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          {canAddMore && (
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={token}
              onChangeText={handleChangeText}
              onSubmitEditing={handleSubmitEditing}
              placeholder={value.length ? "" : "e.g. student, cat lover"}
              blurOnSubmit={false}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              testID="TagInputField-input"
            />
          )}
        </View>
      </View>

      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(s) => s}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggest}
              onPress={() => {
                addToken(item);
              }}
            >
              <Text style={{ fontSize: 14 }}>{item}</Text>
            </TouchableOpacity>
          )}
          style={{ marginTop: 8, maxHeight: 160 }}
          keyboardShouldPersistTaps="handled"
        />
      )}

      <Text style={styles.hint}>
        {value.length}/{maxTags} • {maxLen} chars each
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F1F5",
  },
  chipText: { fontSize: 13, fontWeight: "600", color: "#333", marginRight: 6 },
  close: { fontSize: 16, color: "#777", marginLeft: 2, marginRight: 2 },
  input: { minWidth: 80, paddingVertical: 6, fontSize: 14, flexGrow: 1 },
  suggest: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
    marginBottom: 6,
  },
  hint: { marginTop: 6, fontSize: 12, color: "#777" },
});
