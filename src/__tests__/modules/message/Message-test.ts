import { Message } from "@/modules/message/Message";
import { Timestamp } from "@react-native-firebase/firestore";

describe("Message.ts", () => {
  test("Test constructs correctly", async () => {
    const g = new Message(
      "id",
      "sender",
      "message",
      Timestamp.fromMillis(1000),
    );

    expect(g.id).toBe("id");
    expect(g.sender).toBe("sender");
    expect(g.message).toBe("message");
    expect(g.timestamp.toMillis()).toBe(1000);
  });
});
