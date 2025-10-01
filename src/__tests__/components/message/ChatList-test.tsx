import ChatList from "@/components/message/ChatList";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { TEST_ID } from "react-native-gifted-chat";

jest.mock("@/hooks/useMessages", () =>
  jest.fn((_gid: string, gname: string) => {
    return {
      sortedMessages: [
        {
          _id: "mid",
          text: "text",
          createdAt: new Date(0),
          name: gname,
          user: {
            _id: "uid",
            name: "uname",
            avatar: "https://github.com/BozhanL/FlatFinder",
          },
        },
      ],
      loading: false,
      usercache: new Map([
        [
          "uid",
          {
            _id: "uid",
            name: "uname",
            avatar: "https://github.com/BozhanL/FlatFinder",
          },
        ],
      ]),
    };
  }),
);

jest.mock("@/services/message");
jest.mock("react-native-safe-area-context", () => {
  return {
    useSafeAreaInsets: jest.fn(() => {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }),
  };
});

describe("@/components/message/ChatList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Test ChatList", async () => {
    render(<ChatList uid="uid" gname="gname" gid="gid" />);

    const loadingWrapper = screen.getByTestId(TEST_ID.WRAPPER);
    fireEvent(loadingWrapper, "layout", {
      nativeEvent: {
        layout: {
          width: 200,
          height: 2000,
        },
      },
    });

    const format = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    expect(await screen.findByText("text")).toBeVisible();
    expect(await screen.findByText("1 January 1970")).toBeDefined();
    expect(
      await screen.findByText(format.format(new Date(0)).toUpperCase()),
    ).toBeVisible();
  });
});
