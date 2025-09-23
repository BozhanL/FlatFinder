import { getAuth, signOut } from "@react-native-firebase/auth";
import { deregisterToken } from "./notification";

export async function logout() {
  await deregisterToken();
  await signOut(getAuth());
}
