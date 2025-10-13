import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import BudgetField from "@/components/profile/BudgetField";

jest.mock("@react-native-community/slider", () => {
  const ReactReq = jest.requireActual("react");
  const RN = jest.requireActual("react-native");
  function Slider(props: {
    value?: number;
    minimumValue?: number;
    step?: number;
    onValueChange?: (v: number) => void;
  }) {
    const next = (props.value ?? props.minimumValue ?? 0) + (props.step ?? 1);
    return ReactReq.createElement(
      RN.TouchableOpacity,
      {
        testID: "mock-slider",
        onPress: () => props.onValueChange?.(next),
      },
      ReactReq.createElement(RN.Text, null, "slider"),
    );
  }
  return Slider;
});

describe("BudgetField", () => {
  it("displays weekly amount (Per week) by default and formats it", () => {
    const onChange = jest.fn();
    render(<BudgetField value={250} onChange={onChange} />);

    // Title
    expect(screen.getByText("Budget")).toBeTruthy();

    // Input field shows $250 (localized: $250)
    const input = screen.getByPlaceholderText("e.g. $250");
    expect(input.props.value).toBe("$250");
  });

  it("switches to Per month and displays the converted and rounded value", () => {
    const onChange = jest.fn();
    render(<BudgetField value={260} onChange={onChange} />);

    // Switch to Per month
    fireEvent.press(screen.getByText("Per month"));

    // Placeholder changes
    expect(screen.getByPlaceholderText("e.g. $1,200")).toBeTruthy();

    // 260 * 52 / 12 = 1126.66… -> 1127 -> $1,127
    const input = screen.getByPlaceholderText("e.g. $1,200");
    expect(input.props.value).toBe("$1,127");
  });

  it("clicking preset buttons sets the corresponding value", () => {
    const onChange = jest.fn();
    render(<BudgetField value={null} onChange={onChange} />);

    fireEvent.press(screen.getByText("$150"));
    expect(onChange).toHaveBeenCalledWith(150);

    fireEvent.press(screen.getByText("$400"));
    expect(onChange).toHaveBeenCalledWith(400);
  });

  it("decrement/increment buttons adjust by step and clamp/roundStep", () => {
    function Harness() {
      const [v, setV] = React.useState<number>(200);
      const handleChange = (n: number | null) => {
        if (typeof n === "number") setV(n);
      };
      return (
        <BudgetField
          value={v}
          onChange={handleChange}
          step={10}
          min={50}
          max={220}
        />
      );
    }

    render(<Harness />);

    // -10 -> 190
    fireEvent.press(screen.getByText("−10"));

    // +10 -> 200, +10 -> 210, +10 -> 220 (should not exceed 220)
    fireEvent.press(screen.getByText("+10"));
    fireEvent.press(screen.getByText("+10"));
    fireEvent.press(screen.getByText("+10"));

    // Check if the input field displays 220
    const input = screen.getByPlaceholderText("e.g. $250");
    expect(input.props.value).toBe("$220");
  });

  it("input onEndEditing: parses value in weekly mode and calls back", () => {
    const onChange = jest.fn();
    render(<BudgetField value={null} onChange={onChange} />);

    const input = screen.getByPlaceholderText("e.g. $250");

    // Simulate entering "$300", directly trigger onEndEditing in RN Testing Library
    fireEvent(input, "endEditing", { nativeEvent: { text: "$300" } });

    // Weekly mode directly 300, roundStep(300) is still 300
    expect(onChange).toHaveBeenCalledWith(300);
  });

  it("input onEndEditing: parses value in monthly mode, converts by 12/52 and roundStep", () => {
    const onChange = jest.fn();
    render(<BudgetField value={null} onChange={onChange} step={10} />);

    // Switch to month
    fireEvent.press(screen.getByText("Per month"));

    const input = screen.getByPlaceholderText("e.g. $1,200");
    // Enter 1200 -> weekly = round(1200*12/52)=277 -> roundStep(277,10)=280
    fireEvent(input, "endEditing", { nativeEvent: { text: "1200" } });
    expect(onChange).toHaveBeenCalledWith(280);
  });

  it("entering non-numeric value calls back null", () => {
    const onChange = jest.fn();
    render(<BudgetField value={null} onChange={onChange} />);

    const input = screen.getByPlaceholderText("e.g. $250");
    fireEvent(input, "endEditing", { nativeEvent: { text: "abc" } });
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("slider change calls back rounded value", () => {
    const onChange = jest.fn();
    render(<BudgetField value={123} onChange={onChange} step={5} />);

    // Our mock will call onValueChange with value+step when pressed
    fireEvent.press(screen.getByTestId("mock-slider"));

    // 123 + 5 = 128, then Math.round in component -> 128
    expect(onChange).toHaveBeenCalledWith(128);
  });

  it("range hint text displays min–max NZD/week", () => {
    const onChange = jest.fn();
    render(<BudgetField value={null} onChange={onChange} min={60} max={990} />);

    expect(screen.getByText("60–990 NZD/week")).toBeTruthy();
  });
});
