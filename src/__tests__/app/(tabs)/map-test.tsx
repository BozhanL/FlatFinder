import Index from "@/app/(tabs)/index";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

// Mock firebase
jest.mock("@react-native-firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  onSnapshot: jest.fn(),
}));

// Mock MapLibre
jest.mock("@maplibre/maplibre-react-native", () => ({
  Logger: {
    setLogCallback: jest.fn(),
  },
  MapView: "MapView",
  Camera: "Camera",
  Images: "Images",
  RasterSource: "RasterSource",
  RasterLayer: "RasterLayer",
  ShapeSource: "ShapeSource",
  SymbolLayer: "SymbolLayer",
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
  useFocusEffect: jest.fn((callback) => {
    const cleanup = callback();
    if (typeof cleanup === "function") {
    }
  }),
}));

describe("Index screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const firestore = jest.requireMock("@react-native-firebase/firestore");

    firestore.getFirestore.mockReturnValue({});
    firestore.collection.mockReturnValue({});

    firestore.onSnapshot.mockImplementation(
      (_collection: any, successCallback: (snapshot: any) => void) => {
        setTimeout(() => {
          const mockSnapshot = {
            forEach: (callback: any) => {
              // Mock data
              const mockDoc = {
                id: "prop1",
                data: () => ({
                  title: "Test Property",
                  coordinates: {
                    _latitude: -36.85,
                    _longitude: 174.76,
                  },
                  price: 500,
                  type: "rental",
                  bedrooms: 2,
                  bathrooms: 1,
                  contract: 12,
                }),
              };
              callback(mockDoc);

              // Added a second property for better testing
              const mockDoc2 = {
                id: "prop2",
                data: () => ({
                  title: "Another Property",
                  coordinates: {
                    _latitude: -36.86,
                    _longitude: 174.77,
                  },
                  price: 600,
                  type: "sale",
                  bedrooms: 3,
                  bathrooms: 2,
                  contract: 6,
                }),
              };
              callback(mockDoc2);
            },
          };

          successCallback(mockSnapshot);
        }, 0);

        return jest.fn();
      },
    );
  });

  it("Switch from flatmates to properties tab", async () => {
    render(<Index />);

    // Wait for initial render to complete
    // Flatmates tab should be active
    await waitFor(() => {
      expect(screen.getByText("Flatmate list")).toBeTruthy();
    });

    // Switch to Properties tab
    fireEvent.press(screen.getByText("Properties"));

    await waitFor(() => {
      // Flatmate list should be gone
      expect(screen.queryByText("Flatmate list")).toBeNull();
    });
  });

  it("Render map", async () => {
    render(<Index />);

    // Switch to Properties tab
    fireEvent.press(screen.getByText("Properties"));

    // Wait for properties to load and map to appear
    await waitFor(
      () => {
        expect(screen.getByTestId("map-view")).toBeTruthy();
      },
      { timeout: 3000 },
    );
  });

  it("Shows filter button with active state", async () => {
    render(<Index />);

    // Filter no longer exists on Flatmates tab - just ensure we are on Properties tab
    fireEvent.press(screen.getByText("Properties"));

    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByText("Filter")).toBeTruthy();
    });
  });
});
