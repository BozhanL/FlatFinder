import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Slider from "@react-native-community/slider"; 

const PRESETS = [150, 200, 250, 300, 350, 400];

function clamp(n: number, lo: number, hi: number) { return Math.min(Math.max(n, lo), hi); }
function roundStep(n: number, step = 10) { return Math.round(n / step) * step; }
function formatNZD(n?: number) {
  if (n == null || isNaN(n)) return "";
  return n.toLocaleString("en-NZ", { style: "currency", currency: "NZD", maximumFractionDigits: 0 });
}
function parseNumber(s: string) {

  const digits = s.replace(/[^\d]/g, "");
  return digits ? Number(digits) : NaN;
}

export default function BudgetField({
  value,
  onChange,
  min = 50,
  max = 2000,
  step = 10
}: {
  value: number | null | undefined;
  onChange: (n: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const [mode, setMode] = useState<"week" | "month">("week");

  const displayValue = useMemo(() => {
    const v = Number(value ?? NaN);
    if (isNaN(v)) return "";
    return mode === "week" ? formatNZD(v) : formatNZD(Math.round(v * 52 / 12));
  }, [value, mode]);

  function commit(raw: string) {
    const n = parseNumber(raw);
    if (isNaN(n)) { onChange(null); return; }
    const weekly = mode === "week" ? n : Math.round(n * 12 / 52);
    onChange(clamp(roundStep(weekly, step), min, max));
  }

  function inc(delta: number) {
    const v = clamp(roundStep((value ?? 0) + delta, step), min, max);
    onChange(v);
  }

  return (
    <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
      <Text style={{ fontSize: 14, fontWeight: "700", marginBottom: 8 }}>Budget</Text>

      {/* Week / Month toggle */}
      <View style={styles.segment}>
        <SegBtn label="Per week" active={mode==="week"} onPress={()=>setMode("week")} />
        <SegBtn label="Per month" active={mode==="month"} onPress={()=>setMode("month")} />
      </View>

      {/* Presets */}
      <View style={styles.presetRow}>
        {PRESETS.map(p => (
          <TouchableOpacity key={p}
            style={[styles.preset, value === p && styles.presetActive]}
            onPress={() => onChange(p)}
            activeOpacity={0.8}
          >
            <Text style={[styles.presetText, value === p && { color: "#fff" }]}>
              {formatNZD(p)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input + stepper */}
      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.stepBtn} onPress={() => inc(-step)}><Text style={styles.stepTxt}>−{step}</Text></TouchableOpacity>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={displayValue}
          onChangeText={() => {
          }}
          onEndEditing={(e) => commit(e.nativeEvent.text)}
          placeholder={mode==="week" ? "e.g. $250" : "e.g. $1,200"}
        />
        <TouchableOpacity style={styles.stepBtn} onPress={() => inc(step)}><Text style={styles.stepTxt}>+{step}</Text></TouchableOpacity>
      </View>

      {/* Slider */}
      <Slider
        style={{ marginTop: 8 }}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value ?? min}
        onValueChange={(v) => onChange(Math.round(v))}
      />
      <Text style={styles.hint}>
        {min}–{max} NZD/week
      </Text>
    </View>
  );
}

function SegBtn({ label, active, onPress }: {label:string; active:boolean; onPress:()=>void}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}
      style={[styles.segBtn, active && styles.segBtnActive]}>
      <Text style={[styles.segTxt, active && styles.segTxtActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  segment: { flexDirection: "row", gap: 8, marginBottom: 10 },
  segBtn: { paddingHorizontal: 12, height: 32, borderRadius: 16, backgroundColor: "#ECEBEC", alignItems: "center", justifyContent: "center" },
  segBtnActive: { backgroundColor: "#6B46FF" },
  segTxt: { fontSize: 12, fontWeight: "700", color: "#555" },
  segTxtActive: { color: "#fff" },

  presetRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  preset: { paddingHorizontal: 10, height: 32, borderRadius: 16, borderWidth: 1, borderColor: "#E0E0E0", alignItems: "center", justifyContent: "center" },
  presetActive: { backgroundColor: "#6B46FF", borderColor: "#6B46FF" },
  presetText: { fontSize: 12, fontWeight: "700", color: "#333" },

  inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepBtn: { width: 60, height: 40, borderRadius: 8, backgroundColor: "#F2F2F2", alignItems: "center", justifyContent: "center" },
  stepTxt: { fontWeight: "800", color: "#333" },
  input: { flex: 1, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff", textAlign: "center", fontWeight: "700" },
  hint: { marginTop: 6, fontSize: 12, color: "#777" },
});
