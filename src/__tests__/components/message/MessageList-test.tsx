import MessageList, {
  __test__ as MessageListPrivate,
} from "@/components/message/MessageList";
import type { Group } from "@/types/Group";
import { Timestamp } from "@react-native-firebase/firestore";
import { render, screen } from "@testing-library/react-native";

jest.mock("@/hooks/useGroups", () =>
  jest.fn(() => {
    const { Timestamp } = jest.requireActual(
      "@react-native-firebase/firestore",
    );
    return [
      {
        id: "gid",
        name: "name",
        members: ["uid1", "uid2"],
        lastTimestamp: Timestamp.fromMillis(0),
        lastMessage: "text",
        lastSender: "uid1",
      },
    ];
  }),
);

describe("@/components/message/MessageList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Test MessageList", async () => {
    render(<MessageList uid="uid" />);

    expect(await screen.findByText("Message")).toBeVisible();
    expect(await screen.findByText("text")).toBeVisible();
    expect(
      await screen.findByText(new Date(0).toLocaleDateString()),
    ).toBeVisible();
  });

  test("Test formatTimestamp", async () => {
    const current = Timestamp.now();

    {
      const result = MessageListPrivate.formatTimestamp(current);
      expect(result).toBe("Just now");
    }

    {
      const t = Timestamp.fromMillis(current.toMillis() - 1000 * 60);
      const result = MessageListPrivate.formatTimestamp(t);
      expect(result).toBe("1 minute ago");
    }

    {
      const t = Timestamp.fromMillis(current.toMillis() - 1000 * 60 * 2);
      const result = MessageListPrivate.formatTimestamp(t);
      expect(result).toBe("2 minutes ago");
    }

    {
      const t = Timestamp.fromMillis(current.toMillis() - 1000 * 60 * 60);
      const result = MessageListPrivate.formatTimestamp(t);
      expect(result).toBe("1 hour ago");
    }

    {
      const t = Timestamp.fromMillis(current.toMillis() - 1000 * 60 * 60 * 2);
      const result = MessageListPrivate.formatTimestamp(t);
      expect(result).toBe("2 hours ago");
    }

    {
      const t = Timestamp.fromMillis(current.toMillis() - 1000 * 60 * 60 * 24);
      const result = MessageListPrivate.formatTimestamp(t);
      expect(result).toBe("1 day ago");
    }

    {
      const t = Timestamp.fromMillis(
        current.toMillis() - 1000 * 60 * 60 * 24 * 2,
      );
      const result = MessageListPrivate.formatTimestamp(t);
      expect(result).toBe("2 days ago");
    }

    {
      const t = Timestamp.fromMillis(
        current.toMillis() - 1000 * 60 * 60 * 24 * 7,
      );
      const result = MessageListPrivate.formatTimestamp(t);
      expect(result).toBe("1 week ago");
    }

    {
      const t = Timestamp.fromMillis(
        current.toMillis() - 1000 * 60 * 60 * 24 * 7 * 2,
      );
      const result = MessageListPrivate.formatTimestamp(t);
      expect(result).toBe("2 weeks ago");
    }

    {
      const t = Timestamp.fromMillis(
        current.toMillis() - 1000 * 60 * 60 * 24 * 7 * 4,
      );
      const result = MessageListPrivate.formatTimestamp(t);
      expect(result).toBe("4 weeks ago");
    }

    {
      const t = Timestamp.fromMillis(
        current.toMillis() - 1000 * 60 * 60 * 24 * 7 * 5,
      );
      const result = MessageListPrivate.formatTimestamp(t);
      expect(result).toBe(t.toDate().toLocaleDateString());
    }
  });

  test("Test renderItem", async () => {
    const item: Group = {
      id: "gid",
      name: "name",
      members: ["uid1", "uid2"],
      lastTimestamp: Timestamp.fromMillis(0),
      lastMessage: "Hello",
      lastSender: "uid1",
      lastNotified: Timestamp.fromMillis(0),
    };

    render(MessageListPrivate.renderItem(item, "uid"));

    expect(screen.getByText("name")).toBeVisible();
    expect(screen.getByText("Hello")).toBeVisible();
    expect(screen.getByText(new Date(0).toLocaleDateString())).toBeVisible();
  });
});
