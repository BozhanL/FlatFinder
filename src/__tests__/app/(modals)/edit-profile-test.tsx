import EditProfileModal from "@/app/(modals)/edit-profile";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import type { Router } from "expo-router";
import * as routerMod from "expo-router";
import { Alert } from "react-native";

type FirestoreDocRef = Record<string, unknown>;
type GetDocResult = { data: () => Record<string, unknown> };
type GetDocsResult = { docs: { id: string }[] };

const mockRouter = {
  back: jest.fn(),
  replace: jest.fn(),
  canGoBack: jest.fn(() => true),
  push: jest.fn(),
  navigate: jest.fn(),
  dismiss: jest.fn(),
  setParams: jest.fn(),
  prefetch: jest.fn(),
  reload: jest.fn(),
} satisfies Partial<Router>;

jest
  .spyOn(routerMod, "router", "get")
  .mockReturnValue(mockRouter as unknown as Router);

jest.mock("@react-native-firebase/app", () => ({
  getApp: jest.fn(() => ({})),
}));

jest.mock("@react-native-firebase/auth", () => ({
  getAuth: jest.fn(() => ({ currentUser: { uid: "u1" } })),
}));

jest.mock("@react-native-firebase/firestore", () => {
  class MockTimestamp {
    private _d: Date;
    constructor(d: Date) {
      this._d = d;
    }
    toDate(): Date {
      return this._d;
    }
    static fromDate(d: Date): MockTimestamp {
      return new MockTimestamp(d);
    }
  }

  const fns = {
    getFirestore: jest.fn(() => ({})),
    doc: jest.fn((_db: unknown, col: string, id: string) => ({
      __col: col,
      __id: id,
    })),
    collection: jest.fn((_db: unknown, col: string) => ({ __col: col })),
    where: jest.fn((f: string, op: string, v: unknown) => ({ f, op, v })),
    query: jest.fn((...args: unknown[]) => args),
    getDoc: jest.fn<Promise<GetDocResult>, []>(),
    getDocs: jest.fn<Promise<GetDocsResult>, []>(),
    setDoc: jest.fn(),
    serverTimestamp: jest.fn(() => ({ __sv: "now" })),
    Timestamp: MockTimestamp,
  };

  return fns;
});

jest.mock("react-native-modal-datetime-picker", () => {
  const MockPicker = (props: {
    onConfirm?: (d: Date) => void;
    onCancel?: () => void;
  }) =>
    jest.requireActual("react").createElement(
      jest.requireActual("react-native").TouchableOpacity,
      {
        testID: "dob-confirm",
        onPress: () => props.onConfirm?.(new Date(2001, 0, 3)),
      },
      jest
        .requireActual("react")
        .createElement(
          jest.requireActual("react-native").Text,
          null,
          "Confirm",
        ),
    );
  return MockPicker;
});

jest.mock("@/components/profile/BudgetField", () => {
  const MockBudget = (props: { onChange?: (n: number) => void }) =>
    jest
      .requireActual("react")
      .createElement(
        jest.requireActual("react-native").TouchableOpacity,
        { testID: "budget-set-250", onPress: () => props.onChange?.(250) },
        jest
          .requireActual("react")
          .createElement(
            jest.requireActual("react-native").Text,
            null,
            "budget 250",
          ),
      );
  return MockBudget;
});

jest.mock("@/components/profile/NZLocationPickerField", () => {
  const MockLoc = (props: { onChange?: (loc: string) => void }) =>
    jest.requireActual("react").createElement(
      jest.requireActual("react-native").TouchableOpacity,
      {
        testID: "loc-set-auckland",
        onPress: () => props.onChange?.("Auckland"),
      },
      jest
        .requireActual("react")
        .createElement(
          jest.requireActual("react-native").Text,
          null,
          "set Auckland",
        ),
    );
  return MockLoc;
});

jest.mock("@/components/profile/TagInputField", () => {
  jest.requireActual("react");
  jest.requireActual("react-native");
  const MockTags = (props: { onChange?: (tags: string[]) => void }) =>
    jest.requireActual("react").createElement(
      jest.requireActual("react-native").TouchableOpacity,
      {
        testID: "tags-set",
        onPress: () => props.onChange?.(["Student", "cat  lover"]),
      },
      jest
        .requireActual("react")
        .createElement(
          jest.requireActual("react-native").Text,
          null,
          "set tags",
        ),
    );
  return MockTags;
});

jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => {
  jest.requireActual("react");
  return function Icon(): React.ReactElement | null {
    return jest
      .requireActual("react")
      .createElement(jest.requireActual("react").Fragment, null);
  };
});

