/* istanbul ignore file */
// This file mainly contains code for IO, and unable to be tested in unit tests.
// react-native-firebase does not work in jest unit test environment.
// Mocking it is possible, but it may not represent real world situation.
import { getUserByUidAsync } from "@/services/message";
import type { Group } from "@/types/Group";
import {
  collection,
  FirebaseFirestoreTypes,
  getFirestore,
  onSnapshot,
  query,
  where,
} from "@react-native-firebase/firestore";
import { useEffect, useMemo, useState } from "react";

export default function useGroups(uid: string): Group[] {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const db = getFirestore();
    const groupsRef = collection(
      db,
      "groups",
    ) as FirebaseFirestoreTypes.CollectionReference<Group>;

    return onSnapshot(
      query(groupsRef, where("members", "array-contains", uid)),
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot<Group>) =>
        void Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            if (data.name === null) {
              const other = data.members.find((m) => m !== uid);
              if (other) {
                data.name = (await getUserByUidAsync(other))?.name || null;
              }
            }
            return data;
          }),
        ).then((groupsData) => {
          setGroups(groupsData);
        }),
    );
  }, [uid]);

  const sortedGroups = useMemo(() => {
    return groups.sort((a, b) => {
      const aTime = a.lastTimestamp.toMillis();
      const bTime = b.lastTimestamp.toMillis();
      return bTime - aTime;
    });
  }, [groups]);

  return sortedGroups;
}
