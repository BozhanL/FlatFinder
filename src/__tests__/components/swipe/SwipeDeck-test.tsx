import type { Props as SwipeCardProps } from "@/components/swipe/SwipeCard";
import SwipeDeck from "@/components/swipe/SwipeDeck";
import { fireEvent, render, screen } from "@testing-library/react-native";

jest.mock("react-native-reanimated", () => {
  const Reanimated = jest.requireActual("react-native-reanimated/mock");
  Reanimated.runOnJS = jest.fn((fn) => fn);
  return Reanimated;
});

jest.mock("@expo/vector-icons", () => ({
  AntDesign: () => null,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@/components/swipe/SwipeCard", () => {
  const { Text, View } = jest.requireActual("react-native");
  return function SwipeCard(props: SwipeCardProps) {
    const { item } = props;
    return (
      <View testID={`card-${item.id}`}>
        <Text>{item.name}</Text>
      </View>
    );
  };
});

function fm(partial = {}, i = 0) {
  return {
    id: `u${i}`,
    name: `User ${i}`,
    age: 21,
    location: "City",
    budget: 200,
    bio: "bio",
    tags: ["a", "b"],
    avatar: { uri: "x" },
    ...partial,
  };
}

describe("SwipeDeck", () => {
  it('renders "Looking for more…" when no data', () => {
    render(<SwipeDeck data={[]} />);
    expect(screen.getByText(/Looking for more/i)).toBeTruthy();
  });

  it("renders top and next cards", () => {
    render(<SwipeDeck data={[fm({}, 1), fm({}, 2)]} />);

    expect(screen.getByText("User 1")).toBeTruthy();
    expect(screen.getByText("User 2")).toBeTruthy();
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

    // IMPROVE: use safe variant @G2CCC
    const buttons = screen.UNSAFE_getAllByType(
      jest.requireActual("react-native").TouchableOpacity,
    );
    const heartBtn = buttons[1];
    fireEvent.press(heartBtn);

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

    // IMPROVE: use safe variant @G2CCC
    const buttons = screen.UNSAFE_getAllByType(
      jest.requireActual("react-native").TouchableOpacity,
    );
    const closeBtn = buttons[0];
    fireEvent.press(closeBtn);

    expect(pass).toHaveBeenCalledTimes(1);
    expect(pass.mock.calls[0][0].name).toBe("Top");
    expect(like).not.toHaveBeenCalled();
  });

  it("does not crash when no callbacks are provided", () => {
    render(<SwipeDeck data={[fm({}, 1), fm({}, 2)]} />);

    // IMPROVE: use safe variant @G2CCC
    const buttons = screen.UNSAFE_getAllByType(
      jest.requireActual("react-native").TouchableOpacity,
    );
    fireEvent.press(buttons[0]);
    fireEvent.press(buttons[1]);
  });
});
