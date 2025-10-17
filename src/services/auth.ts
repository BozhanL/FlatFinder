import { AuthErrorCodes } from "@firebase/auth";
import {
  createUserWithEmailAndPassword,
  FirebaseAuthTypes,
  getAuth,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
} from "@react-native-firebase/auth";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
  type SignInSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { deregisterToken } from "./notification";

export async function handleAuth(
  isLogin: boolean,
  email: string,
  password: string,
): Promise<string | null> {
  try {
    if (isLogin) {
      await signInWithEmailAndPassword(getAuth(), email, password);
    } else {
      await createUserWithEmailAndPassword(getAuth(), email, password);
    }
  } catch (e: unknown) {
    let errorMessage = "An unknown error occurred.";

    const err = e as FirebaseAuthTypes.NativeFirebaseAuthError;
    switch (err.code) {
      case AuthErrorCodes.EMAIL_EXISTS:
        errorMessage = "That email address is already in use!";
        break;
      case AuthErrorCodes.INVALID_EMAIL:
        errorMessage = "That email address is invalid!";
        break;
      case AuthErrorCodes.WEAK_PASSWORD:
        errorMessage = "Password should be at least 6 characters.";
        break;
      case AuthErrorCodes.USER_DISABLED:
        errorMessage = "User account is disabled.";
        break;
      case AuthErrorCodes.USER_DELETED:
      case AuthErrorCodes.INVALID_PASSWORD:
      case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
        errorMessage = "Invalid email or password.";
        break;
      case AuthErrorCodes.OPERATION_NOT_ALLOWED:
        errorMessage =
          "Email/Password Sign-In is not enabled. Please contact support.";
        break;
      default:
        errorMessage = err.message || errorMessage;
        break;
    }

    return errorMessage;
  }
  return null;
}

export async function handlePasswordReset(
  email: string,
): Promise<string | null> {
  if (!email) {
    return "Please enter your email address above to receive a password reset link.";
  }

  try {
    await sendPasswordResetEmail(getAuth(), email);
  } catch (e: unknown) {
    let errorMessage = "Failed to send password reset email.";

    const err = e as FirebaseAuthTypes.NativeFirebaseAuthError;
    switch (err.code) {
      case AuthErrorCodes.USER_DELETED:
      case AuthErrorCodes.INVALID_EMAIL:
        errorMessage =
          "We couldn't find an account associated with that email address.";
        break;
      default:
        errorMessage = err.message || errorMessage;
        break;
    }

    return errorMessage;
  }

  return null;
}

export async function handleGoogleSignIn(): Promise<string | null> {
  try {
    // 1. Check if Google Play Services are available (Critical for Android)
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
  } catch (e) {
    console.error("Play services error:", e);

    return "Google Play Services are not available or outdated. Please update to continue.";
  }

  let signInResult: SignInSuccessResponse;
  try {
    // 2. Start the Google Sign-In process (opens native prompt)
    const response = await GoogleSignin.signIn();
    if (isSuccessResponse(response)) {
      signInResult = response;
    } else {
      throw new Error("Google Sign-In was not successful.");
    }
  } catch (e) {
    let errorMessage = "Google Sign-In was not successful.";
    console.error("Google Sign-In error:", e);
    if (isErrorWithCode(e)) {
      switch (e.code) {
        // Google Sign-In library specific errors
        case statusCodes.SIGN_IN_CANCELLED:
          errorMessage = "Sign-in cancelled by the user.";
          break;
        case statusCodes.IN_PROGRESS:
          errorMessage = "Sign-in is already in progress.";
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          errorMessage =
            "Google Play services are not available on this device.";
          break;
        default:
          errorMessage = e.message || errorMessage;
          break;
      }
    }

    return errorMessage;
  }

  try {
    // 3. Robust token retrieval
    const idToken = signInResult.data.idToken;
    if (!idToken) {
      return "Failed to retrieve ID token from Google Sign-In.";
    }
    // 4. Create a Google credential with the token (Modular API)
    const googleCredential = GoogleAuthProvider.credential(idToken);
    // 5. Sign the user into Firebase (Modular API)
    await signInWithCredential(getAuth(), googleCredential);
  } catch (e: unknown) {
    let errorMessage = "An unknown error occurred during Google sign-in.";

    const err = e as FirebaseAuthTypes.NativeFirebaseAuthError;
    switch (err.code) {
      case AuthErrorCodes.OPERATION_NOT_ALLOWED:
        errorMessage = "Google Sign-In is not enabled. Please contact support.";
        break;
      case AuthErrorCodes.NEED_CONFIRMATION:
        errorMessage =
          "An account with this email already exists using a different sign-in method.";
        break;
      case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
        errorMessage =
          "Invalid credential. Check your webClientId configuration.";
        break;
      default:
        errorMessage = err.message || errorMessage;
        break;
    }
    return errorMessage;
  }

  return null;
}

export async function logout(): Promise<void> {
  try {
    await deregisterToken();
    await GoogleSignin.signOut();
    await signOut(getAuth());
  } catch (e: unknown) {
    console.error("Sign Out Error:", e);
  }
}
