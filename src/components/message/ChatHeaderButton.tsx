import { deleteGroup } from "@/services/message";
import { blockUser } from "@/services/swipe";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import type { JSX } from "react";
import { HiddenItem, OverflowMenu } from "react-navigation-header-buttons";

export default function ChatHeaderButton({
  gid,
  uid,
}: {
  gid: string;
  uid: string;
}): JSX.Element {
  return (
    <OverflowMenu
      OverflowIcon={({ color }) => (
        <MaterialIcons name="more-horiz" size={23} color={color} />
      )}
      testID={"show-chat-header-button"}
    >
      <HiddenItem
        title="Block"
        onPress={() => {
          router.back();
          void blockUser(gid, uid);
          void deleteGroup(gid);
        }}
        testID={"block-user-button"}
      />
    </OverflowMenu>
  );
}
