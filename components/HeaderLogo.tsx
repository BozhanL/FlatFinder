import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function HeaderLogo() {
  return (
    <SafeAreaView style={{ backgroundColor: "#fff" }}>
      <View style={styles.wrap}>
        <Text style={styles.logo}>FlatFinder</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  logo: { fontSize: 32, fontFamily: "PlayfairDisplay_700Bold" },
});
