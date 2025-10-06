import { getAuth, signOut } from "@react-native-firebase/auth";
import { deregisterToken } from "./notification";

export async function logout(): Promise<void> {
  await deregisterToken();
  await signOut(getAuth());
}
