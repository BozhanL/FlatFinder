import { deregisterToken } from "@/hooks/useNotification";
import { getAuth, signOut } from "@react-native-firebase/auth";

export async function logout() {
  await deregisterToken();
  await signOut(getAuth());
}
