import { Message } from "@/types/Message";
import { Timestamp } from "@react-native-firebase/firestore";

describe("Message.ts", () => {
  test("Test constructs correctly", async () => {
    const g: Message = {
      id: "id",
      sender: "sender",
      message: "message",
      timestamp: Timestamp.fromMillis(1000),
    };

    expect(g.id).toBe("id");
    expect(g.sender).toBe("sender");
    expect(g.message).toBe("message");
    expect(g.timestamp.toMillis()).toBe(1000);
  });
});
