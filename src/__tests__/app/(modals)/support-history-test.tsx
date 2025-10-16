import { act, render, screen, waitFor } from "@testing-library/react-native";

import SupportHistory from "@/app/(modals)/support/support-history";
import * as fsMod from "@react-native-firebase/firestore";

// ---- router mock ----
jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
}));

// ---- firebase app/auth ----
jest.mock("@react-native-firebase/app", () => ({
  getApp: jest.fn(() => ({})),
}));

jest.mock("@react-native-firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: "u1" },
  })),
}));

// ---- firestore mock ----
jest.mock("@react-native-firebase/firestore", () => {
  const onSnapshotMock = jest.fn(
    (
      _q: unknown,
      _next?: (snap: {
        docs: { id: string; data: () => Record<string, unknown> }[];
      }) => void,
      _error?: (e: unknown) => void,
    ) => {
      // return unsubscribe
      return jest.fn();
    },
  );

  return {
    getFirestore: jest.fn(() => ({})),
    collection: jest.fn((_db: unknown, _name: string) => ({ __name: _name })),
    where: jest.fn((f: string, op: string, v: unknown) => ({ f, op, v })),
    orderBy: jest.fn((f: string, dir: "asc" | "desc") => ({ f, dir })),
    query: jest.fn((...args: unknown[]) => args),
    onSnapshot: onSnapshotMock,
  };
});

// ---- Helpers ----
type DocShape = {
  id: string;
  data: Record<string, unknown>;
};

function makeSnap(docs: DocShape[]) {
  return {
    docs: docs.map((d) => ({
      id: d.id,
      data: () => d.data,
    })),
  };
}

function emitSnapshot(docs: DocShape[]): void {
  const call = (fsMod.onSnapshot as unknown as jest.Mock).mock.calls.at(-1);
  const next = call?.[1] as
    | ((snap: {
        docs: { id: string; data: () => Record<string, unknown> }[];
      }) => void)
    | undefined;
  act(() => {
    next?.(makeSnap(docs));
  });
}

function emitSnapshotError(err: unknown): void {
  const call = (fsMod.onSnapshot as unknown as jest.Mock).mock.calls.at(-1);
  const errCb = call?.[2] as ((e: unknown) => void) | undefined;
  act(() => {
    errCb?.(err);
  });
}

describe("SupportHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading first", () => {
    render(<SupportHistory />);
    expect(screen.getByText("Loading…")).toBeTruthy();
  });

  it("renders tickets from onSnapshot", async () => {
    render(<SupportHistory />);

    // Trigger a snapshot with two tickets
    const now = new Date(2025, 0, 2, 9, 7); // 2025-01-02 09:07
    const createdAt = { toDate: () => now };

    emitSnapshot([
      {
        id: "t1",
        data: {
          title: "First",
          message: "hello",
          status: "open",
          createdAt,
        },
      },
      {
        id: "t2",
        data: {
          title: "Working",
          message: "pls fix",
          status: "in_progress",
          createdAt,
        },
      },
    ]);

    // wait for re-render
    await screen.findByText("First");
    expect(screen.getByText("Working")).toBeTruthy();

    // status badge text
    expect(screen.getByText("Open")).toBeTruthy();
    expect(screen.getByText("In progress")).toBeTruthy();

    // timestamp format YYYY-MM-DD HH:MM
    expect(
      screen.getAllByText("2025-01-02 09:07").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders empty state when there is no ticket", async () => {
    render(<SupportHistory />);

    emitSnapshot([]);

    await waitFor(() => {
      expect(screen.getByText("No tickets yet.")).toBeTruthy();
    });
  });

  it("handles onSnapshot error and shows empty state", async () => {
    render(<SupportHistory />);

    emitSnapshotError(new Error("boom"));

    // no data, empty state + loading false
    await waitFor(() => {
      expect(screen.getByText("No tickets yet.")).toBeTruthy();
    });
  });
});
