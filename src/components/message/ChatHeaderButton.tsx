import { deleteGroup } from "@/services/message";
import { blockUser } from "@/services/swipe";
import { router } from "expo-router";
import { useState, type JSX } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatHeaderButton({
  gid,
  uid,
}: {
  gid: string;
  uid: string;
}): JSX.Element {
  const [showList, setShowList] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          setShowList((prev) => !prev);
        }}
        testID="show-chat-header-button"
      >
        <Text style={styles.buttonText}>...</Text>
      </TouchableOpacity>

      <Modal
        animationType="none"
        transparent={true}
        visible={showList}
        onRequestClose={() => {
          setShowList(false);
        }}
      >
        <TouchableOpacity
          style={[styles.modalOverlay, { paddingTop: insets.top + 55 }]}
          onPress={() => {
            setShowList(false);
          }}
        >
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              onPress={() => {
                void blockUser(gid, uid).then(() =>
                  deleteGroup(gid).then(() => {
                    setShowList(false);
                    router.back();
                  }),
                );
              }}
            >
              <Text style={styles.dropdownItem}>Block</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    fontSize: 32,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingRight: 10,
  },
  dropdownContainer: {
    backgroundColor: "#DADADA",
    borderRadius: 5,
    padding: 10,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
});
