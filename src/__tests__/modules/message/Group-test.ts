import { Group } from "@/modules/message/Group";
import { Timestamp } from "@react-native-firebase/firestore";

describe("Group.ts", () => {
  test("Test constructs correctly", async () => {
    const g = new Group(
      "id",
      null,
      ["a", "b"],
      Timestamp.fromMillis(0),
      "last",
      "sender",
    );

    expect(g.id).toBe("id");
    expect(g.name).toBeNull();
    expect(g.members).toEqual(["a", "b"]);
    expect(g.lastTimestamp.toMillis()).toBe(0);
    expect(g.lastMessage).toBe("last");
    expect(g.lastSender).toBe("sender");
  });
});
