import ProfilePreview from "@/components/ProfilePreview";
import { onSnapshot } from "@react-native-firebase/firestore";
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

jest.mock("@react-native-firebase/app", () => ({
  getApp: jest.fn(() => ({})),
}));

jest.mock("@react-native-firebase/firestore", () => {
  const getFirestore = jest.fn(() => ({}));
  const doc = jest.fn((_db, col, id) => ({ __path: `${col}/${id}` }));
  const onSnapshot = jest.fn((_ref, _next, _error) => jest.fn());
  return { getFirestore, doc, onSnapshot };
});

jest.mock("@/utils/date", () => ({
  calculateAge: jest.fn(() => undefined),
}));

const onSnapshotMock = onSnapshot as jest.Mock;
const { calculateAge } = jest.requireMock("@/utils/date");

type SnapData = Record<string, unknown>;
type Snap<T extends SnapData = SnapData> = { id: string; data: () => T };

export function emitSnapshot(data: SnapData): void {
  const next = onSnapshotMock.mock.calls.at(-1)?.[1] as
    | ((snap: Snap) => void)
    | undefined;

  act(() => {
    next?.({ id: "u1", data: () => data });
  });
}

export function emitSnapshotError(err: unknown): void {
  act(() => {
    const call = onSnapshotMock.mock.calls.at(-1);
    const errCb = call?.[2] as ((e: unknown) => void) | undefined;
    errCb?.(err);
  });
}

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe("ProfilePreview", () => {
  it('renders immediately in "data" mode without subscribing', () => {
    calculateAge.mockReturnValueOnce(22);

    render(
      <ProfilePreview
        source="data"
        data={{
          id: "u1",
          name: "Tony",
          dob: null,
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
    expect(screen.getByText("22")).toBeTruthy();
    expect(screen.getByText("hello")).toBeTruthy();
    expect(screen.getByText("Budget per week")).toBeTruthy();
    expect(screen.getByText("$350")).toBeTruthy();
    expect(screen.getByText("Preferred location")).toBeTruthy();
    expect(screen.getByText("CBD")).toBeTruthy();
    expect(screen.getByText("cat lover")).toBeTruthy();
    expect(screen.getByText("student")).toBeTruthy();

    expect(onSnapshotMock).not.toHaveBeenCalled();
  });

  it('shows Loading first in "uid" mode, then renders after snapshot and unsubscribes on unmount', async () => {
    let lastUnsub: jest.Mock | null = null;
    onSnapshotMock.mockImplementation((_ref, _next, _err) => {
      lastUnsub = jest.fn();
      return lastUnsub;
    });

    const { unmount } = render(<ProfilePreview source="uid" uid="u1" />);
    expect(screen.getByText("Loading…")).toBeTruthy();

    await waitFor(() => {
      expect(onSnapshotMock).toHaveBeenCalled();
    });

    calculateAge.mockReturnValueOnce(25);

    emitSnapshot({
      name: "Alice",
      dob: "x",
      bio: "bio here",
      budget: 200,
      location: "Central",
      tags: ["quiet"],
    });

    expect(await screen.findByText(/Alice/)).toBeTruthy();
    expect(screen.getByText("25")).toBeTruthy();
    expect(screen.getByText("bio here")).toBeTruthy();
    expect(screen.getByText("Budget per week")).toBeTruthy();
    expect(screen.getByText("$200")).toBeTruthy();
    expect(screen.getByText("Preferred location")).toBeTruthy();
    expect(screen.getByText("Central")).toBeTruthy();
    expect(screen.getByText("quiet")).toBeTruthy();

    unmount();
    expect(lastUnsub).toBeTruthy();
    expect(lastUnsub).toHaveBeenCalled();
  });

  it("shows placeholders when optional fields missing (—)", () => {
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

    expect(screen.getByText("Budget per week")).toBeTruthy();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    expect(screen.getByText("Preferred location")).toBeTruthy();
  });

  it("logs error when onSnapshot fails and stays on Loading… until a valid snapshot arrives", async () => {
    const spy = jest
      .spyOn(console, "error")
      .mockImplementation((): void => undefined);
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

  it("caps tags to 5 and shows +N for the rest", () => {
    const tags = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"];
    render(
      <ProfilePreview
        source="data"
        data={{
          id: "u1",
          name: "HasTags",
          tags,
        }}
      />,
    );

    ["t1", "t2", "t3", "t4", "t5"].forEach((t) => {
      expect(screen.getByText(t)).toBeTruthy();
    });
    expect(screen.queryByText("t6")).toBeNull();
    expect(screen.queryByText("t7")).toBeNull();
    expect(screen.getByText("+2")).toBeTruthy();
  });

  it("renders fine with fallback avatar when avatarUrl is absent", () => {
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
