import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Alert } from "react-native";

// The jest.mock statements above will be hoisted to the top, so now import the component under test and the exported router/mock.
import SupportModal from "@/app/(modals)/support/support";
import * as fsMod from "@react-native-firebase/firestore";
import { router as expoRouter } from "expo-router";

// ---- router mock ----
jest.mock("expo-router", () => {
  const r = { back: jest.fn(), push: jest.fn(), replace: jest.fn() };
  return {
    router: r,
    Stack: { Screen: () => null },
  };
});

// ---- firebase mocks ----
jest.mock("@react-native-firebase/app", () => ({
  getApp: jest.fn(() => ({})),
}));

jest.mock("@react-native-firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: "u1", displayName: "Tony", email: "t@e.co" },
  })),
}));

jest.mock("@react-native-firebase/firestore", () => {
  const calls: { addDoc: jest.Mock } = {
    addDoc: jest.fn().mockResolvedValue({ id: "ticket1" }),
  };
  return {
    getFirestore: jest.fn(() => ({})),
    collection: jest.fn((_db: unknown, _name: string) => ({ __name: _name })),
    addDoc: (...args: unknown[]) => calls.addDoc(...args),
    serverTimestamp: () => ({ __now: true }),
    // expose reusable mock for test assertions (can be retrieved via module)
    __mocks: calls,
  };
});

const mockAddDoc = (fsMod as unknown as { __mocks: { addDoc: jest.Mock } })
  .__mocks.addDoc;

describe("SupportModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
  });

  it("blocks submit when required fields missing (disabled button: no alert, no addDoc)", async () => {
    render(<SupportModal />);

    // clear all fields, button will be disabled
    fireEvent.changeText(screen.getByPlaceholderText("Your name"), "");
    fireEvent.changeText(screen.getByPlaceholderText("you@example.com"), "");
    fireEvent.changeText(
      screen.getByPlaceholderText("What do you need help with?"),
      "",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText(
        "Please provide as much detail as possible...",
      ),
      "",
    );

    fireEvent.press(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockAddDoc).not.toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(Alert.alert).not.toHaveBeenCalled();
    });
  });

  it("submits a ticket and shows success, then goes back", async () => {
    render(<SupportModal />);

    // fill in all fields
    fireEvent.changeText(screen.getByPlaceholderText("Your name"), "Alice");
    fireEvent.changeText(
      screen.getByPlaceholderText("you@example.com"),
      "a@b.co",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("What do you need help with?"),
      "Login",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText(
        "Please provide as much detail as possible...",
      ),
      "I cannot log in",
    );

    // state refresh
    await Promise.resolve();

    fireEvent.press(screen.getByText("Submit"));

    // addDoc called with right payload
    await waitFor(() => {
      expect(mockAddDoc).toHaveBeenCalled();
    });

    const [, payload] = mockAddDoc.mock.calls[0] as unknown[];
    const body = payload as {
      status: string;
      uid: string | null;
      createdAt: unknown;
      name: string;
      email: string;
      title: string;
      message: string;
    };

    expect(body.status).toBe("open");
    expect(body.uid).toBe("u1");
    expect(body.createdAt).toEqual({ __now: true });
    expect(body.name).toBe("Alice");
    expect(body.email).toBe("a@b.co");
    expect(body.title).toBe("Login");
    expect(body.message).toBe("I cannot log in");

    // show success alert and go back
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Your support request has been submitted.",
      );
    });
    await waitFor(() => {
      expect(expoRouter.back).toHaveBeenCalled();
    });
  });

  it("navigates to support history", () => {
    render(<SupportModal />);
    fireEvent.press(screen.getByText("View my tickets"));
    expect(expoRouter.push).toHaveBeenCalledWith(
      "/(modals)/support/support-history",
    );
  });

  it("Cancel button goes back", () => {
    render(<SupportModal />);
    fireEvent.press(screen.getByText("Cancel"));
    expect(expoRouter.back).toHaveBeenCalled();
  });
});
