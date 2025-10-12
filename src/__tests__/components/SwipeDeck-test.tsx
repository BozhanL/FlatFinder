import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import SwipeDeck from "@/components/swipe/SwipeDeck";
import type { Flatmate } from "@/types/Flatmate";

// ---- Mocks ----
jest.mock("react-native-reanimated", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.runOnJS = (fn: (...args: any[]) => any) => fn;
  return Reanimated;
});

jest.mock("@expo/vector-icons", () => ({
  AntDesign: () => null,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@/components/swipe/SwipeCard", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text, View } = require("react-native");
  return function SwipeCard(props: any) {
    const { item } = props || {};
    return (
      <View testID={`card-${item.id}`}>
        <Text>{item.name}</Text>
      </View>
    );
  };
});

// ---- Helpers ----
function fm(partial: Partial<Flatmate> = {}, i = 0): Flatmate {
  return {
    id: `u${i}`,
    name: `User ${i}`,
    age: 21 as any,
    location: "City" as any,
    budget: 200 as any,
    bio: "bio" as any,
    tags: ["a", "b"] as any,
    avatar: { uri: "x" } as any,
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
