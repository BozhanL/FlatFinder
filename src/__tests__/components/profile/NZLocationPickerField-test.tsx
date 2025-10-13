import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import NZLocationPickerField from "@/components/profile/NZLocationPickerField";

describe("NZLocationPickerField", () => {
  it("Initial render: shows label and placeholder/current value", () => {
    const onChange = jest.fn();
    render(
      <NZLocationPickerField
        label="Preferred Location"
        value={null}
        onChange={onChange}
      />,
    );

    expect(screen.getByText("Preferred Location")).toBeTruthy();
    expect(screen.getByText("Select a region / area")).toBeTruthy();
  });

  it("Click to open panel, shows groups and items", async () => {
    const onChange = jest.fn();
    render(<NZLocationPickerField value={null} onChange={onChange} />);

    fireEvent.press(screen.getByText("Select a region / area"));

    // Panel title
    await screen.findByText("Select Location");

    // Has group header and an item
    expect(screen.getByText("Auckland")).toBeTruthy();
    expect(screen.getByText("North Shore")).toBeTruthy();
  });

  it("Search filter: matched items and their group visible, unmatched items not visible", async () => {
    const onChange = jest.fn();
    render(<NZLocationPickerField value={null} onChange={onChange} />);

    fireEvent.press(screen.getByText("Select a region / area"));
    await screen.findByText("Select Location");

    const search = screen.getByPlaceholderText(
      "Search city/area (e.g., CBD, North Shore)…",
    );
    fireEvent.changeText(search, "rotorua"); // Bay of Plenty -> Rotorua

    await waitFor(() => {
      expect(screen.getByText("Bay of Plenty")).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByText("Rotorua")).toBeTruthy();
    });

    // Unmatched items should disappear
    expect(screen.queryByText("Auckland CBD")).toBeNull();
  });

  it("Shows No results when search yields nothing", async () => {
    const onChange = jest.fn();
    render(<NZLocationPickerField value={null} onChange={onChange} />);

    fireEvent.press(screen.getByText("Select a region / area"));
    await screen.findByText("Select Location");

    const search = screen.getByPlaceholderText(
      "Search city/area (e.g., CBD, North Shore)…",
    );
    fireEvent.changeText(search, "zzzzzzzz");

    await screen.findByText("No results");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("Select item: calls onChange and closes panel, main input shows new value", async () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <NZLocationPickerField value={null} onChange={onChange} />,
    );

    // Open panel
    fireEvent.press(screen.getByText("Select a region / area"));
    await screen.findByText("Select Location");

    // Select North Shore
    fireEvent.press(screen.getByText("North Shore"));
    expect(onChange).toHaveBeenCalledWith("North Shore");

    // Parent passes controlled value back
    rerender(<NZLocationPickerField value="North Shore" onChange={onChange} />);

    // Panel should be closed
    await waitFor(() => {
      expect(screen.queryByText("Select Location")).toBeNull();
    });

    // Main view shows new value
    expect(screen.getByText("North Shore")).toBeTruthy();
  });

  it("Click Cancel closes panel and does not trigger onChange", async () => {
    const onChange = jest.fn();
    render(
      <NZLocationPickerField value={"Wellington CBD"} onChange={onChange} />,
    );

    fireEvent.press(screen.getByText("Wellington CBD"));
    await screen.findByText("Select Location");

    fireEvent.press(screen.getByText("Cancel"));

    await waitFor(() => {
      expect(screen.queryByText("Select Location")).toBeNull();
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});
