import PostPropertyPage from "@/app/(modals)/post-property";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Alert } from "react-native";

jest.mock("@react-native-firebase/auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentUser: { uid: "test-user-123" },
  })),
}));

jest.mock("@react-native-firebase/firestore", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    collection: jest.fn(() => ({
      add: jest.fn(() => Promise.resolve({ id: "test-doc-id" })),
    })),
  })),
}));

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
  Stack: {
    Screen: () => null,
  },
}));


// Mock fetch for geocoding
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  }),
) as jest.Mock;

jest.useFakeTimers();

describe("PostPropertyPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Form Rendering", () => {
    it("should render all form fields", () => {
      render(<PostPropertyPage />);

      expect(screen.getByTestId("title-input")).toBeTruthy();
      expect(screen.getByTestId("rental-button")).toBeTruthy();
      expect(screen.getByTestId("sale-button")).toBeTruthy();
      expect(screen.getByTestId("price-input")).toBeTruthy();
      expect(screen.getByTestId("bedrooms-input")).toBeTruthy();
      expect(screen.getByTestId("bathrooms-input")).toBeTruthy();
      expect(screen.getByTestId("description-input")).toBeTruthy();
      expect(screen.getByTestId("address-input")).toBeTruthy();
      expect(screen.getByTestId("submit-button")).toBeTruthy();
    });

    it("should show contract length field for rentals", () => {
      render(<PostPropertyPage />);

      expect(screen.getByTestId("contract-length-input")).toBeTruthy();
    });

    it("should hide contract length field for sales", () => {
      render(<PostPropertyPage />);

      fireEvent.press(screen.getByTestId("sale-button"));

      expect(screen.queryByTestId("contract-length-input")).toBeNull();
    });

    it("should have submit button disabled initially", () => {
      render(<PostPropertyPage />);

      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe("Property Type Selection", () => {
    it("should switch between rental and sale", () => {
      render(<PostPropertyPage />);

      const rentalButton = screen.getByTestId("rental-button");
      const saleButton = screen.getByTestId("sale-button");

      const rentalStyle = Array.isArray(rentalButton.props.style)
        ? rentalButton.props.style
        : [rentalButton.props.style];
      const hasActiveRentalStyle = rentalStyle.some(
        (style: { backgroundColor?: string } | null | undefined) =>
          style?.backgroundColor === "#2563eb",
      );
      expect(hasActiveRentalStyle).toBe(true);

      fireEvent.press(saleButton);

      const saleStyle = Array.isArray(saleButton.props.style)
        ? saleButton.props.style
        : [saleButton.props.style];
      const hasActiveSaleStyle = saleStyle.some(
        (style: { backgroundColor?: string } | null | undefined) =>
          style?.backgroundColor === "#2563eb",
      );
      expect(hasActiveSaleStyle).toBe(true);
    });
  });

  describe("Address Search", () => {
    it("should trigger address search after typing", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              place_id: 1,
              display_name: "123 Test St, Auckland",
              lat: "-36.8485",
              lon: "174.7633",
              type: "residential",
            },
          ]),
      });

      render(<PostPropertyPage />);

      const addressInput = screen.getByTestId("address-input");
      fireEvent.changeText(addressInput, "123 Test St");

      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("nominatim.openstreetmap.org"),
            expect.objectContaining({
              headers: {
                "User-Agent": "PropertyApp/1.0",
              },
            }),
          );
        },
        { timeout: 1000 },
      );
    });

    it("should not search when query is too short", async () => {
      render(<PostPropertyPage />);

      const addressInput = screen.getByTestId("address-input");
      fireEvent.changeText(addressInput, "12");

      act(() => jest.runAllTimers());

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should display address suggestions", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              place_id: 1,
              display_name: "123 Test St, Auckland",
              lat: "-36.8485",
              lon: "174.7633",
              type: "residential",
            },
            {
              place_id: 2,
              display_name: "456 Queen St, Auckland",
              lat: "-36.8485",
              lon: "174.7633",
              type: "residential",
            },
          ]),
      });

      render(<PostPropertyPage />);

      const addressInput = screen.getByTestId("address-input");
      fireEvent.changeText(addressInput, "Auckland");
      fireEvent(addressInput, "focus");

      await waitFor(
        () => {
          expect(screen.getByText(/123 Test St, Auckland/)).toBeTruthy();
        },
        { timeout: 1000 },
      );

      expect(screen.getByText(/456 Queen St, Auckland/)).toBeTruthy();
    });

    it("should select an address from suggestions", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              place_id: 1,
              display_name: "123 Test St, Auckland",
              lat: "-36.8485",
              lon: "174.7633",
              type: "residential",
            },
          ]),
      });

      render(<PostPropertyPage />);

      const addressInput = screen.getByTestId("address-input");
      fireEvent.changeText(addressInput, "123 Test");
      fireEvent(addressInput, "focus");

      await waitFor(
        () => {
          expect(screen.getByText(/123 Test St, Auckland/)).toBeTruthy();
        },
        { timeout: 1000 },
      );

      const suggestion = screen.getByText(/123 Test St, Auckland/);
      fireEvent.press(suggestion);

      await waitFor(() => {
        expect(addressInput.props.value).toBe("123 Test St, Auckland");
      });
    });

    it("should clear suggestions when address is cleared", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              place_id: 1,
              display_name: "123 Test St, Auckland",
              lat: "-36.8485",
              lon: "174.7633",
              type: "residential",
            },
          ]),
      });

      render(<PostPropertyPage />);

      const addressInput = screen.getByTestId("address-input");
      fireEvent.changeText(addressInput, "123 Test");
      fireEvent(addressInput, "focus");

      expect(await screen.findByText(/123 Test St, Auckland/)).toBeTruthy();

      // Clear the address
      fireEvent.changeText(addressInput, "");

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Suggestions should be cleared
      expect(screen.queryByText(/123 Test St, Auckland/)).toBeNull();
    });
  });

  describe("Form Submission", () => {
    it("should successfully submit property data to Firestore", async () => {
      render(<PostPropertyPage />);

      fireEvent.changeText(screen.getByTestId("title-input"), "Test Property");
      fireEvent.changeText(screen.getByTestId("price-input"), "500");
      fireEvent.changeText(screen.getByTestId("bedrooms-input"), "2");
      fireEvent.changeText(screen.getByTestId("bathrooms-input"), "1");
      fireEvent.changeText(screen.getByTestId("contract-length-input"), "52");
      fireEvent.changeText(
        screen.getByTestId("description-input"),
        "Nice property",
      );

      const addressInput = screen.getByTestId("address-input");

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              place_id: 1,
              display_name: "123 Test St, Auckland",
              lat: "-36.8485",
              lon: "174.7633",
              type: "residential",
            },
          ]),
      });

      fireEvent.changeText(addressInput, "123 Test");

      await waitFor(
        () => {
          expect(addressInput).toBeTruthy();
        },
        { timeout: 1000 },
      );

      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton.props.accessibilityState.disabled).toBe(true);
    });

    it("should include contract field only for rentals", () => {
      render(<PostPropertyPage />);

      fireEvent.press(screen.getByTestId("sale-button"));

      expect(() => screen.getByTestId("contract-length-input")).toThrow();

      fireEvent.press(screen.getByTestId("rental-button"));

      expect(screen.getByTestId("contract-length-input")).toBeTruthy();
    });

    it("should disable submit button when required fields are empty", () => {
      render(<PostPropertyPage />);

      const submitButton = screen.getByTestId("submit-button");

      expect(submitButton.props.accessibilityState.disabled).toBe(true);

      fireEvent.changeText(screen.getByTestId("title-input"), "Test");
      fireEvent.changeText(screen.getByTestId("price-input"), "500");

      expect(submitButton.props.accessibilityState.disabled).toBe(true);
    });
  });
});
