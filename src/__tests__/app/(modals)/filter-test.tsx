import FilterScreen from "@/app/(modals)/filter";
import { applyGlobalFilters, getGlobalFilters } from "@/utils/filterStateManager";
import { fireEvent, render, screen } from "@testing-library/react-native";

// Mock expo-router
jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  router: { back: jest.fn() },
}));

// Mock the filter state manager
jest.mock("@/utils/filterStateManager", () => ({
  applyGlobalFilters: jest.fn(),
  getGlobalFilters: jest.fn(() => ({
    type: [],
    minPrice: "",
    maxPrice: "",
    bedrooms: null,
    bathrooms: null,
    minContract: "",
  })),
}));

// Mock the property filters utility
jest.mock("@/utils/propertyFilters", () => ({
  countActiveFilters: jest.fn(() => 0),
}));

describe("FilterScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the mock implementation for getGlobalFilters to return default state
    (getGlobalFilters as jest.Mock).mockReturnValue({
      type: [],
      minPrice: "",
      maxPrice: "",
      bedrooms: null,
      bathrooms: null,
      minContract: "",
    });
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
    render(<FilterScreen />);

    // Click "For Rent"
    fireEvent.press(screen.getByText("For Rent"));
    fireEvent.press(screen.getByText(/Apply Filters/i));

    expect(applyGlobalFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ["rental"],
      }),
    );
  });

  test("Inputs price range and applies filters", () => {
    render(<FilterScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("Min price"), "500");
    fireEvent.changeText(screen.getByPlaceholderText("Max price"), "1500");
    fireEvent.press(screen.getByText(/Apply Filters/i));

    expect(applyGlobalFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        minPrice: "500",
        maxPrice: "1500",
      }),
    );
  });

  test("Selects bedrooms and bathrooms and applies filters", () => {
    render(<FilterScreen />);

    fireEvent.press(screen.getByText("3+ beds"));
    fireEvent.press(screen.getByText("2+ baths"));
    fireEvent.press(screen.getByText(/Apply Filters/i));

    expect(applyGlobalFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        bedrooms: 3,
        bathrooms: 2,
      }),
    );
  });

  test("Entering minimum contract length", () => {
    render(<FilterScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Enter weeks (e.g. 1 for 1 week)"),
      "1",
    );
    fireEvent.press(screen.getByText(/Apply Filters/i));

    expect(applyGlobalFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        minContract: "1",
      }),
    );
  });

  test("Clearing filters", () => {
    render(<FilterScreen />);

    // First set some filters
    fireEvent.press(screen.getByText("For Rent"));
    fireEvent.changeText(screen.getByPlaceholderText("Min price"), "500");

    // Then clear them
    fireEvent.press(screen.getByText("Clear All"));
    fireEvent.press(screen.getByText(/Apply Filters/i));

    expect(applyGlobalFilters).toHaveBeenCalledWith({
      type: [],
      minPrice: "",
      maxPrice: "",
      bedrooms: null,
      bathrooms: null,
      minContract: "",
    });
  });

  test("Shows active filter count on apply button", () => {
    const { countActiveFilters } = require("@/utils/propertyFilters");
    (countActiveFilters as jest.Mock).mockReturnValue(2);

    render(<FilterScreen />);

    expect(screen.getByText("Apply Filters (2)")).toBeTruthy();
  });

  test("Multiple property type selections work correctly", () => {
    render(<FilterScreen />);

    // Select both rental and sale
    fireEvent.press(screen.getByText("For Rent"));
    fireEvent.press(screen.getByText("For Sale"));
    fireEvent.press(screen.getByText(/Apply Filters/i));

    expect(applyGlobalFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ["rental", "sale"],
      }),
    );
  });

  test("Deselecting property type works correctly", () => {
    render(<FilterScreen />);

    // Select and then deselect "For Rent"
    fireEvent.press(screen.getByText("For Rent"));
    fireEvent.press(screen.getByText("For Rent")); // Click again to deselect
    fireEvent.press(screen.getByText(/Apply Filters/i));

    expect(applyGlobalFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        type: [],
      }),
    );
  });

  test("Single selection for bedrooms works correctly", () => {
    render(<FilterScreen />);

    // Select 2+ beds, then select 4+ beds (should replace, not add)
    fireEvent.press(screen.getByText("2+ beds"));
    fireEvent.press(screen.getByText("4+ beds"));
    fireEvent.press(screen.getByText(/Apply Filters/i));

    expect(applyGlobalFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        bedrooms: 4, // Should be 4, not both 2 and 4
      }),
    );
  });

  test("Deselecting bedrooms by clicking same option twice", () => {
    render(<FilterScreen />);

    // Select and then deselect same bedroom option
    fireEvent.press(screen.getByText("3+ beds"));
    fireEvent.press(screen.getByText("3+ beds")); // Click again to deselect
    fireEvent.press(screen.getByText(/Apply Filters/i));

    expect(applyGlobalFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        bedrooms: null,
      }),
    );
  });
});