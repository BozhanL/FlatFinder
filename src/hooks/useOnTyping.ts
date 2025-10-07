/* istanbul ignore file */
// This file mainly contains code for IO, and unable to be tested in unit tests.
import { TYPING_TIMER_LENGTH } from "@/types/consts";
import { getDatabase, ref, remove, set } from "@react-native-firebase/database";
import { useState } from "react";

export default function useOnTyping(
  gid: string,
  uid: string,
): () => Promise<void> {
  const [timeoutVar, setTimeoutVar] = useState<number | null>(null);

  const onTyping = async () => {
    try {
      const db = getDatabase();
      const typeRef = ref(db, `typing/${gid}/${uid}`);
      if (timeoutVar) {
        clearTimeout(timeoutVar);
      } else {
        await set(typeRef, true);
      }

      const timeoutId = setTimeout(() => {
        void remove(typeRef).then(() => {
          setTimeoutVar(null);
        });
      }, TYPING_TIMER_LENGTH);

      setTimeoutVar(timeoutId);
    } catch (e) {
      console.error(e);
    }
  };
  return onTyping;
}
