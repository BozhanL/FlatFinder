import FilterScreen from "@/app/(modals)/filter";
import { getGlobalApplyFilter } from "@/app/(tabs)/index";
import { fireEvent, render, screen } from "@testing-library/react-native";

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  router: { back: jest.fn() },
}));

jest.mock("@/app/(tabs)/index", () => ({
  getGlobalApplyFilter: jest.fn(),
}));

describe("FilterScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Renders all filter options", () => {
    render(<FilterScreen />);
    expect(screen.getByText("Property Type")).toBeTruthy();
    expect(screen.getByText("Price Range")).toBeTruthy();
    expect(screen.getByText("Bedrooms (select one)")).toBeTruthy();
    expect(screen.getByText("Bathrooms (select one)")).toBeTruthy();
    expect(screen.getByText("Minimum Contract Length (Weeks)")).toBeTruthy();
  });

  test("Select and apply property type filters", () => {
    const mockApplyFilter = jest.fn();
    (getGlobalApplyFilter as jest.Mock).mockReturnValue(mockApplyFilter);

    render(<FilterScreen />);

    // Click "For Rent"
    fireEvent.press(screen.getByText("For Rent"));
    fireEvent.press(screen.getByText(/Apply Filters/i));

    expect(mockApplyFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ["rental"],
      }),
    );
  });

  test("Inputs price range and applys filters", () => {
    const mockApplyFilter = jest.fn();
    (getGlobalApplyFilter as jest.Mock).mockReturnValue(mockApplyFilter);

    render(<FilterScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("Min price"), "500");
    fireEvent.changeText(screen.getByPlaceholderText("Max price"), "1500");
    fireEvent.press(screen.getByText(/Apply Filters/i));

    expect(mockApplyFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        minPrice: "500",
        maxPrice: "1500",
      }),
    );
  });

  test("Selects bedrooms and bathrooms and applies filters", () => {
    const mockApplyFilter = jest.fn();
    (getGlobalApplyFilter as jest.Mock).mockReturnValue(mockApplyFilter);

    render(<FilterScreen />);

    fireEvent.press(screen.getByText("3+ beds"));
    fireEvent.press(screen.getByText("2+ baths"));
    fireEvent.press(screen.getByText(/Apply Filters/i));

    expect(mockApplyFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        bedrooms: 3,
        bathrooms: 2,
      }),
    );
  });

  test("Entering minimum contract length", () => {
    const mockApplyFilter = jest.fn();
    (getGlobalApplyFilter as jest.Mock).mockReturnValue(mockApplyFilter);

    render(<FilterScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Enter weeks (e.g. 1 for 1 week)"),
      "1",
    );
    fireEvent.press(screen.getByText(/Apply Filters/i));

    expect(mockApplyFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        minContract: "1",
      }),
    );
  });

  test("Clearing filters", () => {
    const mockApplyFilter = jest.fn();
    (getGlobalApplyFilter as jest.Mock).mockReturnValue(mockApplyFilter);

    render(<FilterScreen />);

    fireEvent.press(screen.getByText("For Rent"));
    fireEvent.changeText(screen.getByPlaceholderText("Min price"), "500");

    fireEvent.press(screen.getByText("Clear All"));
    fireEvent.press(screen.getByText(/Apply Filters/i));

    expect(mockApplyFilter).toHaveBeenCalledWith({
      type: [],
      minPrice: "",
      maxPrice: "",
      bedrooms: null,
      bathrooms: null,
      minContract: "",
    });
  });
});
