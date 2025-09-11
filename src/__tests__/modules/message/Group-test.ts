import { Group } from "@/types/Group";
import { Timestamp } from "@react-native-firebase/firestore";

describe("Group.ts", () => {
  test("Test constructs correctly", async () => {
    const g: Group = {
      id: "id",
      name: null,
      members: ["a", "b"],
      lastTimestamp: Timestamp.fromMillis(0),
      lastMessage: "last",
      lastSender: "sender",
      lastNotified: Timestamp.fromMillis(0),
    };

    expect(g.id).toBe("id");
    expect(g.name).toBeNull();
    expect(g.members).toEqual(["a", "b"]);
    expect(g.lastTimestamp.toMillis()).toBe(0);
    expect(g.lastMessage).toBe("last");
    expect(g.lastSender).toBe("sender");
  });
});
