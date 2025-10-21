import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import SwipeDeck from "@/components/swipe/SwipeDeck";
import type { Flatmate } from "@/types/Flatmate";

// ---- Mocks ----
jest.mock("react-native-reanimated", () => {
  const Reanimated = jest.requireActual("react-native-reanimated/mock");
  Reanimated.runOnJS = <T extends (...args: unknown[]) => unknown>(fn: T): T =>
    fn;

  return Reanimated;
});

jest.mock("@expo/vector-icons", () => ({
  AntDesign: () => null,
}));

jest.mock("@/components/swipe/SwipeCard", () => {
  const { Text, View } = jest.requireActual("react-native");

  type MockProps = { item: { id: string; name: string } };
  function SwipeCard(props: MockProps) {
    return (
      <View testID={`card-${props.item.id}`}>
        <Text>{props.item.name}</Text>
      </View>
    );
  }
  return SwipeCard;
});

// ---- Helpers ----
function fm(partial: Partial<Flatmate> = {}, i = 0): Flatmate {
  return {
    id: `u${i}`,
    name: `User ${i}`,
    dob: null,
    location: "City",
    budget: 200,
    bio: "bio",
    tags: ["a", "b"],
    avatar: { uri: "x" },
    ...partial,
  } as Flatmate;
}

// ---- Tests ----
describe("SwipeDeck", () => {
  it('renders "Looking for more…" when no data', () => {
    render(<SwipeDeck data={[]} />);
    expect(screen.getByText(/Looking for more/i)).toBeTruthy();
  });

  it("renders the top card", () => {
    render(<SwipeDeck data={[fm({}, 1), fm({}, 2)]} />);
    expect(screen.getByTestId("card-u1")).toBeTruthy();
    expect(screen.queryByTestId("card-u2")).toBeNull();
  });

  it("pressing heart button triggers onLike(top)", () => {
    const like = jest.fn();
    const pass = jest.fn();
    render(
      <SwipeDeck
        data={[fm({ name: "Top" }, 1), fm({}, 2)]}
        onLike={like}
        onPass={pass}
      />,
    );

    fireEvent.press(screen.getByTestId("btn-like"));

    expect(like).toHaveBeenCalledTimes(1);
    expect(like.mock.calls[0][0].name).toBe("Top");
    expect(pass).not.toHaveBeenCalled();
  });

  it("pressing close button triggers onPass(top)", () => {
    const like = jest.fn();
    const pass = jest.fn();
    render(
      <SwipeDeck
        data={[fm({ name: "Top" }, 1), fm({}, 2)]}
        onLike={like}
        onPass={pass}
      />,
    );

    fireEvent.press(screen.getByTestId("btn-nope"));

    expect(pass).toHaveBeenCalledTimes(1);
    expect(pass.mock.calls[0][0].name).toBe("Top");
    expect(like).not.toHaveBeenCalled();
  });

  it("does not crash when no callbacks are provided", () => {
    render(<SwipeDeck data={[fm({}, 1), fm({}, 2)]} />);
    fireEvent.press(screen.getByTestId("btn-nope"));
    fireEvent.press(screen.getByTestId("btn-like"));
  });
});
