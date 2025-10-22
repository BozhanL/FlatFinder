import useUser from "@/hooks/useUser";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  collection,
  deleteDoc,
  doc,
  FirebaseFirestoreTypes,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
} from "@react-native-firebase/firestore";
import { router, Stack } from "expo-router";
import React, { useCallback, useEffect, useState, type JSX } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

type WatchItem = {
  propertyId: string;
  title: string;
  price: number;
  type: string;
  address: string;
  imageUrl: string;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
};

export default function WatchlistModal(): JSX.Element {
  const uid = useUser()?.uid ?? null;
  const [items, setItems] = useState<WatchItem[] | null>(null);

  useEffect(() => {
    if (!uid) {
      setItems([]);
      return;
    }
    const q = query(
      collection(getFirestore(), "users", uid, "watchlist"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: WatchItem[] = snap.docs.map(
        (d: FirebaseFirestoreTypes.QueryDocumentSnapshot<WatchItem>) =>
          d.data(),
      );
      setItems(list);
    });
    return unsub;
  }, [uid]);

  // Render right action (delete button)
  const renderRightActions = useCallback(
    (item: WatchItem): JSX.Element => (
      <TouchableOpacity
        onPress={(): void => {
          if (!uid) {
            return;
          }
          void deleteDoc(
            doc(getFirestore(), "users", uid, "watchlist", item.propertyId),
          );
        }}
        activeOpacity={0.7}
        style={{
          width: 88,
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fb5f5fff",
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
        }}
      >
        <View
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: "#fb5f5fff",
          }}
        >
          <MaterialCommunityIcons name="delete" size={20} color="#fff" />
        </View>
      </TouchableOpacity>
    ),
    [uid],
  );

  if (items === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View
        style={{
          flex: 1,
          marginHorizontal: 12,
          marginVertical: 5,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <Stack.Screen
          options={{
            title: "Watchlist",
            presentation: "modal",
            headerShown: true,
          }}
        />

        {items.length === 0 ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: "#666" }}>No favorites yet</Text>
          </View>
        ) : (
          <FlatList
            style={{ flex: 1, backgroundColor: "#fff" }}
            data={items}
            keyExtractor={(it: WatchItem): string => it.propertyId}
            contentContainerStyle={{ paddingVertical: 6 }}
            initialNumToRender={6}
            windowSize={8}
            renderItem={({ item }) => (
              <ReanimatedSwipeable
                friction={1}
                rightThreshold={24}
                renderRightActions={() => renderRightActions(item)}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    router.push({
                      pathname: "/property",
                      params: { id: item.propertyId },
                    });
                  }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    backgroundColor: "#ffffffff",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#eee",
                    shadowColor: "#000",
                    shadowOpacity: 0.04,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 1,
                    minHeight: 120,
                  }}
                >
                  {/*to be replaced by actual image @Anthony-8114 */}
                  <Image
                    source={
                      item.imageUrl
                        ? { uri: item.imageUrl }
                        : require("assets/images/react-logo.png")
                    }
                    style={{
                      width: 100,
                      height: 100,
                    }}
                  />

                  <View style={{ flex: 1 }}>
                    {/*title*/}
                    <Text
                      style={{ fontSize: 16, fontWeight: "600" }}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>

                    {/*price*/}
                    <Text
                      style={{ marginTop: 10, fontSize: 13, color: "#2563eb" }}
                    >
                      {`$${item.price}/week`}
                    </Text>

                    {/*address*/}
                    <Text
                      style={{ color: "#666", marginTop: 10, fontSize: 12 }}
                      numberOfLines={1}
                    >
                      {item.address}
                    </Text>
                  </View>
                </TouchableOpacity>
              </ReanimatedSwipeable>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}
