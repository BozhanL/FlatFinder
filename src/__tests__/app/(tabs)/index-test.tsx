// @ts-nocheck
import React from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from "@testing-library/react-native";

import Index from "@/app/(tabs)";
import * as authMod from "@react-native-firebase/auth";
import * as hookMod from "@/hooks/useCandidates";
import * as swipeMod from "@/services/swipe";
import { router } from "expo-router";

import { View, Text, TouchableOpacity } from "react-native";

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
  const state = {
    items: [{ id: "u2", name: "Jane" }],
    loading: false,
    setItems: jest.fn(),
  };
  const useCandidates = jest.fn(() => state);
  return { useCandidates, __state: state };
});

jest.mock("@/services/swipe", () => {
  const swipe = jest.fn(async () => {});
  const ensureMatchIfMutualLike = jest.fn(async () => null);
  return { swipe, ensureMatchIfMutualLike };
});

jest.mock("@/components/SwipeDeck", () => {
  const MockSwipeDeck = ({ data, onLike, onPass }) => {
    return (
      <View testID="swipe-deck">
        <Text>Mock SwipeDeck</Text>
        <Text testID="items-count">{data?.length ?? 0}</Text>
        <TouchableOpacity
          testID="like-btn"
          onPress={() => data?.[0] && onLike?.(data[0])}
        >
          <Text>LIKE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="pass-btn"
          onPress={() => data?.[0] && onPass?.(data[0])}
        >
          <Text>PASS</Text>
        </TouchableOpacity>
      </View>
    );
  };

  MockSwipeDeck.displayName = "MockSwipeDeck";
  return MockSwipeDeck;
});

// Segmented
jest.mock("@/components/Segmented", () => {
  const MockSegmented = (props: any) => (
    <View testID="segmented">
      <Text>Mock Segmented</Text>
    </View>
  );
  MockSegmented.displayName = "MockSegmented";
  return MockSegmented;
});

// HeaderLogo
jest.mock("@/components/HeaderLogo", () => {
  const MockHeaderLogo = () => (
    <View testID="header-logo">
      <Text>Logo</Text>
    </View>
  );
  MockHeaderLogo.displayName = "MockHeaderLogo";
  return MockHeaderLogo;
});

const onAuthStateChangedMock = authMod.onAuthStateChanged as jest.Mock;
const getAuthMock = authMod.getAuth as jest.Mock;

const candidatesState: any = (hookMod as any).__state;

const swipeMock = swipeMod.swipe as jest.Mock;
const ensureMatchIfMutualLikeMock =
  swipeMod.ensureMatchIfMutualLike as jest.Mock;

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe("Index screen", () => {
  it("shows Loading… while auth checking or no uid + not loading", () => {
    onAuthStateChangedMock.mockImplementationOnce((_auth, _cb) => {
      return jest.fn();
    });

    render(<Index />);
    expect(screen.getByText("Loading…")).toBeTruthy();
  });

  it("redirects to /login when no uid after auth check", async () => {
    getAuthMock.mockReturnValueOnce({ currentUser: null });
    onAuthStateChangedMock.mockImplementationOnce((_auth, cb) => {
      cb(null);
      return jest.fn();
    });

    render(<Index />);
    expect(router.replace).toHaveBeenCalledWith("/login");
  });

  it("renders SwipeDeck when logged in and candidates loaded", () => {
    render(<Index />);
    expect(screen.getByTestId("swipe-deck")).toBeTruthy();
    expect(screen.getByTestId("items-count").props.children).toBe(1);
  });

  it("pressing LIKE calls swipe, ensureMatchIfMutualLike and setItems", async () => {
    render(<Index />);
    const likeBtn = screen.getByTestId("like-btn");

    fireEvent.press(likeBtn);

    expect(swipeMock).toHaveBeenCalledWith("me", "u2", "like");
    expect(ensureMatchIfMutualLikeMock).toHaveBeenCalledWith("me", "u2");

    expect(candidatesState.setItems).toHaveBeenCalled();
  });

  it("pressing PASS calls swipe('pass') and setItems", async () => {
    render(<Index />);
    const passBtn = screen.getByTestId("pass-btn");

    fireEvent.press(passBtn);

    expect(swipeMock).toHaveBeenCalledWith("me", "u2", "pass");
    expect(candidatesState.setItems).toHaveBeenCalled();
  });
});
