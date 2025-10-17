/* istanbul ignore file */
// This file mainly contains code for IO, and unable to be tested in unit tests.
import {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
} from "@react-native-firebase/auth";
import { useEffect, useState } from "react";

export default function useUser(): FirebaseAuthTypes.User | null | undefined {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null | undefined>(
    undefined,
  );

  useEffect(() => {
    return onAuthStateChanged(getAuth(), setUser);
  }, []);

  return user;
}
