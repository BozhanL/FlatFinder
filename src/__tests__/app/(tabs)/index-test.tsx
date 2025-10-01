import Index from "@/app/(tabs)";
import type { Props as SwipeDeckProps } from "@/components/swipe/SwipeDeck";
import hookMod from "@/hooks/useCandidates";
import { ensureMatchIfMutualLike, swipe } from "@/services/swipe";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import type { EffectCallback } from "expo-router";

jest.mock("expo-router", () => {
  const router = { replace: jest.fn(), push: jest.fn() };
  const useFocusEffect = (cb: EffectCallback) =>
    typeof cb === "function" ? cb() : undefined;
  return { router, useFocusEffect };
});

jest.mock("@react-native-firebase/app", () => ({
  getApp: jest.fn(() => ({})),
}));

jest.mock("@react-native-firebase/auth", () => {
  const unsub = jest.fn();
  const onAuthStateChanged = jest.fn((_auth, cb) => {
    cb({ uid: "me" });
    return unsub;
  });
  const getAuth = jest.fn(() => ({ currentUser: { uid: "me" } }));
  return { getAuth, onAuthStateChanged };
});

jest.mock("@/hooks/useCandidates", () => {
  const setItemsMock = jest.fn();
  return {
    __esModule: true,
    default: () => ({
      loading: false,
      items: [
        { id: "u2", uid: "u2", name: "User2" },
        { id: "uX", uid: "uX", name: "Other" },
      ],
      setItems: setItemsMock,
    }),
  };
});

jest.mock("@/services/swipe", () => {
  const mockSwipe = jest.fn().mockResolvedValue(undefined);
  const mockEnsure = jest.fn().mockResolvedValue(undefined);
  return {
    __esModule: true,
    swipe: mockSwipe,
    ensureMatchIfMutualLike: mockEnsure,
    __TEST__: { mockSwipe, mockEnsure },
  };
});

jest.mock("@/components/swipe/SwipeDeck", () => {
  const { View, Text, TouchableOpacity } = jest.requireActual("react-native");
  const MockSwipeDeck = ({ data, onLike, onPass }: SwipeDeckProps) => (
    <View testID="swipe-deck">
      <Text>Mock SwipeDeck</Text>
      <Text testID="items-count">{data.length}</Text>
      <TouchableOpacity
        testID="like-btn"
        onPress={() => data[0] && onLike?.(data[0])}
      >
        <Text>LIKE</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="pass-btn"
        onPress={() => data[0] && onPass?.(data[0])}
      >
        <Text>PASS</Text>
      </TouchableOpacity>
    </View>
  );
  MockSwipeDeck.displayName = "MockSwipeDeck";
  return { __esModule: true, default: MockSwipeDeck };
});

jest.mock("@/components/Segmented", () => {
  const { View, Text } = jest.requireActual("react-native");
  const MockSegmented = () => (
    <View testID="segmented">
      <Text>Mock Segmented</Text>
    </View>
  );
  MockSegmented.displayName = "MockSegmented";
  return { __esModule: true, default: MockSegmented };
});

jest.mock("@/components/HeaderLogo", () => {
  const { View, Text } = jest.requireActual("react-native");
  const MockHeaderLogo = () => (
    <View testID="header-logo">
      <Text>Logo</Text>
    </View>
  );
  MockHeaderLogo.displayName = "MockHeaderLogo";
  return { __esModule: true, default: MockHeaderLogo };
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

it("renders SwipeDeck when logged in and candidates loaded", () => {
  render(<Index />);
  expect(screen.getByTestId("swipe-deck")).toBeTruthy();
  expect(screen.getByTestId("items-count").props.children).toBe(2);
});

it("pressing LIKE calls swipe, ensureMatchIfMutualLike and setItems", async () => {
  render(<Index />);
  fireEvent.press(screen.getByTestId("like-btn"));
  await waitFor(() => {
    expect(swipe).toHaveBeenCalledWith("me", "u2", "like");
  });
  await waitFor(() => {
    expect(ensureMatchIfMutualLike).toHaveBeenCalledWith("me", "u2");
  });
  await waitFor(() => {
    expect(hookMod(null).setItems).toHaveBeenCalled();
  });
});

it("pressing PASS calls swipe('pass') and setItems", async () => {
  render(<Index />);
  fireEvent.press(screen.getByTestId("pass-btn"));
  await waitFor(() => {
    expect(swipe).toHaveBeenCalledWith("me", "u2", "pass");
  });
  await waitFor(() => {
    expect(hookMod(null).setItems).toHaveBeenCalled();
  });
});
