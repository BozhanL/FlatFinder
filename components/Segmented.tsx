import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  options: string[];
  onChange?: (value: string) => void;
};

export default function Segmented({ options, onChange }: Props) {
  const [selected, setSelected] = useState(options[0]);

  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const isActive = opt === selected;
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.item, isActive && styles.activeItem]}
            onPress={() => {
              setSelected(opt);
              onChange?.(opt);
            }}
          >
            <Text style={[styles.text, isActive && styles.activeText]}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#ECEBEC",
    borderRadius: 20,
    padding: 4,
  },
  item: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "center",
  },
  activeItem: {
    backgroundColor: "#111",
  },
  text: {
    fontSize: 14,
    color: "#555",
    fontFamily: "Poppins_600SemiBold",
  },
  activeText: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
});