jest.mock("@/components/ProfilePreview", () => {
  jest.requireActual("react");
  return function PP(): React.ReactElement | null {
    return jest
      .requireActual("react")
      .createElement(jest.requireActual("react").Fragment, null);
  };
});

jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fsMock = require("@react-native-firebase/firestore") as {
  getFirestore: (app?: unknown) => unknown;
  doc: (...args: unknown[]) => FirestoreDocRef;
  collection: (...args: unknown[]) => FirestoreDocRef;
  where: (
    f: string,
    op: string,
    v: unknown,
  ) => { f: string; op: string; v: unknown };
  query: (...args: unknown[]) => unknown[];
  getDoc: jest.Mock<Promise<GetDocResult>, []>;
  getDocs: jest.Mock<Promise<GetDocsResult>, []>;
  setDoc: jest.Mock;
  serverTimestamp: jest.Mock;
  Timestamp: new (d: Date) => { toDate: () => Date };
};

function primeGetDoc(data: Record<string, unknown>): void {
  fsMock.getDoc.mockResolvedValueOnce({ data: () => data });
}
function primeUsernameTaken(taken: boolean): void {
  if (taken) {
    fsMock.getDocs.mockResolvedValue(
      Promise.resolve({ docs: [{ id: "other" }] }),
    );
  } else {
    fsMock.getDocs.mockResolvedValue(Promise.resolve({ docs: [] }));
  }
}

afterEach((): void => {
  jest.clearAllMocks();
});

describe("EditProfileModal", () => {
  it("loads, picks DOB, sets budget/location/tags, and saves with normalized tags", async () => {
    primeGetDoc({
      name: "tony",
      dob: null,
      bio: "",
      budget: null,
      location: "",
      tags: [],
      avatarUrl: null,
    });
    primeUsernameTaken(false);

    render(<EditProfileModal />);

    await screen.findByText("Profile");

    fireEvent.changeText(screen.getByPlaceholderText("yourname"), "my_name");

    fireEvent.press(screen.getByTestId("dob-confirm"));
    fireEvent.press(screen.getByTestId("budget-set-250"));
    fireEvent.press(screen.getByTestId("loc-set-auckland"));
    fireEvent.press(screen.getByTestId("tags-set"));
    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(fsMock.setDoc).toHaveBeenCalled();
    });

    const call = fsMock.setDoc.mock.calls[0] as [
      unknown,
      Record<string, unknown>,
      Record<string, unknown>,
    ];
    const payload = call[1];
    const opts = call[2];

    expect(opts).toEqual({ merge: true });
    expect(payload["name"]).toBe("my_name");
    expect(
      typeof (payload["dob"] as { toDate: () => Date } | null | undefined)
        ?.toDate,
    ).toBe("function");
    expect(payload["budget"]).toBe(250);
    expect(payload["location"]).toBe("Auckland");
    expect(payload["tags"]).toEqual(["Student", "cat  lover"]);
    expect(payload["tagsNormalized"]).toEqual(["student", "cat lover"]);
    expect(payload["lastActiveAt"]).toEqual({ __sv: "now" });
  });

  it("blocks saving when username is taken", async () => {
    primeGetDoc({ name: "dup", tags: [] });
    primeUsernameTaken(true);

    render(<EditProfileModal />);

    await screen.findByText("Profile");

    fireEvent.changeText(screen.getByPlaceholderText("yourname"), "dup");
    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Username taken",
        "Try another one.",
      );
    });
    expect(fsMock.setDoc).not.toHaveBeenCalled();
  });

  it("shows validation errors when username empty", async () => {
    primeGetDoc({ name: "", tags: [] });
    primeUsernameTaken(false);

    render(<EditProfileModal />);

    await screen.findByText("Profile");

    fireEvent.changeText(screen.getByPlaceholderText("yourname"), "");
    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });

    const calls = (Alert.alert as unknown as jest.Mock).mock.calls;
    const last = calls.at(-1) as [string, string];
    expect(last[0]).toBe("Invalid input");
    expect(last[1]).toMatch(/Username cannot be empty/i);
    expect(fsMock.setDoc).not.toHaveBeenCalled();
  });

  it("switches to Preview tab after successful save", async () => {
    primeGetDoc({ name: "ok", tags: [] });
    primeUsernameTaken(false);

    render(<EditProfileModal />);

    await screen.findByText("Profile");

    fireEvent.changeText(screen.getByPlaceholderText("yourname"), "valid_user");

    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Saved",
        "Your profile has been updated.",
      );
    });

    fireEvent.press(screen.getByText("Preview"));
    expect(screen.getByText("Edit")).toBeTruthy();
  });
});
