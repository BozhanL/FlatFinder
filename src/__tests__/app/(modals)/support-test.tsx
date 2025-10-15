import SupportModal from "@/app/(modals)/support/support";
import * as useUserModule from "@/hooks/useUser";
import * as firestore from "@react-native-firebase/firestore";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import * as router from "expo-router";
import { Alert, StyleSheet } from "react-native";

/* ------------------ Mocks ------------------ */

jest.mock("@/hooks/useUser");
jest.mock("@react-native-firebase/firestore");
jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  router: { back: jest.fn(), push: jest.fn() },
}));

/* ------------------ Fixtures ------------------ */

const mockUser = {
  uid: "test-user-123",
  displayName: "John Doe",
  email: "john@example.com",
};

const mockAddDoc = jest.fn();
const mockCollection = jest.fn();
const mockGetFirestore = jest.fn();
const mockServerTimestamp = jest.fn(() => "timestamp");

/* ------------------ Setup ------------------ */

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, "alert").mockImplementation(() => {
    // intentionally empty for test mock
  });

  (firestore.addDoc as unknown as jest.Mock) = mockAddDoc;
  (firestore.collection as unknown as jest.Mock) = mockCollection;
  (firestore.getFirestore as unknown as jest.Mock) = mockGetFirestore;
  (firestore.serverTimestamp as unknown as jest.Mock) = mockServerTimestamp;

  mockCollection.mockReturnValue("mock-collection");
  mockGetFirestore.mockReturnValue("mock-firestore");
});

/* ------------------ Tests ------------------ */

