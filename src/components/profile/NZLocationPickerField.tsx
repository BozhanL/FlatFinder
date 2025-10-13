import React, { useMemo, useState, type JSX } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
} from "react-native";

const NZ_REGIONS: { region: string; items: string[] }[] = [
  {
    region: "Auckland",
    items: [
      "Auckland CBD",
      "North Shore",
      "West Auckland",
      "South Auckland",
      "East Auckland",
    ],
  },
  {
    region: "Waikato",
    items: ["Hamilton", "Cambridge", "Taupō", "Te Awamutu"],
  },
  {
    region: "Bay of Plenty",
    items: ["Tauranga", "Mount Maunganui", "Whakatāne", "Rotorua"],
  },
  {
    region: "Wellington",
    items: ["Wellington CBD", "Lower Hutt", "Upper Hutt", "Porirua", "Kapiti"],
  },
  {
    region: "Canterbury",
    items: ["Christchurch CBD", "Riccarton", "Addington", "Rolleston"],
  },
  { region: "Otago", items: ["Dunedin", "Queenstown", "Wanaka"] },
  { region: "Manawatū-Whanganui", items: ["Palmerston North", "Whanganui"] },
  { region: "Hawke's Bay", items: ["Napier", "Hastings", "Havelock North"] },
  { region: "Taranaki", items: ["New Plymouth"] },
  { region: "Northland", items: ["Whangārei", "Kerikeri"] },
  { region: "Tasman", items: ["Richmond", "Motueka"] },
  { region: "Nelson", items: ["Nelson"] },
  { region: "Marlborough", items: ["Blenheim", "Picton"] },
  { region: "West Coast", items: ["Greymouth", "Hokitika", "Westport"] },
  { region: "Southland", items: ["Invercargill", "Te Anau", "Gore"] },
  { region: "Gisborne", items: ["Gisborne"] },
];

const FLATTENED = NZ_REGIONS.flatMap((g) => [
  { type: "header" as const, key: `h-${g.region}`, label: g.region },
  ...g.items.map((name) => ({
    type: "item" as const,
    key: `${g.region}-${name}`,
    label: name,
  })),
]);

export default function NZLocationPickerField({
  label = "Preferred Location",
  value,
  onChange,
}: {
  label?: string;
  value?: string | null;
  onChange: (v: string) => void;
}): JSX.Element {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const data = useMemo(() => {
    if (!q.trim()) return FLATTENED;
    const kw = q.trim().toLowerCase();
    const matched = NZ_REGIONS.flatMap((g) => {
      const inGroup = g.region.toLowerCase().includes(kw);
      const items = g.items.filter(
        (x) => inGroup || x.toLowerCase().includes(kw),
      );
      if (!inGroup && items.length === 0) return [];
      return [
        { type: "header" as const, key: `h-${g.region}`, label: g.region },
        ...items.map((name) => ({
          type: "item" as const,
          key: `${g.region}-${name}`,
          label: name,
        })),
      ];
    });
    return matched.length
      ? matched
      : [{ type: "header" as const, key: "none", label: "No results" }];
  }, [q]);

  return (
    <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
      <Text style={{ fontSize: 14, fontWeight: "700", marginBottom: 8 }}>
        {label}
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          setOpen(true);
        }}
        style={styles.input}
      >
        <Text style={{ color: value ? "#111" : "#999" }}>
          {value || "Select a region / area"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setOpen(false);
        }}
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <TouchableOpacity
                onPress={() => {
                  setOpen(false);
                }}
                style={{ padding: 8 }}
              >
                <Text style={{ color: "#666", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{ fontWeight: "800" }}>Select Location</Text>
              <View style={{ width: 60 }} />
            </View>

            <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
              <TextInput
                placeholder="Search city/area (e.g., CBD, North Shore)…"
                value={q}
                onChangeText={setQ}
                style={styles.search}
              />
            </View>

            <FlatList
              data={data}
              keyExtractor={(it) => it.key}
              renderItem={({ item }) =>
                item.type === "header" ? (
                  <View style={styles.header}>
                    <Text style={styles.headerText}>{item.label}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.row}
                    onPress={() => {
                      onChange(item.label);
                      setOpen(false);
                    }}
                  >
                    <Text style={styles.rowText}>{item.label}</Text>
                  </TouchableOpacity>
                )
              }
              showsVerticalScrollIndicator
              initialNumToRender={30}
              windowSize={10}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    maxHeight: "75%",
  },
  sheetHeader: {
    height: 48,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
  },
  search: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#F6F6F6",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  headerText: { fontSize: 12, color: "#666", fontWeight: "700" },
  row: { paddingVertical: 12, paddingHorizontal: 16 },
  rowText: { fontSize: 16 },
});
