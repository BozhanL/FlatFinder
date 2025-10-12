import MessageList, {
  __test__ as MessageListPrivate,
} from "@/components/message/MessageList";
import type { Group } from "@/types/Group";
import { Timestamp } from "@react-native-firebase/firestore";
import { render, screen } from "@testing-library/react-native";
import dayjs from "dayjs";
import "dayjs/locale/en-nz";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.extend(LocalizedFormat);
dayjs.locale("en-nz");

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
    expect(await screen.findByText(dayjs(new Date(0)).fromNow())).toBeVisible();
  });

  test("Test renderItem with message", () => {
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
    expect(screen.getByText(dayjs(new Date(0)).fromNow())).toBeVisible();
  });

  test("Test renderItem without message", () => {
    const item: Group = {
      id: "gid",
      name: "name",
      members: ["uid1", "uid2"],
      lastTimestamp: Timestamp.fromMillis(0),
      lastMessage: null,
      lastSender: null,
      lastNotified: Timestamp.fromMillis(0),
    };

    render(MessageListPrivate.renderItem(item, "uid"));

    expect(screen.getByText("name")).toBeVisible();
    expect(
      screen.getByText(`Matched on ${dayjs(new Date(0)).format("L")}`),
    ).toBeVisible();
    expect(screen.getByText(dayjs(new Date(0)).fromNow())).toBeVisible();
  });
});
