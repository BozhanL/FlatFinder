import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import Profile from "@/app/(tabs)/profile";
import * as routerMod from "expo-router";
import * as authMod from "@react-native-firebase/auth";
import * as fsMod from "@react-native-firebase/firestore";
import { Alert } from "react-native";

jest.spyOn(routerMod, "router", "get").mockReturnValue({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
} as any);
jest.mock("@react-native-firebase/app", () => ({
  getApp: jest.fn(() => ({})),
}));

jest.mock("@react-native-firebase/auth", () => ({
  getAuth: jest.fn(() => ({ currentUser: { uid: "u1" } })),
  onAuthStateChanged: jest.fn((_auth: unknown, cb: (u: { uid: string } | null) => void) => {
    return jest.fn();
  }),
  signOut: jest.fn(async () => {}),
}));

jest.mock("@react-native-firebase/firestore", () => {
  const fns = {
    getFirestore: jest.fn(() => ({})),
    doc: jest.fn((_db: unknown, col: string, id: string) => ({ __p: `${col}/${id}` })),
    onSnapshot: jest.fn(), 
  };
  return fns;
});

jest.mock("@/components/HeaderLogo", () => {
  return function HeaderLogo() {
    return null;
  };
});

jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => {
  return function Icon() {
    return null;
  };
});

jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

const authMock = authMod as unknown as {
  getAuth: jest.Mock;
  onAuthStateChanged: jest.Mock;
  signOut: jest.Mock;
};

const fsMock = fsMod as unknown as {
  getFirestore: jest.Mock;
  doc: jest.Mock;
  onSnapshot: jest.Mock;
};

const router = routerMod.router as unknown as {
  push: jest.Mock;
  replace: jest.Mock;
  back: jest.Mock;
};

afterEach(() => {
  jest.clearAllMocks();
});

function emitSnapshot(data: any) {
  const call = fsMock.onSnapshot.mock.calls.at(-1);
  const next = call?.[1];
  if (typeof next === "function") {
    next({ id: "u1", data: () => data });
  }
}

function emitSnapshotError(err: any) {
  const call = fsMock.onSnapshot.mock.calls.at(-1);
  const errCb = call?.[2];
  if (typeof errCb === "function") {
    errCb(err);
  }
}


describe("Profile screen", () => {
  it("shows Loading…, subscribes to firestore, then renders profile", async () => {
    render(<Profile />);

    expect(screen.getByText("Loading…")).toBeTruthy();

    await waitFor(() => expect(fsMock.onSnapshot).toHaveBeenCalled());

    emitSnapshot({
      name: "Alice",
      age: 23,
      bio: "hi",
      budget: 600,
      location: "Wellington",
      tags: ["quiet", "student"],
    });

    expect(await screen.findByText(/Alice, 23/)).toBeTruthy();
    expect(screen.getByTestId("edit-btn")).toBeTruthy();
  });

  it("clicking edit button navigates to / (modals) / edit-profile", async () => {
    render(<Profile />);

    await waitFor(() => expect(fsMock.onSnapshot).toHaveBeenCalled());
    emitSnapshot({ name: "Bob" });

    fireEvent.press(screen.getByTestId("edit-btn"));
    expect(router.push).toHaveBeenCalledWith("/(modals)/edit-profile");
  });

  it("sign out button calls signOut and redirects to /login", async () => {
    render(<Profile />);

    await waitFor(() => expect(fsMock.onSnapshot).toHaveBeenCalled());
    emitSnapshot({ name: "Bob" });

    fireEvent.press(screen.getByTestId("signout-btn"));

    await waitFor(() => expect(authMock.signOut).toHaveBeenCalled());
    expect(router.replace).toHaveBeenCalledWith("/login");
  });

  it("when auth state changes to null, navigates to /login and stops loading", async () => {
    render(<Profile />);

    await waitFor(() => expect(authMock.onAuthStateChanged).toHaveBeenCalled());

    const cb = authMock.onAuthStateChanged.mock.calls[0][1] as (u: any) => void;
    cb(null);

    expect(router.replace).toHaveBeenCalledWith("/login");

    expect(screen.queryByText("Loading…")).toBeNull();
  });

  it("onSnapshot error logs and shows 'Profile not found'", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    render(<Profile />);

    await waitFor(() => expect(fsMock.onSnapshot).toHaveBeenCalled());

    emitSnapshotError(new Error("boom"));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith("profile onSnapshot error:", expect.any(Error));
    });

    expect(screen.getByText("Profile not found")).toBeTruthy();

    spy.mockRestore();
  });
});
