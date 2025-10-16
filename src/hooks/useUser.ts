// src/hooks/useUser.ts

/* istanbul ignore file */
// This file mainly contains code for IO, and unable to be tested in unit tests.
// react-native-firebase does not work in jest unit test environment.
// Mocking it is possible, but it may not represent real world situation.
import {
  getAuth,
  onAuthStateChanged,
  type FirebaseAuthTypes,
} from "@react-native-firebase/auth";
import { useEffect, useState } from "react";

// The user state can be:
// - undefined: Firebase is still initializing (loading)
// - FirebaseAuthTypes.User: Authenticated user object
// - null: Not authenticated
type UserStatus = FirebaseAuthTypes.User | null | undefined;

/**
 * Custom hook to listen to the Firebase Authentication state.
 * Returns undefined while loading, the user object if authenticated, or null if unauthenticated.
 */
export default function useUser(): UserStatus {
  const [user, setUser] = useState<UserStatus>(undefined);

  useEffect(() => {
    const authInstance = getAuth();
    // onAuthStateChanged is the core logic for the Auth Guard pattern
    const subscriber = onAuthStateChanged(authInstance, (currentUser) => {
      // currentUser is FirebaseAuthTypes.User or null
      setUser(currentUser);
    });

    // Unsubscribe on cleanup
    return subscriber;
  }, []);

  return user;
}
