// @ts-nocheck
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

export const swipeMock = jest.fn().mockResolvedValue(undefined);
export const ensureMatchIfMutualLikeMock = jest
  .fn()
  .mockResolvedValue(undefined);

jest.mock("expo-router", () => {
  const router = {
    replace: jest.fn(),
    push: jest.fn(),
  };
  return { router };
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
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require("react-native");
  const MockSwipeDeck = ({ data, onLike, onPass }) => {
    return (
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
  };

  MockSwipeDeck.displayName = "MockSwipeDeck";
  return { __esModule: true, default: MockSwipeDeck };
});

// Segmented
jest.mock("@/components/Segmented", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require("react-native");

  const MockSegmented = () => (
    <RN.View testID="segmented">
      <RN.Text>Mock Segmented</RN.Text>
    </RN.View>
  );
  MockSegmented.displayName = "MockSegmented";
  return { __esModule: true, default: MockSegmented };
});

// HeaderLogo
jest.mock("@/components/HeaderLogo", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
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
  const passBtn = screen.getByTestId("pass-btn");

  fireEvent.press(passBtn);

  await waitFor(() =>
    expect(swipeMod.swipe).toHaveBeenCalledWith("me", "u2", "pass"),
  );
  await waitFor(() =>
    expect((hookMod as any).__TEST__.setItemsMock).toHaveBeenCalled(),
  );
});
