import {
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react-native";
import React from "react";

// Mock Platform separately to safely control OS logic
jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  OS: "android", // Default OS for most tests
  select: (options: { android: any; }) => options.android,
}));

// --- Global Firebase Auth Mock Definition ---
const mockAuthInstance = {
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  signInWithCredential: jest.fn(),
  signOut: jest.fn(),
};

const mockAuth = {
  getAuth: jest.fn(() => mockAuthInstance),
  onAuthStateChanged: mockAuthInstance.onAuthStateChanged,
  signInWithEmailAndPassword: mockAuthInstance.signInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockAuthInstance.createUserWithEmailAndPassword,
  sendPasswordResetEmail: mockAuthInstance.sendPasswordResetEmail,
  signInWithCredential: mockAuthInstance.signInWithCredential,
  signOut: mockAuthInstance.signOut,
  GoogleAuthProvider: {
    credential: jest.fn(),
  },
};
jest.mock("@react-native-firebase/auth", () => mockAuth);

// --- Global Google Sign-In Mock Definition ---
const mockGoogleSignin = {
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
    statusCodes: {
      SIGN_IN_CANCELLED: "12501",
      IN_PROGRESS: "12502",
      PLAY_SERVICES_NOT_AVAILABLE: "12503",
    },
  },
};
jest.mock("@react-native-google-signin/google-signin", () => mockGoogleSignin);

const mockUser = {
  uid: "test-uid",
  email: "test@example.com",
} as any;

let authStateListener: ((user: typeof mockUser | null) => void) | null = null;

