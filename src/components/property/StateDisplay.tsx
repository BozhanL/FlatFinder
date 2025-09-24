import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

interface StateDisplayProps {
  type: "loading" | "empty" | "filtered";
  message?: string;
  subtitle?: string;
}

export default function StateDisplay({
  type,
  message,
  subtitle,
}: StateDisplayProps) {
  if (type === "loading") {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10 }}>
          {message || "Loading properties..."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.centerContent}>
      <Text>{message}</Text>
      {subtitle && (
        <Text style={{ marginTop: 8, color: "#666" }}>{subtitle}</Text>
      )}
    </View>
  );
}
