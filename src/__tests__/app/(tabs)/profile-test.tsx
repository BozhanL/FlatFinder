// @ts-nocheck
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { router } from "expo-router";
import React from "react";
import { Alert } from "react-native";

// Import after mocks so component sees them
import Profile from "@/app/(tabs)/profile";

import * as authMod from "@react-native-firebase/auth";
import * as fsMod from "@react-native-firebase/firestore";
jest.mock("expo-router", () => {
  const push = jest.fn();
  const replace = jest.fn();
  const back = jest.fn();
  return { router: { push, replace, back } };
});

// Mock RN Firebase - app
jest.mock("@react-native-firebase/app", () => ({
  getApp: jest.fn(() => ({})),
}));

// Mock RN Firebase - auth
jest.mock("@react-native-firebase/auth", () => {
  const unsub = jest.fn();
  const onAuthStateChanged = jest.fn((_auth, cb) => {
    cb({ uid: "u1" }); // default: logged in
    return unsub; // return unsubscribe to avoid leaks
  });
  const signOut = jest.fn();
  const getAuth = jest.fn(() => ({ currentUser: { uid: "u1" } }));
  return { getAuth, onAuthStateChanged, signOut };
});

// Mock RN Firebase - firestore
jest.mock("@react-native-firebase/firestore", () => {
  const unsub = jest.fn();
  const onSnapshot = jest.fn((_ref, next, error) => unsub); // return unsubscribe
  const doc = jest.fn((_db, col, id) => ({ __path: `${col}/${id}` }));
  const getFirestore = jest.fn(() => ({}));
  return { getFirestore, doc, onSnapshot };
});

// Convenient handles to the mocked functions

const getAuthMock = authMod.getAuth as jest.Mock;
const onAuthStateChangedMock = authMod.onAuthStateChanged as jest.Mock;
const signOutMock = authMod.signOut as jest.Mock;

const onSnapshotMock = fsMod.onSnapshot as jest.Mock;

// Helpers to drive Firestore snapshot callbacks
function emitSnapshot(data: any) {
  const cb = onSnapshotMock.mock.calls.at(-1)?.[1]; // (ref, next, error?)
  const snap = { id: "u1", data: () => data };
  act(() => cb(snap));
}
function emitSnapshotError(err: any) {
  const errCb = onSnapshotMock.mock.calls.at(-1)?.[2];
  act(() => errCb?.(err));
}

jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

// Clean up between tests
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe("Profile screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // default: logged in
    getAuthMock.mockReturnValue({ currentUser: { uid: "u1" } });
    onAuthStateChangedMock.mockImplementation((_auth, cb) => {
      cb({ uid: "u1" });
      return jest.fn(); // unsubscribe
    });
  });

  it("Initial state: shows Loading…", () => {
    render(<Profile />);
    expect(screen.getByText("Loading…")).toBeTruthy();
  });

  it('When user is not logged in: redirects to /login and shows "Profile not found"', async () => {
    // make auth return null and emit null in listener
    getAuthMock.mockReturnValue({ currentUser: null });
    onAuthStateChangedMock.mockImplementation((_auth, cb) => {
      cb(null);
      return jest.fn();
    });

    render(<Profile />);

    expect(router.replace).toHaveBeenCalledWith("/login");
    expect(await screen.findByText("Profile not found")).toBeTruthy();
  });

  it("When user has data: displays name and age; pressing edit button navigates", async () => {
    render(<Profile />);

    expect(onSnapshotMock).toHaveBeenCalled();

    emitSnapshot({ name: "Tony", age: 22, tags: [] });

    expect(await screen.findByText(/Tony/)).toBeTruthy();
    expect(screen.getByText(/22/)).toBeTruthy();

    // Make sure your component has testID="edit-btn" on the edit button
    fireEvent.press(screen.getByTestId("edit-btn"));

    expect(router.push).toHaveBeenCalledWith("/(modals)/edit-profile");
  });

  it("Sign out success: calls signOut and redirects to /login", async () => {
    signOutMock.mockResolvedValueOnce(undefined);
    render(<Profile />);
    emitSnapshot({ name: "U" });

    fireEvent.press(screen.getByTestId("signout-btn"));

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/login");
    });
  });

  it("Sign out failure: shows an Alert", async () => {
    signOutMock.mockRejectedValueOnce(new Error("boom"));

    render(<Profile />);
    emitSnapshot({ name: "U" });

    fireEvent.press(screen.getByTestId("signout-btn"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Sign out failed",
        "Error: boom",
      );
    });
  });

  it('onSnapshot error: logs error and renders "Profile not found"', async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(<Profile />);
    emitSnapshotError(new Error("fs down"));

    expect(spy).toHaveBeenCalledWith(
      "profile onSnapshot error:",
      expect.any(Error),
    );
    expect(await screen.findByText("Profile not found")).toBeTruthy();
  });
});
