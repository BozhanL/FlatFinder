import ChatHeaderButton from "@/components/message/ChatHeaderButton";
import { fireEvent, render, screen } from "@testing-library/react-native";

describe("@/components/message/ChatHeaderButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Test ChatHeaderButton invisible", async () => {
    render(<ChatHeaderButton gid={"gid"} uid={"uid"} />);

    expect(screen.getByTestId("show-chat-header-button")).toBeVisible();
  });

  test("Test ChatHeaderButton visible", async () => {
    render(<ChatHeaderButton gid={"gid"} uid={"uid"} />);

    const showListButton = screen.getByTestId("show-chat-header-button");

    fireEvent.press(showListButton);

    expect(screen.getByTestId("show-chat-header-button")).toBeVisible();
    expect(screen.getByText("Block")).toBeVisible();
  });
});
