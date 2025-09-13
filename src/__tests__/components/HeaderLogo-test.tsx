import HeaderLogo from "@/components/HeaderLogo";
import { render, screen } from "@testing-library/react-native";

describe("@/components/HeaderLogo", () => {
  test("Text renders correctly on HeaderLogo", async () => {
    render(<HeaderLogo />);
    const elements = screen.getAllByText("FlatFinder");
    expect(elements).toHaveLength(1);
    expect(elements[0]).toBeOnTheScreen();
  });
});
