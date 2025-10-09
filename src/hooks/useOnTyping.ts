/* istanbul ignore file */
// This file mainly contains code for IO, and unable to be tested in unit tests.
import { TYPING_TIMER_LENGTH } from "@/types/consts";
import { getDatabase, ref, remove, set } from "@react-native-firebase/database";
import { useFocusEffect } from "expo-router";
import { debounce } from "lodash";
import { useCallback, useMemo, useRef } from "react";

export default function useOnTyping(
  gid: string,
  uid: string,
): (text: string) => void {
  const isTyping = useRef(false);
  const debouncedStopTyping = useMemo(
    () =>
      debounce(() => {
        void remove(ref(getDatabase(), `typing/${gid}/${uid}`));
        isTyping.current = false;
        console.debug("stopped typing");
      }, TYPING_TIMER_LENGTH),
    [gid, uid],
  );

  const onTyping = useCallback(
    (text: string): void => {
      async function f(): Promise<void> {
        // Only set typing when there is text
        if (text.length === 0) {
          debouncedStopTyping.flush();
          return;
        }

        console.debug("onTyping called", text);

        try {
          if (!isTyping.current) {
            const typeRef = ref(getDatabase(), `typing/${gid}/${uid}`);
            await set(typeRef, true);
            isTyping.current = true;
          }

          debouncedStopTyping();
        } catch (e) {
          console.error(e);
        }
      }

      void f();
    },
    [debouncedStopTyping, gid, uid],
  );

  useFocusEffect(
    useCallback(() => {
      return (): void => {
        debouncedStopTyping.flush();
        console.debug("cleanup on unmount or blur");
      };
    }, [debouncedStopTyping]),
  );

  return onTyping;
}
