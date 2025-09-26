/* istanbul ignore file */
// This file mainly contains code for IO, and unable to be tested in unit tests.
import { Group } from "@/types/Group";
import { getUserByUidAsync } from "@/services/message";
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
      async (snapshot: FirebaseFirestoreTypes.QuerySnapshot<Group>) => {
        const groupsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            if (data.name === null) {
              const other = data.members.find((m) => m !== uid);
              if (other) {
                const user = await getUserByUidAsync(other);
                data.name = user?.name ?? null;
                data.avatar =
                  typeof user?.avatar === "string" ? user.avatar : null;
              }
            }
            return data;
          }),
        );

        setGroups(groupsData);
      },
    );
  }, [uid]);

  const sortedGroups = useMemo(() => {
    return groups.sort((a, b) => {
      const aTime = a.lastTimestamp?.toMillis?.() ?? 0;
      const bTime = b.lastTimestamp?.toMillis?.() ?? 0;
      return bTime - aTime;
    });
  }, [groups]);

  return sortedGroups;
}
