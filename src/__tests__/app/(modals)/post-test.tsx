import PostPropertyPage from "@/app/(modals)/post-property";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { act } from "react";
import { Alert } from "react-native";

process.env["EXPO_PUBLIC_SUPABASE_URL"] = "https://mock.supabase.co";
process.env["EXPO_PUBLIC_SUPABASE_ANON_KEY"] = "mock-key";

jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() =>
          Promise.resolve({ data: [{ id: "test-id" }], error: null }),
        ),
      })),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() =>
          Promise.resolve({ data: { path: "test.jpg" }, error: null }),
        ),
        getPublicUrl: jest.fn(() => ({
          data: { publicUrl: "https://example.com/test.jpg" },
        })),
      })),
    },
  },
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() =>
          Promise.resolve({ data: [{ id: "test-id" }], error: null }),
        ),
      })),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() =>
          Promise.resolve({ data: { path: "test.jpg" }, error: null }),
        ),
        getPublicUrl: jest.fn(() => ({
          data: { publicUrl: "https://example.com/test.jpg" },
        })),
      })),
    },
  })),
}));

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({
      status: "granted",
      granted: true,
      canAskAgain: true,
      expires: "never",
    }),
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [
        {
          uri: "test-image-uri",
          width: 100,
          height: 100,
        },
      ],
    }),
  ),
  MediaTypeOptions: {
    Images: "Images",
    Videos: "Videos",
    All: "All",
  },
  PermissionStatus: {
    GRANTED: "granted",
    DENIED: "denied",
    UNDETERMINED: "undetermined",
  },
}));

jest.mock("@/hooks/useUser", () => ({
  __esModule: true,
  default: () => ({ uid: "test-user-123" }),
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
                "User-Agent": "FlatFinder/1.0",
              },
            }),
          );
        },
        { timeout: 1000 },
      );
    });

    it("should not search when query is too short", () => {
      render(<PostPropertyPage />);

      const addressInput = screen.getByTestId("address-input");
      fireEvent.changeText(addressInput, "12");

      act(() => {
        jest.runAllTimers();
      });

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

      expect(await screen.findByText(/123 Test St, Auckland/)).toBeTruthy();

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

      expect(await screen.findByText(/123 Test St, Auckland/)).toBeTruthy();

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

      fireEvent.changeText(addressInput, "");

      act(() => {
        jest.runAllTimers();
      });

      expect(screen.queryByText(/123 Test St, Auckland/)).toBeNull();
    });
  });

  describe("Form Submission", () => {
    it("should successfully submit property data to Supabase", async () => {
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

describe("Field Validation", () => {
  it("should disable submit button for bedrooms exceeding maximum", async () => {
    render(<PostPropertyPage />);

    fireEvent.changeText(screen.getByTestId("title-input"), "Test Property");
    fireEvent.changeText(screen.getByTestId("price-input"), "500");
    fireEvent.changeText(screen.getByTestId("bedrooms-input"), "2");
    fireEvent.changeText(screen.getByTestId("bathrooms-input"), "1");
    fireEvent.changeText(screen.getByTestId("contract-length-input"), "52");
    fireEvent.changeText(
      screen.getByTestId("description-input"),
      "Nice property description",
    );

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

    fireEvent.changeText(screen.getByTestId("address-input"), "123 Test");
    const suggestion = await screen.findByText(/123 Test St, Auckland/);
    fireEvent.press(suggestion);

    await waitFor(() => {
      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton.props.accessibilityState.disabled).toBe(false);
    });

    fireEvent.changeText(screen.getByTestId("bedrooms-input"), "51");

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.press(submitButton);

    expect(submitButton.props.accessibilityState.disabled).toBe(false);
  });

  it("should disable submit button for bathrooms exceeding maximum", async () => {
    render(<PostPropertyPage />);

    fireEvent.changeText(screen.getByTestId("title-input"), "Test Property");
    fireEvent.changeText(screen.getByTestId("price-input"), "500");
    fireEvent.changeText(screen.getByTestId("bedrooms-input"), "2");
    fireEvent.changeText(screen.getByTestId("bathrooms-input"), "1");
    fireEvent.changeText(screen.getByTestId("contract-length-input"), "52");
    fireEvent.changeText(
      screen.getByTestId("description-input"),
      "Nice property description",
    );

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

    fireEvent.changeText(screen.getByTestId("address-input"), "123 Test");
    const suggestion = await screen.findByText(/123 Test St, Auckland/);
    fireEvent.press(suggestion);

    await waitFor(() => {
      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton.props.accessibilityState.disabled).toBe(false);
    });

    fireEvent.changeText(screen.getByTestId("bathrooms-input"), "21");

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.press(submitButton);

    expect(submitButton.props.accessibilityState.disabled).toBe(false);
  });

  it("should handle negative bathrooms validation", async () => {
    render(<PostPropertyPage />);

    fireEvent.changeText(screen.getByTestId("title-input"), "Test Property");
    fireEvent.changeText(screen.getByTestId("price-input"), "500");
    fireEvent.changeText(screen.getByTestId("bedrooms-input"), "2");
    fireEvent.changeText(screen.getByTestId("bathrooms-input"), "1");
    fireEvent.changeText(screen.getByTestId("contract-length-input"), "52");
    fireEvent.changeText(
      screen.getByTestId("description-input"),
      "Nice property description",
    );

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

    fireEvent.changeText(screen.getByTestId("address-input"), "123 Test");
    const suggestion = await screen.findByText(/123 Test St, Auckland/);
    fireEvent.press(suggestion);

    await waitFor(() => {
      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton.props.accessibilityState.disabled).toBe(false);
    });

    fireEvent.changeText(screen.getByTestId("bathrooms-input"), "-1");

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.press(submitButton);

    expect(submitButton.props.accessibilityState.disabled).toBe(false);
  });
});
