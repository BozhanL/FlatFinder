import MessageView from "@/app/(tabs)/message";
import { render, screen } from "@testing-library/react-native";

describe("<MessageView />", () => {
  test("Text renders correctly on MessageView", async () => {
    render(<MessageView />);
    const elements = await screen.findAllByText("Login", {}, { timeout: 3000 });
    expect(elements[0]).toBeOnTheScreen();
  });
});
