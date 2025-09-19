import PropertyDetailsPage from "@/app/(modals)/[id]";
import { render, screen, waitFor } from "@testing-library/react-native";
import React from "react";

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ id: "prop1" }),
}));

// Mock firestore with fake property
jest.mock("@react-native-firebase/firestore", () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn().mockResolvedValue({
    exists: () => true,
    id: "prop1",
    data: () => ({
      title: "Test Property",
      price: 500,
      type: "rental",
      description: "test property",
      bedrooms: 2,
      bathrooms: 1,
      address: "123 Test St",
      imageUrl: "https://example.com/image.jpg",
      contract: 12,
    }),
  }),
}));

describe("PropertyDetailsPage", () => {
  it("renders loading state initially", async () => {
    render(<PropertyDetailsPage />);

    // Check that title exists
    await waitFor(() =>
      expect(screen.getByTestId("property-title")).toHaveTextContent(
        "Test Property",
      ),
    );
  });

  it("renders property details correctly", async () => {
    render(<PropertyDetailsPage />);

    await waitFor(() =>
      expect(screen.getByTestId("property-title")).toHaveTextContent(
        "Test Property",
      ),
    );

    await waitFor(() =>
      expect(screen.getByTestId("property-price")).toHaveTextContent(
        "$500/week",
      ),
    );

    await waitFor(() =>
      expect(screen.getByTestId("property-type")).toHaveTextContent("rental"),
    );

    await screen.findByText("test property");

    await screen.findByText("123 Test St");

    await screen.findByText("Bedrooms");

    await screen.findByText("Bathrooms");

    await screen.findByText("Minimum Contract");
  });
});
