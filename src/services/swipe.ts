import { createGroup } from "@/services/message";
import type { Flatmate } from "@/types/flatmate";
import { pickAvatarFor } from "@/utils/avatar";
import { getApp } from "@react-native-firebase/app";
import {
  collection,
  doc,
  FirebaseFirestoreTypes,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  limit as qLimit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "@react-native-firebase/firestore";

const db = () => getFirestore(getApp());

export function matchIdFor(a: string, b: string) {
  return [a, b].sort().join("_");
}

type SwipeDoc = {
  dir: "like" | "pass";
  createdAt?: FirebaseFirestoreTypes.Timestamp | null;
};

/** Set of swiped users */
export async function fetchSwipedSet(me: string): Promise<Set<string>> {
  const qRef = query(
    collection(db(), "users", me, "swipes"),
    orderBy("createdAt", "desc"),
    qLimit(500),
  );
  const s = await getDocs(qRef);
  const ids = s.docs.map(
    (d: FirebaseFirestoreTypes.QueryDocumentSnapshot<SwipeDoc>) => d.id,
  );
  return new Set(ids);
}

/** Load unswiped candidates */
export async function loadCandidates(
  me: string,
  {
    area,
    maxBudget,
    limit = 30,
  }: { area?: string; maxBudget?: number | null; limit?: number } = {},
) {
  const swiped = await fetchSwipedSet(me);

  const users = collection(db(), "users");
  const constraints: any[] = [];

  if (area) {
    constraints.push(where("location", "==", area));
  }

  if (maxBudget != null) {
    constraints.push(where("budget", "<=", maxBudget));
    constraints.push(orderBy("budget", "asc"));
  }

  constraints.push(orderBy("lastActiveAt", "desc"));
  constraints.push(qLimit(limit));

  const qBuild = query(users, ...constraints);
  const s = await getDocs(qBuild);

  const list = s.docs
    .map(
      (
        d: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
      ) => {
        const data = d.data() as any;
        const fm: Flatmate = {
          id: d.id,
          name: data.name ?? "",
          age: data.age ?? null,
          bio: data.bio ?? "",
          budget: data.budget ?? null,
          location: data.location ?? null,
          tags: Array.isArray(data.tags) ? data.tags : [],
          avatar: data.avatarUrl
            ? { uri: data.avatarUrl }
            : pickAvatarFor(d.id),
        };
        return fm;
      },
    )
    .filter((u: Flatmate) => u.id !== me)
    .filter((u: Flatmate) => !swiped.has(u.id));

  return list;
}

/**record like/pass */
export async function swipe(me: string, target: string, dir: "like" | "pass") {
  const ref = doc(db(), "users", me, "swipes", target);
  await setDoc(ref, { dir, createdAt: serverTimestamp() }, { merge: true });
}

/** Create match between users if mutual like*/
export async function ensureMatchIfMutualLike(me: string, target: string) {
  //check if the user liked me
  const backRef = doc(db(), "users", target, "swipes", me);
  const back = await getDoc(backRef);

  const data = back.exists() ? (back.data() as SwipeDoc) : undefined;

  if (data?.dir === "like") {
    const id = matchIdFor(me, target);
    await createGroup([me, target], id);
    return id;
  }
  return null;
}
