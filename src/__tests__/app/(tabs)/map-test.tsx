import Index from "@/app/(tabs)/index";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";

// Mock data
jest.mock("@react-native-firebase/firestore", () => {
  return () => ({
    collection: () => ({
      get: jest.fn().mockResolvedValue({
        forEach: (cb: any) => {
          cb({
            id: "prop1",
            data: () => ({
              title: "Test Property",
              coordinates: { latitude: -36.85, longitude: 174.76 },
              price: 500,
              type: "rental",
            }),
          });
        },
      }),
    }),
  });
});

describe("Index screen", () => {
  it("Switch from flatmates to properties tab", async () => {
    render(<Index />);

    // Flatmates list is visible initially as it is the default tab
    expect(screen.getByText("Flatmate list")).toBeTruthy();

    // Switch to Properties tab
    fireEvent.press(screen.getByText("Properties"));

    await waitFor(() => {
      // Flatmate list should be gone
      expect(screen.queryByText("Flatmate list")).toBeNull();
    });
  });

  it("Render map when properties is selected", async () => {
    render(<Index />);

    // Switch to Properties tab
    fireEvent.press(screen.getByText("Properties"));

    // Wait for mapview to appear
    await waitFor(() => {
      expect(screen.getByTestId("map-view")).toBeTruthy();
    });
  });
});
