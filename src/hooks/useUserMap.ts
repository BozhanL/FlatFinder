/* istanbul ignore file */
// This file mainly contains code for IO, and unable to be tested in unit tests.
// react-native-firebase does not work in jest unit test environment.
// Mocking it is possible, but it may not represent real world situation.
import type { Flatmate } from "@/types/Flatmate";
import {
  collection,
  FirebaseFirestoreTypes,
  getFirestore,
  onSnapshot,
} from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import useUser from "./useUser";

export default function useUserMap(): Map<string, Flatmate> {
  const currentUser = useUser();
  const [users, setUsers] = useState<Map<string, Flatmate>>(new Map());

  const uid = currentUser?.uid;
  useEffect(() => {
    if (!uid) {
      return;
    }

    const db = getFirestore();
    const usersRef = collection(db, "users");

    return onSnapshot(
      usersRef,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot<Flatmate>) => {
        const userList = snapshot.docs.map((doc) => {
          const id = doc.id;
          const data = doc.data();
          data.id = id;
          return data;
        });

        setUsers(new Map(userList.map((u) => [u.id, u])));
      },
    );
  }, [uid]);

  return users;
}
