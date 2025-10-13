import type { Flatmate } from "@/types/Flatmate";
import {
  collection,
  FirebaseFirestoreTypes,
  getFirestore,
  onSnapshot,
} from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import useUser from "./useUser";

export default function useUserMap() {
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
      //   TODO: Need review from Gary @G2CCC
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
