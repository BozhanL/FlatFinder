import type { Flatmate } from "@/types/flatmate";
import { Image, Text, View } from "react-native";

type Props = {item:Flatmate};
export default function SwipeCard({item}: Props){
    return (
    <View
      style={{
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#fff",
        elevation: 2,
      }}
    >
      <Image
        source={item.avatar as any}
        style={{ width: "100%", height: 420 }}
        resizeMode="cover"
      />
      <View style={{ padding: 14, gap: 6 }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>
          {item.name}, {item.age ? `, ${item.age}` : ""}
        </Text>

        <Text style={{ color: "#555" }}>
          {typeof item.location === "string" ? item.location : item.location?.area}
          {item.budget ? ` · $${item.budget}/wk` : ""}
        </Text>
        
        {item.bio ? <Text style={{ marginTop: 4 }}>{item.bio}</Text> : null}
        
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
          {item.tags?.map((t) => (
            <View key={t} style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "#eee", borderRadius: 999 }}>
              <Text>{t}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}