// @ts-nocheck
// IMPROVE: Enable ts check @G2CCC 
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import Index from "@/app/(tabs)";
import * as hookMod from "@/hooks/useCandidates";
import * as swipeMod from "@/services/swipe";

jest.mock("@maplibre/maplibre-react-native", () => {
  // IMPROVE: Remove check bypass @G2CCC
  /* eslint-disable @typescript-eslint/no-require-imports */
  const React = require("react");
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { View } = require("react-native");
  return {
    __esModule: true,
    Logger: { setLogCallback: jest.fn(), setLogLevel: jest.fn() },
    MapLibreGL: {},
    MapView: (props) => <View {...props} testID="mock-map" />,
    Camera: (props) => <View {...props} />,
    MarkerView: (props) => <View {...props} />,
    Images: (props) => <View {...props} />,
    ShapeSource: (props) => <View {...props} />,
    SymbolLayer: (props) => <View {...props} />,
    RasterSource: (props) => <View {...props} />,
    RasterLayer: (props) => <View {...props} />,
    LineLayer: (props) => <View {...props} />,
    FillLayer: (props) => <View {...props} />,
    UserLocation: (props) => <View {...props} />,
  };
});
jest.mock("expo-router", () => {
  const router = { replace: jest.fn(), push: jest.fn() };
  const useFocusEffect = (cb) => (typeof cb === "function" ? cb() : undefined);
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
    useCandidates: () => ({
      loading: false,
      items: [
        { id: "u2", uid: "u2", name: "User2" },
        { id: "uX", uid: "uX", name: "Other" },
      ],
      setItems: setItemsMock,
    }),
    __TEST__: { setItemsMock },
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
  /* eslint-disable @typescript-eslint/no-require-imports */
  const React = require("react");
  /* eslint-disable @typescript-eslint/no-require-imports */
  const RN = require("react-native");
  const MockSwipeDeck = ({ data, onLike, onPass }) => (
    <RN.View testID="swipe-deck">
      <RN.Text>Mock SwipeDeck</RN.Text>
      <RN.Text testID="items-count">{data?.length ?? 0}</RN.Text>
      <RN.TouchableOpacity
        testID="like-btn"
        onPress={() => data?.[0] && onLike?.(data[0])}
      >
        <RN.Text>LIKE</RN.Text>
      </RN.TouchableOpacity>
      <RN.TouchableOpacity
        testID="pass-btn"
        onPress={() => data?.[0] && onPass?.(data[0])}
      >
        <RN.Text>PASS</RN.Text>
      </RN.TouchableOpacity>
    </RN.View>
  );
  MockSwipeDeck.displayName = "MockSwipeDeck";
  return { __esModule: true, default: MockSwipeDeck };
});

jest.mock("@/components/Segmented", () => {
  // IMPROVE: Remove check bypass @G2CCC
  /* eslint-disable @typescript-eslint/no-require-imports */
  const React = require("react");
  /* eslint-disable @typescript-eslint/no-require-imports */
  const RN = require("react-native");
  const MockSegmented = () => (
    <RN.View testID="segmented">
      <RN.Text>Mock Segmented</RN.Text>
    </RN.View>
  );
  MockSegmented.displayName = "MockSegmented";
  return { __esModule: true, default: MockSegmented };
});

jest.mock("@/components/HeaderLogo", () => {
  // IMPROVE: Remove check bypass @G2CCC
  /* eslint-disable @typescript-eslint/no-require-imports */
  const React = require("react");
  /* eslint-disable @typescript-eslint/no-require-imports */
  const RN = require("react-native");
  const MockHeaderLogo = () => (
    <RN.View testID="header-logo">
      <RN.Text>Logo</RN.Text>
    </RN.View>
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
  await waitFor(() =>
    expect(swipeMod.swipe).toHaveBeenCalledWith("me", "u2", "like"),
  );
  await waitFor(() =>
    expect(swipeMod.ensureMatchIfMutualLike).toHaveBeenCalledWith("me", "u2"),
  );
  await waitFor(() =>
    expect((hookMod as any).__TEST__.setItemsMock).toHaveBeenCalled(),
  );
});

it("pressing PASS calls swipe('pass') and setItems", async () => {
  render(<Index />);
  fireEvent.press(screen.getByTestId("pass-btn"));
  await waitFor(() =>
    expect(swipeMod.swipe).toHaveBeenCalledWith("me", "u2", "pass"),
  );
  await waitFor(() =>
    expect((hookMod as any).__TEST__.setItemsMock).toHaveBeenCalled(),
  );
});
