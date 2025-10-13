import Profile from "@/app/(tabs)/profile";
import * as authMod from "@react-native-firebase/auth";
import * as fsMod from "@react-native-firebase/firestore";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import type { Router } from "expo-router";
import * as routerMod from "expo-router";
import { Alert } from "react-native";

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
} satisfies Pick<Router, "push" | "replace" | "back">;

jest
  .spyOn(routerMod, "router", "get")
  .mockReturnValue(mockRouter as unknown as Router);

jest.mock("@react-native-firebase/app", () => ({
  getApp: jest.fn(() => ({})),
}));

jest.mock("@react-native-firebase/auth", () => ({
  getAuth: jest.fn(() => ({ currentUser: { uid: "u1" } })),
  onAuthStateChanged: jest.fn(
    (_auth: unknown, _cb: (u: { uid: string } | null) => void) => {
      return jest.fn();
    },
  ),
  signOut: jest.fn(() => Promise.resolve()),
}));

jest.mock("@react-native-firebase/firestore", () => {
  const fns = {
    getFirestore: jest.fn(() => ({})),
    doc: jest.fn((_db: unknown, col: string, id: string) => ({
      __p: `${col}/${id}`,
    })),
    onSnapshot: jest.fn(),
  };
  return fns;
});

jest.mock(
  "@/components/HeaderLogo",
  () =>
    function HeaderLogo() {
      return null;
    },
);
jest.mock(
  "@expo/vector-icons/MaterialCommunityIcons",
  () =>
    function Icon() {
      return null;
    },
);

jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

const authMock = authMod as unknown as {
  getAuth: jest.Mock;
  onAuthStateChanged: jest.Mock<
    ReturnType<typeof jest.fn>,
    [unknown, (u: { uid: string } | null) => void]
  >;
  signOut: jest.Mock<Promise<void>, []>;
};

const fsMock = fsMod as unknown as {
  getFirestore: jest.Mock;
  doc: jest.Mock;
  onSnapshot: jest.Mock;
};

const router = mockRouter;

afterEach(() => {
  jest.clearAllMocks();
});

type SnapData = Record<string, unknown>;

async function emitSnapshot(data: SnapData): Promise<void> {
  const call = fsMock.onSnapshot.mock.calls.at(-1);
  const next = call?.[1] as
    | ((snap: { id: string; data: () => SnapData }) => void)
    | undefined;
  act(() => {
    if (next) next({ id: "u1", data: () => data });
  });
  await Promise.resolve();
}

async function emitSnapshotError(err: unknown): Promise<void> {
  const call = fsMock.onSnapshot.mock.calls.at(-1);
  const errCb = call?.[2] as ((e: unknown) => void) | undefined;
  act(() => {
    if (errCb) errCb(err);
  });
  await Promise.resolve();
}

async function emitAuthChange(user: { uid: string } | null): Promise<void> {
  const cb = authMock.onAuthStateChanged.mock.calls[0]?.[1] as
    | ((u: { uid: string } | null) => void)
    | undefined;
  act(() => {
    cb?.(user);
  });
  await Promise.resolve();
}

describe("Profile screen", () => {
  it("shows Loading…, subscribes to firestore, then renders profile", async () => {
    render(<Profile />);

    expect(screen.getByText("Loading…")).toBeTruthy();

    await waitFor(() => {
      expect(fsMock.onSnapshot).toHaveBeenCalled();
    });

    await emitSnapshot({
      name: "Alice",
      age: 23,
      bio: "hi",
      budget: 600,
      location: "Wellington",
      tags: ["quiet", "student"],
    });

    expect(await screen.findByText(/Alice/)).toBeTruthy();
    expect(screen.getByTestId("edit-btn")).toBeTruthy();
  });

  it("clicking edit button navigates to / (modals) / edit-profile", () => {
    return (async () => {
      render(<Profile />);
      await screen.findByText("Loading…");

      await waitFor(() => {
        expect(fsMock.onSnapshot).toHaveBeenCalled();
      });
      await emitSnapshot({ name: "Bob" });

      const editBtn = await screen.findByTestId("edit-btn");
      fireEvent.press(editBtn);
      expect(router.push).toHaveBeenCalledWith("/(modals)/edit-profile");
    })();
  });

  it("sign out button calls signOut and redirects to /login", () => {
    return (async () => {
      render(<Profile />);
      await screen.findByText("Loading…");

      await waitFor(() => {
        expect(fsMock.onSnapshot).toHaveBeenCalled();
      });
      await emitSnapshot({ name: "Bob" });

      const signoutBtn = await screen.findByTestId("signout-btn");
      fireEvent.press(signoutBtn);

      await waitFor(() => {
        expect(authMock.signOut).toHaveBeenCalled();
      });
      expect(router.replace).toHaveBeenCalledWith("/login");
    })();
  });

  it("when auth state changes to null, navigates to /login and stops loading", () => {
    return (async () => {
      render(<Profile />);
      await screen.findByText("Loading…");

      await waitFor(() => {
        expect(authMock.onAuthStateChanged).toHaveBeenCalled();
      });

      await emitAuthChange(null);

      await waitFor(() => {
        expect(router.replace).toHaveBeenCalledWith("/login");
      });

      expect(screen.queryByText("Loading…")).toBeNull();
    })();
  });

  it("onSnapshot error logs and shows 'Profile not found'", async () => {
    const spy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(<Profile />);

    await waitFor(() => {
      expect(fsMock.onSnapshot).toHaveBeenCalled();
    });
    await emitSnapshotError(new Error("boom"));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        "profile onSnapshot error:",
        expect.any(Error),
      );
    });

    expect(screen.getByText("Profile not found")).toBeTruthy();

    spy.mockRestore();
  });
});
