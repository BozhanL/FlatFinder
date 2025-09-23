// @ts-nocheck
import ProfilePreview from "@/components/ProfilePreview";
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import fsMod from "@react-native-firebase/firestore";

jest.mock("@react-native-firebase/app", () => ({
  getApp: jest.fn(() => ({})),
}));

jest.mock("@react-native-firebase/firestore", () => {
  const getFirestore = jest.fn(() => ({}));
  const doc = jest.fn((_db, col, id) => ({ __path: `${col}/${id}` }));

  const onSnapshot = jest.fn((_ref, next, error) => jest.fn());
  return { getFirestore, doc, onSnapshot };
});

const onSnapshotMock = fsMod.onSnapshot as jest.Mock;

function emitSnapshot(data: any) {
  const next = onSnapshotMock.mock.calls.at(-1)?.[1];
  const snap = { id: "u1", data: () => data };
  act(() => next(snap));
}

function emitSnapshotError(err: any) {
  const errCb = onSnapshotMock.mock.calls.at(-1)?.[2];
  act(() => errCb?.(err));
}

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe("ProfilePreview", () => {
  it('renders immediately in "data" mode without subscribing', () => {
    render(
      <ProfilePreview
        source="data"
        data={{
          id: "u1",
          name: "Tony",
          age: 22,
          bio: "hello",
          budget: 350,
          location: "CBD",
          tags: ["cat lover", "student"],
          avatar: { uri: "x" },
          avatarUrl: null,
        }}
      />,
    );

    expect(screen.getByText(/Tony/)).toBeTruthy();
    expect(screen.getByText(/22/)).toBeTruthy();
    expect(screen.getByText("hello")).toBeTruthy();

    expect(screen.getByText("Budget")).toBeTruthy();
    expect(screen.getByText("$350")).toBeTruthy();
    expect(screen.getByText("Preferred Location")).toBeTruthy();
    expect(screen.getByText("CBD")).toBeTruthy();

    expect(screen.getByText("cat lover")).toBeTruthy();
    expect(screen.getByText("student")).toBeTruthy();

    expect(onSnapshotMock).not.toHaveBeenCalled();
  });

  it('shows Loading first in "uid" mode, then renders after snapshot', async () => {
    let lastUnsub: jest.Mock | null = null;
    onSnapshotMock.mockImplementation((_ref, next) => {
      lastUnsub = jest.fn();
      return lastUnsub;
    });

    const { unmount } = render(<ProfilePreview source="uid" uid="u1" />);

    await waitFor(() => expect(onSnapshotMock).toHaveBeenCalled());

    emitSnapshot({
      name: "Alice",
      age: 25,
      bio: "bio here",
      budget: 200,
      location: "Central",
      tags: ["quiet"],
    });

    expect(await screen.findByText(/Alice/)).toBeTruthy();
    expect(screen.getByText(/25/)).toBeTruthy();
    expect(screen.getByText("bio here")).toBeTruthy();
    expect(screen.getByText("Budget")).toBeTruthy();
    expect(screen.getByText("$200")).toBeTruthy();
    expect(screen.getByText("Preferred Location")).toBeTruthy();
    expect(screen.getByText("Central")).toBeTruthy();
    expect(screen.getByText("quiet")).toBeTruthy();

    unmount();
    expect(lastUnsub).toBeTruthy();
    expect(lastUnsub!).toHaveBeenCalled();
  });

  it("hides optional fields when missing", () => {
    render(
      <ProfilePreview
        source="data"
        data={{
          id: "u1",
          name: "NoExtras",
        }}
      />,
    );

    expect(screen.getByText("NoExtras")).toBeTruthy();
    expect(screen.queryByText("Budget")).toBeNull();
    expect(screen.queryByText("Preferred Location")).toBeNull();
  });

  it("logs error on onSnapshot failure and stays stable (shows Loading… until a snapshot arrives)", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    onSnapshotMock.mockImplementation((_ref, _next, _err) => jest.fn());

    render(<ProfilePreview source="uid" uid="u1" />);

    expect(screen.getByText("Loading…")).toBeTruthy();

    emitSnapshotError(new Error("boom"));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        "ProfilePreview onSnapshot error:",
        expect.any(Error),
      );
    });

    expect(screen.getByText("Loading…")).toBeTruthy();

    spy.mockRestore();
  });

  it("derives fallback avatar (no crash) when avatarUrl is absent", () => {
    render(
      <ProfilePreview
        source="data"
        data={{
          id: "u1",
          name: "FallbackDude",
          avatarUrl: null,
        }}
      />,
    );

    expect(screen.getByText("FallbackDude")).toBeTruthy();
  });
});