describe("AuthScreen Coverage Test Suite", () => {
    let AuthScreen: React.FC; 

    beforeEach(() => {
        AuthScreen = require("../../../app/auth/AuthScreen").default;
        
        jest.clearAllMocks();
        mockAuthInstance.onAuthStateChanged.mockImplementation((_auth, callback) => {
            authStateListener = callback;
            callback(null); // Simulate initial no user state
            return jest.fn(); // unsubscribe function
        });
        mockGoogleSignin.GoogleSignin.hasPlayServices.mockResolvedValue(true);
        mockGoogleSignin.GoogleSignin.configure.mockClear();
    });

    // --- 1. Initial Render and Auth Guard States ---
    it("renders the loading screen initially, then the Auth Screen (no user)", async () => {
        // Override default implementation to test the *initial* loading state
        mockAuthInstance.onAuthStateChanged.mockImplementation((_auth, callback) => {
            authStateListener = callback;
            return jest.fn();
        });

        const { getByText, queryByText } = render(<AuthScreen />);

        expect(getByText("Checking authentication status...")).toBeTruthy();

        await waitFor(() => authStateListener && authStateListener(null));

        expect(getByText("Sign In")).toBeTruthy();
        expect(queryByText("Checking authentication status...")).toBeNull();
    });

    it("renders the UserStatusScreen (Protected Content) when user is authenticated", async () => {
        const { getByText, queryByText } = render(<AuthScreen />);

        await waitFor(() => authStateListener && authStateListener(mockUser));

        expect(getByText("Welcome to FlatFinder!")).toBeTruthy();
        expect(getByText(`User: ${mockUser.email}`)).toBeTruthy();
        expect(queryByText("Sign In")).toBeNull();
    });

    it("handles sign out from UserStatusScreen", async () => {
        const { getByText } = render(<AuthScreen />);
        await waitFor(() => authStateListener && authStateListener(mockUser));

        fireEvent.press(getByText("Sign Out"));

        await waitFor(() => expect(mockAuthInstance.signOut).toHaveBeenCalled());

        authStateListener && authStateListener(null);

        await waitFor(() => expect(getByText("Sign In")).toBeTruthy());
    });

    it("logs sign out errors without crashing", async () => {
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
        mockAuthInstance.signOut.mockRejectedValue(new Error("SignOut failed"));

        const { getByText } = render(<AuthScreen />);
        await waitFor(() => authStateListener && authStateListener(mockUser));

        fireEvent.press(getByText("Sign Out"));

        await waitFor(() => {
            expect(mockAuthInstance.signOut).toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalledWith("Sign Out Error:", new Error("SignOut failed"));
        });
        consoleErrorSpy.mockRestore();
    });

    // --- 2. Email/Password Authentication (handleAuth) ---
    it("successfully calls signInWithEmailAndPassword on Sign In button press", async () => {
        mockAuthInstance.signInWithEmailAndPassword.mockResolvedValue(true as any);

        const { getByPlaceholderText, getByText } = render(<AuthScreen />);
        await waitFor(() => authStateListener && authStateListener(null));

        fireEvent.changeText(getByPlaceholderText("email@domain.com"), "user@test.com");
        fireEvent.changeText(getByPlaceholderText("password"), "password123");
        fireEvent.press(getByText("Sign In"));

        await waitFor(() => {
            expect(mockAuthInstance.signInWithEmailAndPassword).toHaveBeenCalledWith(
                expect.any(Object),
                "user@test.com",
                "password123",
            );
            expect(getByText("Sign In")).toBeTruthy();
        });
    });

    it("successfully calls createUserWithEmailAndPassword on Sign Up button press", async () => {
        mockAuthInstance.createUserWithEmailAndPassword.mockResolvedValue(true as any);

        const { getByText, getByPlaceholderText } = render(<AuthScreen />);
        await waitFor(() => authStateListener && authStateListener(null));

        fireEvent.press(getByText("Need an account? Sign Up"));
        expect(getByText("Create an account")).toBeTruthy();

        fireEvent.changeText(getByPlaceholderText("email@domain.com"), "new@test.com");
        fireEvent.changeText(getByPlaceholderText("password"), "password123");
        fireEvent.press(getByText("Sign Up"));

        await waitFor(() => {
            expect(mockAuthInstance.createUserWithEmailAndPassword).toHaveBeenCalledWith(
                expect.any(Object),
                "new@test.com",
                "password123",
            );
        });
    });

    // --- 3. Email/Password Error Handling (Covers all auth/ codes) ---
    it.each([
        ["auth/email-already-in-use", "That email address is already in use!"],
        ["auth/invalid-email", "That email address is invalid!"],
        ["auth/weak-password", "Password should be at least 6 characters."],
        ["auth/user-not-found", "Invalid email or password."],
        ["auth/wrong-password", "Invalid email or password."],
        ["auth/some-other-error", "auth/some-other-error"],
    ])("displays correct error message for Firebase code %s", async (code, expectedMessage) => {
        mockAuthInstance.signInWithEmailAndPassword.mockRejectedValue({ code });

        const { getByText, getByPlaceholderText } = render(<AuthScreen />);
        await waitFor(() => authStateListener && authStateListener(null));

        fireEvent.changeText(getByPlaceholderText("email@domain.com"), "fail@test.com");
        fireEvent.press(getByText("Sign In"));

        await waitFor(() => {
            expect(getByText(expectedMessage)).toBeTruthy();
        });
    });

    it("displays generic error message for non-Firebase errors", async () => {
        mockAuthInstance.signInWithEmailAndPassword.mockRejectedValue(new Error("Network failed"));

        const { getByText, getByPlaceholderText } = render(<AuthScreen />);
        await waitFor(() => authStateListener && authStateListener(null));

        fireEvent.changeText(getByPlaceholderText("email@domain.com"), "fail@test.com");
        fireEvent.press(getByText("Sign In"));

        await waitFor(() => {
            expect(getByText("Network failed")).toBeTruthy();
        });
    });

    // --- 4. Password Reset Logic (handlePasswordReset) ---
    it("shows error if email is empty during password reset attempt", async () => {
        const { getByText } = render(<AuthScreen />);
        await waitFor(() => authStateListener && authStateListener(null));

        fireEvent.press(getByText("Forgot password?"));

        await waitFor(() => {
            expect(mockAuthInstance.sendPasswordResetEmail).not.toHaveBeenCalled();
            expect(
                getByText(
                    "Please enter your email address above to receive a password reset link.",
                ),
            ).toBeTruthy();
        });
    });

    it("successfully sends password reset email", async () => {
        mockAuthInstance.sendPasswordResetEmail.mockResolvedValue(true as any);

        const { getByText, getByPlaceholderText } = render(<AuthScreen />);
        await waitFor(() => authStateListener && authStateListener(null));

        fireEvent.changeText(getByPlaceholderText("email@domain.com"), "reset@test.com");
        fireEvent.press(getByText("Forgot password?"));

        await waitFor(() => {
            expect(mockAuthInstance.sendPasswordResetEmail).toHaveBeenCalledWith(
                expect.any(Object),
                "reset@test.com",
            );
            expect(
                getByText(
                    "Password reset link sent to your email! Please check your inbox (and spam folder).",
                ),
            ).toBeTruthy();
        });
    });

    it.each([
        ["auth/user-not-found", "We couldn't find an account associated with that email address."],
        ["auth/invalid-email", "We couldn't find an account associated with that email address."],
        ["auth/some-other-error", "auth/some-other-error"],
    ])("displays correct error for password reset code %s", async (code, expectedMessage) => {
        mockAuthInstance.sendPasswordResetEmail.mockRejectedValue({ code });

        const { getByText, getByPlaceholderText } = render(<AuthScreen />);
        await waitFor(() => authStateListener && authStateListener(null));

        fireEvent.changeText(getByPlaceholderText("email@domain.com"), "fail@test.com");
        fireEvent.press(getByText("Forgot password?"));

        await waitFor(() => {
            expect(getByText(expectedMessage)).toBeTruthy();
        });
    });

    // --- 5. Google Sign-In Logic (handleGoogleSignIn) ---

    it("calls GoogleSignin.configure on mount (Platform is NOT 'web')", async () => {
        render(<AuthScreen />);
        await waitFor(() => expect(mockGoogleSignin.GoogleSignin.configure).toHaveBeenCalledTimes(1));
    });

    // TEST 2: The 'web' case (Isolated to prevent corruption)
    it("skips GoogleSignin.configure when Platform is 'web'", async () => {
        jest.isolateModules(() => {
            // 1. Locally mock Platform to 'web'
            jest.mock("react-native/Libraries/Utilities/Platform", () => ({
                OS: "web",
                select: (options: any) => options.web,
            }), { virtual: true });

            // 💡 FIX 1: Define Firebase mock INLINE (correct)
            jest.mock("@react-native-firebase/auth", () => ({ 
                getAuth: jest.fn(() => ({ onAuthStateChanged: jest.fn() })) 
            }));

            const mockIsolatedConfigure = jest.fn();

            jest.mock("@react-native-google-signin/google-signin", () => ({
                GoogleSignin: { 
                    configure: mockIsolatedConfigure, // Reference the 'mock' prefixed variable
                    hasPlayServices: jest.fn() 
                },
            }));

            // The component must be required inside isolateModules
            const IsolatedAuthScreen = require("../../../app/auth/AuthScreen").default;

            render(<IsolatedAuthScreen />);

            // Check that configure was NOT called (using the 'mock' prefixed spy)
            expect(mockIsolatedConfigure).not.toHaveBeenCalled();
        });
    });
});