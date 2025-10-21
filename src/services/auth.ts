import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
} from "@react-native-firebase/auth";
import {
  GoogleSignin,
  statusCodes,
  User,
} from "@react-native-google-signin/google-signin";

import { Platform } from "react-native";

// --- TYPE GUARDS ---
type CodeError = {
  code: string;
  message?: string;
};

function isFirebaseAuthError(e: unknown): e is CodeError {
  if (typeof e !== "object" || e === null || !("code" in e)) {
    return false;
  }
  const code = (e as Partial<CodeError>).code;
  return typeof code === "string" && code.startsWith("auth/");
}

function isGoogleError(e: unknown): e is CodeError {
  if (typeof e !== "object" || e === null || !("code" in e)) {
    return false;
  }
  const code = (e as Partial<CodeError>).code;
  return typeof code === "string";
}

// --- CONFIGURATION ---

// Must be called once on app startup (e.g., in a root hook or App.tsx)
export const configureGoogleSignIn = (): void => {
  if (Platform.OS !== "web") {
    GoogleSignin.configure({
      webClientId:
        "245824951682-5f4jdid4ri95nl1qjh9qivkkbga2nem3.apps.googleusercontent.com",
    });
  }
};

// --- AUTH HANDLERS (UNCHANGED) ---

export const handleEmailAuth = async (
  email: string,
  password: string,
  isLogin: boolean,
): Promise<string> => {
  try {
    if (isLogin) {
      await signInWithEmailAndPassword(getAuth(), email, password);
    } else {
      await createUserWithEmailAndPassword(getAuth(), email, password);
    }
    return "success";
  } catch (e: unknown) {
    if (isFirebaseAuthError(e)) {
      if (e.code === "auth/email-already-in-use") {
        return "That email address is already in use!";
      } else if (e.code === "auth/invalid-email") {
        return "That email address is invalid!";
      } else if (e.code === "auth/weak-password") {
        return "Password should be at least 6 characters.";
      } else if (
        e.code === "auth/user-not-found" ||
        e.code === "auth/wrong-password"
      ) {
        return "Invalid email or password.";
      }
      return e.message || "An unknown Firebase error occurred.";
    }
    return "An unknown error occurred during authentication.";
  }
};

export const handlePasswordReset = async (email: string): Promise<string> => {
  if (!email) {
    return "Please enter your email address above to receive a password reset link.";
  }

  try {
    await sendPasswordResetEmail(getAuth(), email);
    return "Password reset link sent to your email! Please check your inbox (and spam folder).";
  } catch (e: unknown) {
    if (isFirebaseAuthError(e)) {
      if (e.code === "auth/user-not-found" || e.code === "auth/invalid-email") {
        return "We couldn't find an account associated with that email address.";
      }
      return e.message || "Failed to send password reset email.";
    }
    return "Failed to send password reset email.";
  }
};

export const handleGoogleSignIn = async (): Promise<string> => {
  try {
    // 1. Check/Prompt for Google Play Services (Required for Android)
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // 2. Start the Google Sign-In process (returns a union type)
    const signInResult: User = await GoogleSignin.signIn();

    let idToken: string | null = null;

    // 3. Robust Token Extraction (using optional chaining and casting to handle type inconsistencies)
    // Check root (common on iOS/older versions)
    idToken = signInResult.idToken;

    // Check nested under user (common on newer Android)
    if (!idToken) {
      idToken = signInResult.user?.idToken
    }

    // Check nested under data (if needed, as per your original code)
    if (!idToken) {
      idToken = (signInResult as any).data?.idToken;
    }

    if (!idToken) {
      throw new Error("No ID token found after successful Google Sign-In.");
    }

    // 4. Sign in to Firebase using the ID token
    const googleCredential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(getAuth(), googleCredential);

    return "success";
  } catch (e: unknown) {
    // 5. Handle errors, including cancellation check
    if (isGoogleError(e)) {
      // Handle known statusCodes first
      if (e.code === statusCodes.SIGN_IN_CANCELLED) {
        return "Sign-in cancelled by the user.";
      } else if (e.code === statusCodes.IN_PROGRESS) {
        return "Sign-in is already in progress.";
      } else if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return "Google Play services are not available on this device.";
      }

      if (e.code === "8" || e.code === "DEVELOPER_ERROR") {
        return "Google Sign-In configuration error. Check your SHA-1 fingerprint in Firebase.";
      }

      return e.message || "An unexpected error occurred during Google sign-in.";
    }
    console.error("Google Sign-In Error:", e);
    return "An unexpected error occurred during Google sign-in.";
  }
};

export const handleSignOut = async (): Promise<void> => {
  try {
    await signOut(getAuth());
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
  } catch (e: unknown) {
    console.error("Sign Out Error:", e);
  }
};
