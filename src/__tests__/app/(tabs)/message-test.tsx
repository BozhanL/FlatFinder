import Message from "@/app/(tabs)/message";
import MessageList from "@/components/message/MessageList";
import { onAuthStateChanged } from "@react-native-firebase/auth";
import { act, render, screen } from "@testing-library/react-native";

jest.mock("@react-native-firebase/auth", () => {
  const orig = jest.requireActual("@react-native-firebase/auth");
  return {
    ...orig,
    getAuth: jest.fn(() => {
      return {};
    }),
    onAuthStateChanged: jest.fn(),
  };
});

jest.mock("@/components/message/MessageList", () =>
  jest.fn(({ uid }: { uid: string }) => {
    const { Text } = jest.requireActual("react-native");
    return <Text>MessageList {uid}</Text>;
  }),
);

describe("@/app/(tabs)/message", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Test Message", async () => {
    render(<Message />);

    const callback = (onAuthStateChanged as jest.Mock).mock.calls[0][1];

    expect(screen.getByAccessibilityHint("loading")).toBeVisible();

    act(() => {
      callback(null);
    });
    expect(screen.getByAccessibilityHint("loading")).toBeVisible();

    act(() => {
      callback({ uid: "uid" });
    });
    expect(await screen.findByText("MessageList uid")).toBeVisible();
    expect(MessageList).toHaveBeenCalledWith({ uid: "uid" }, undefined);
  });
});