describe("SupportModal", () => {
  it("renders all fields; pre-fills when user exists", () => {
    (useUserModule.default as jest.Mock).mockReturnValue(mockUser);

    render(<SupportModal />);

    expect(screen.getByDisplayValue("John Doe")).toBeTruthy();
    expect(screen.getByDisplayValue("john@example.com")).toBeTruthy();
    expect(
      screen.getByPlaceholderText("What do you need help with?"),
    ).toBeTruthy();
    expect(
      screen.getByPlaceholderText(
        "Please provide as much detail as possible...",
      ),
    ).toBeTruthy();
  });

  it("renders empty fields when user not logged in", () => {
    (useUserModule.default as jest.Mock).mockReturnValue(null);

    render(<SupportModal />);

    expect(screen.getByPlaceholderText("Your name").props.value).toBe("");
    expect(screen.getByPlaceholderText("you@example.com").props.value).toBe("");
  });

  it("submit button shows dimmed style when form is incomplete", () => {
    (useUserModule.default as jest.Mock).mockReturnValue(mockUser);

    render(<SupportModal />);

    const btn = screen.getByTestId("submit-btn");
    const flat = StyleSheet.flatten(btn.props.style);

    expect(flat.opacity).toBe(0.6);

    const disabled =
      (btn.props.disabled as boolean | undefined) ??
      (btn.props.accessibilityState?.disabled as boolean | undefined) ??
      false;

    expect(disabled).toBe(false);
  });

  it("submit button is enabled (disabled=false) when all fields are filled", () => {
    (useUserModule.default as jest.Mock).mockReturnValue(mockUser);

    render(<SupportModal />);

    fireEvent.changeText(screen.getByPlaceholderText("Your name"), "abc");

    fireEvent.changeText(
      screen.getByPlaceholderText("What do you need help with?"),
      "Need help",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText(
        "Please provide as much detail as possible...",
      ),
      "I cannot access my profile",
    );

    const btn = screen.getByTestId("submit-btn");
    const flat = StyleSheet.flatten(btn.props.style);

    const disabled =
      (btn.props.disabled as boolean | undefined) ??
      (btn.props.accessibilityState?.disabled as boolean | undefined) ??
      false;

    expect(disabled).toBe(false);
    expect(flat.opacity ?? 1).toBe(0.6);
  });

  it("shows alert when trying to submit with empty fields", async () => {
    (useUserModule.default as jest.Mock).mockReturnValue(null);

    render(<SupportModal />);

    fireEvent.press(screen.getByTestId("submit-btn"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Please fill in all required fields.",
      );
    });

    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  it("successfully submits and navigates back", async () => {
    (useUserModule.default as jest.Mock).mockReturnValue(mockUser);
    mockAddDoc.mockResolvedValue({ id: "ticket-123" });

    render(<SupportModal />);

    fireEvent.changeText(
      screen.getByPlaceholderText("What do you need help with?"),
      "Account Issue",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText(
        "Please provide as much detail as possible...",
      ),
      "Cannot log in to my account",
    );

    fireEvent.press(screen.getByTestId("submit-btn"));

    await waitFor(() => {
      expect(mockAddDoc).toHaveBeenCalledWith("mock-collection", {
        createdAt: "timestamp",
        status: "open",
        uid: "test-user-123",
        name: "John Doe",
        email: "john@example.com",
        title: "Account Issue",
        message: "Cannot log in to my account",
      });
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Your support request has been submitted.",
    );
    expect(router.router.back).toHaveBeenCalled();
  });

  it("handles submission error gracefully", async () => {
    (useUserModule.default as jest.Mock).mockReturnValue(mockUser);
    mockAddDoc.mockRejectedValue(new Error("Network error"));

    render(<SupportModal />);

    fireEvent.changeText(
      screen.getByPlaceholderText("What do you need help with?"),
      "Account Issue",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText(
        "Please provide as much detail as possible...",
      ),
      "Cannot log in",
    );

    fireEvent.press(screen.getByTestId("submit-btn"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Submit failed",
        "Network error",
      );
    });
    expect(router.router.back).not.toHaveBeenCalled();
  });

  it("shows submitting state while pending", async () => {
    (useUserModule.default as jest.Mock).mockReturnValue(mockUser);

    mockAddDoc.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<SupportModal />);

    fireEvent.changeText(
      screen.getByPlaceholderText("What do you need help with?"),
      "Billing",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText(
        "Please provide as much detail as possible...",
      ),
      "Please check my invoice",
    );

    fireEvent.press(screen.getByTestId("submit-btn"));

    await waitFor(() => {
      expect(screen.getByText("Submitting…")).toBeTruthy();
    });
  });

  it("trims whitespace from all fields before submission (guest)", async () => {
    (useUserModule.default as jest.Mock).mockReturnValue(null);
    mockAddDoc.mockResolvedValue({ id: "ticket-123" });

    render(<SupportModal />);

    fireEvent.changeText(screen.getByPlaceholderText("Your name"), "  Jane  ");
    fireEvent.changeText(
      screen.getByPlaceholderText("you@example.com"),
      "  jane@test.com  ",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("What do you need help with?"),
      "  Help needed  ",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText(
        "Please provide as much detail as possible...",
      ),
      "  Please assist  ",
    );

    fireEvent.press(screen.getByTestId("submit-btn"));

    await waitFor(() => {
      expect(mockAddDoc).toHaveBeenCalledWith(
        "mock-collection",
        expect.objectContaining({
          uid: null,
          name: "Jane",
          email: "jane@test.com",
          title: "Help needed",
          message: "Please assist",
        }),
      );
    });
  });

  it("navigates back when Cancel is pressed", () => {
    (useUserModule.default as jest.Mock).mockReturnValue(mockUser);

    render(<SupportModal />);

    fireEvent.press(screen.getByText("Cancel"));
    expect(router.router.back).toHaveBeenCalled();
  });

  it("navigates to support history when View my tickets is pressed", () => {
    (useUserModule.default as jest.Mock).mockReturnValue(mockUser);

    render(<SupportModal />);

    fireEvent.press(screen.getByText("View my tickets"));
    expect(router.router.push).toHaveBeenCalledWith(
      "/(modals)/support/support-history",
    );
  });
});
