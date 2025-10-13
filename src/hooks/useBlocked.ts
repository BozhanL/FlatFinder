/* istanbul ignore file */
// This file mainly contains code for IO, and unable to be tested in unit tests.
// react-native-firebase does not work in jest unit test environment.
// Mocking it is possible, but it may not represent real world situation.
import type { SwipeDoc } from "@/types/SwipeDoc";
import {
  collection,
  FirebaseFirestoreTypes,
  getFirestore,
  onSnapshot,
  query,
  where,
} from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import useUser from "./useUser";

export default function useBlocked(): SwipeDoc[] {
  const user = useUser();
  const [blocked, setBlocked] = useState<SwipeDoc[]>([]);

  const uid = user?.uid;
  useEffect(() => {
    if (!uid) {
      return;
    }

    const db = getFirestore();
    const swipeRef = collection(db, "users", uid, "swipes");
    const q = query(swipeRef, where("dir", "==", "pass"));

    return onSnapshot(
      q,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot<SwipeDoc>) => {
        const blockedSwipes = snapshot.docs.map((doc) => doc.data());
        setBlocked(blockedSwipes);
      },
    );
  }, [uid]);

  return blocked;
}
