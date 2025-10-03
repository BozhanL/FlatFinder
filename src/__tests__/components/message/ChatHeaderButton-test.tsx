import ChatHeaderButton from "@/components/message/ChatHeaderButton";
import { NavigationContainer } from "@react-navigation/native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import type { OnOverflowMenuPressParams } from "react-navigation-header-buttons";

const mockOnPress = jest.fn();

jest.mock("react-navigation-header-buttons", () => {
  const actual = jest.requireActual("react-navigation-header-buttons");

  return {
    ...actual,
    OverflowMenu: jest.fn((props) => (
      <actual.OverflowMenu {...props} onPress={mockOnPress} />
    )),
  };
});

// Mock MaterialIcons to avoid async state updates
jest.mock("@expo/vector-icons/MaterialIcons", () => {
  const { Text } = jest.requireActual("react-native");

  return function MockedMaterialIcons() {
    return <Text testID="material-icon">material-icon</Text>;
  };
});

describe("@/components/message/ChatHeaderButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Test ChatHeaderButton invisible", () => {
    render(<ChatHeaderButton gid={"gid"} uid={"uid"} />, {
      wrapper: NavigationContainer,
    });

    expect(screen.getByTestId("show-chat-header-button")).toBeVisible();
  });

  test("Test ChatHeaderButton visible", () => {
    render(<ChatHeaderButton gid={"gid"} uid={"uid"} />, {
      wrapper: NavigationContainer,
    });

    const showListButton = screen.getByTestId("show-chat-header-button");
    fireEvent.press(showListButton);

    const mockCall: OnOverflowMenuPressParams = mockOnPress.mock.calls[0][0];
    const hiddenButtons = mockCall.hiddenButtons.map((it) => ({
      title: it.title,
      onPress: it.onPress,
      destructive: it.destructive,
      disabled: it.disabled,
    }));

    expect({
      overflowButtonRef: mockCall.overflowButtonRef,
      presentMenu: mockCall.presentMenu,
      closeMenu: mockCall.closeMenu,
    }).toStrictEqual({
      overflowButtonRef: expect.any(Object),
      presentMenu: expect.any(Function),
      closeMenu: expect.any(Function),
    });

    expect(hiddenButtons).toStrictEqual([
      {
        title: "Block",
        onPress: expect.any(Function),
        destructive: undefined,
        disabled: undefined,
      },
    ]);
  });
});
