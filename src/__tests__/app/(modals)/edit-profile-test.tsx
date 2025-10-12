import {
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react-native";
import EditProfileModal from "@/app/(modals)/edit-profile";
import * as routerMod from "expo-router";
import { Alert } from "react-native";

jest.spyOn(routerMod, "router", "get").mockReturnValue({
  back: jest.fn(),
  replace: jest.fn(),
} as any);

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
    toDate() {
      return this._d;
    }
    static fromDate(d: Date) {
      return new MockTimestamp(d) as any;
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
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    setDoc: jest.fn(),
    serverTimestamp: jest.fn(() => ({ __sv: "now" })),
    Timestamp: MockTimestamp,
  };

  return fns;
});

jest.mock("react-native-modal-datetime-picker", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactReq = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require("react-native");
  const MockPicker = (props: any) =>
    ReactReq.createElement(
      RN.TouchableOpacity,
      {
        testID: "dob-confirm",
        onPress: () => props.onConfirm?.(new Date(2001, 0, 3)), // 03-01-2001
      },
      ReactReq.createElement(RN.Text, null, "Confirm"),
    );
  return MockPicker;
});

jest.mock("@/components/profile/BudgetField", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactReq = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require("react-native");
  const MockBudget = (props: any) =>
    ReactReq.createElement(
      RN.TouchableOpacity,
      { testID: "budget-set-250", onPress: () => props.onChange?.(250) },
      ReactReq.createElement(RN.Text, null, "budget 250"),
    );
  return MockBudget;
});

jest.mock("@/components/profile/NZLocationPickerField", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactReq = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require("react-native");
  const MockLoc = (props: any) =>
    ReactReq.createElement(
      RN.TouchableOpacity,
      {
        testID: "loc-set-auckland",
        onPress: () => props.onChange?.("Auckland"),
      },
      ReactReq.createElement(RN.Text, null, "set Auckland"),
    );
  return MockLoc;
});

jest.mock("@/components/profile/TagInputField", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactReq = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require("react-native");
  const MockTags = (props: any) =>
    ReactReq.createElement(
      RN.TouchableOpacity,
      {
        testID: "tags-set",
        onPress: () => props.onChange?.(["Student", "cat  lover"]),
      },
      ReactReq.createElement(RN.Text, null, "set tags"),
    );
  return MockTags;
});

jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactReq = require("react");
  return function Icon() {
    return ReactReq.createElement(ReactReq.Fragment, null);
  };
});

jest.mock("@/components/ProfilePreview", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactReq = require("react");
  return function PP() {
    return ReactReq.createElement(ReactReq.Fragment, null);
  };
});

jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fsMock = require("@react-native-firebase/firestore") as jest.Mocked<{
  getFirestore: (app?: unknown) => unknown;
  doc: (...args: any[]) => any;
  collection: (...args: any[]) => any;
  where: (...args: any[]) => any;
  query: (...args: any[]) => any;
  getDoc: jest.Mock;
  getDocs: jest.Mock;
  setDoc: jest.Mock;
  serverTimestamp: jest.Mock;
  Timestamp: any;
}>;

function primeGetDoc(data: unknown) {
  fsMock.getDoc.mockResolvedValueOnce({ data: () => data } as any);
}
function primeUsernameTaken(taken: boolean) {
  if (taken)
    fsMock.getDocs.mockResolvedValue({ docs: [{ id: "other" }] } as any);
  else fsMock.getDocs.mockResolvedValue({ docs: [] } as any);
}

afterEach(() => {
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

    await waitFor(() => expect(fsMock.setDoc).toHaveBeenCalled());

    const call = fsMock.setDoc.mock.calls[0];
    const payload = call[1];
    const opts = call[2];

    expect(opts).toEqual({ merge: true });
    expect(payload.name).toBe("my_name");
    expect(typeof payload.dob?.toDate).toBe("function");
    expect(payload.budget).toBe(250);
    expect(payload.location).toBe("Auckland");
    expect(payload.tags).toEqual(["Student", "cat  lover"]);
    expect(payload.tagsNormalized).toEqual(["student", "cat lover"]);
    expect(payload.lastActiveAt).toEqual({ __sv: "now" });
  });

  it("blocks saving when username is taken", async () => {
    primeGetDoc({ name: "dup", tags: [] });
    primeUsernameTaken(true);

    render(<EditProfileModal />);

    await screen.findByText("Profile");

    fireEvent.changeText(screen.getByPlaceholderText("yourname"), "dup");
    fireEvent.press(screen.getByText("Save"));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        "Username taken",
        "Try another one.",
      ),
    );
    expect(fsMock.setDoc).not.toHaveBeenCalled();
  });

  it("shows validation errors when username empty", async () => {
    primeGetDoc({ name: "", tags: [] });
    primeUsernameTaken(false);

    render(<EditProfileModal />);

    await screen.findByText("Profile");

    fireEvent.changeText(screen.getByPlaceholderText("yourname"), "");
    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => expect(Alert.alert).toHaveBeenCalled());

    const last = (Alert.alert as unknown as jest.Mock).mock.calls.at(-1) as [
      string,
      string,
    ];
    expect(last[0]).toBe("Invalid input");
    expect(String(last[1])).toMatch(/Username cannot be empty/i);
    expect(fsMock.setDoc).not.toHaveBeenCalled();
  });

  it("switches to Preview tab after successful save", async () => {
    primeGetDoc({ name: "ok", tags: [] });
    primeUsernameTaken(false);

    render(<EditProfileModal />);

    await screen.findByText("Profile");

    fireEvent.changeText(screen.getByPlaceholderText("yourname"), "valid_user");

    fireEvent.press(screen.getByText("Save"));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        "Saved",
        "Your profile has been updated.",
      ),
    );

    fireEvent.press(screen.getByText("Preview"));
    expect(screen.getByText("Edit")).toBeTruthy();
  });
});
