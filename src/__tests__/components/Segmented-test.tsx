import Segmented from "@/components/Segmented";
import { render, screen } from "@testing-library/react-native";

describe("@/components/Segmented", () => {
  test("Text renders correctly on Segmented", async () => {
    render(<Segmented options={["a", "b", "c"]} />);
    {
      const elements = screen.getAllByText("a");
      expect(elements).toHaveLength(1);
      expect(elements[0]).toBeOnTheScreen();
    }

    {
      const elements = screen.getAllByText("b");
      expect(elements).toHaveLength(1);
      expect(elements[0]).toBeOnTheScreen();
    }

    {
      const elements = screen.getAllByText("c");
      expect(elements).toHaveLength(1);
      expect(elements[0]).toBeOnTheScreen();
    }
  });
});
