import { createGroup, getGroup } from "@/services/message";
import type { Flatmate } from "@/types/Flatmate";
import { SwipeAction } from "@/types/SwipeAction";
import { pickAvatarFor } from "@/utils/avatar";
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
  Timestamp,
  where,
} from "@react-native-firebase/firestore";

type SwipeDoc = {
  dir: SwipeAction;
  createdAt?: FirebaseFirestoreTypes.Timestamp | null;
};

type UserDoc = {
  name?: string;
  dob?: Timestamp;
  bio?: string;
  budget?: number;
  location?: string;
  tags?: string[];
  avatarUrl?: string;
  lastActiveAt?: FirebaseFirestoreTypes.Timestamp;
};

/** Set of swiped users */
export async function fetchSwipedSet(uid: string): Promise<Set<string>> {
  const qRef = query(
    collection(getFirestore(), "users", uid, "swipes"),
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
  uid: string,
  {
    area,
    maxBudget,
    limit = 30,
  }: { area?: string; maxBudget?: number | null; limit?: number } = {},
): Promise<Flatmate[]> {
  const swiped = await fetchSwipedSet(uid);

  const users = collection(getFirestore(), "users");
  // Query constraints type not working well, use any[] instead
  // https://github.com/invertase/react-native-firebase/issues/8611
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        const data = d.data() as UserDoc;
        const fm: Flatmate = {
          id: d.id,
          name: data.name ?? "",
          dob: data.dob ?? null,
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
    .filter((u: Flatmate) => u.id !== uid)
    .filter((u: Flatmate) => !swiped.has(u.id));

  return list;
}

/**record like/pass */
export async function swipe(me: string, target: string, dir: SwipeAction) {
  const ref = doc(getFirestore(), "users", me, "swipes", target);
  await setDoc(ref, { dir, createdAt: serverTimestamp() }, { merge: true });
}

/** Create match between users if mutual like*/
export async function ensureMatchIfMutualLike(
  me: string,
  target: string,
): Promise<void> {
  //check if the user liked me
  const backRef = doc(getFirestore(), "users", target, "swipes", me);
  const back = await getDoc(backRef);

  const data = back.exists() ? (back.data() as SwipeDoc) : undefined;

  if (data?.dir === SwipeAction.Like) {
    await createGroup([me, target]);
  }
}

export async function blockUser(gid: string, uid: string): Promise<void> {
  const group = await getGroup(gid);
  if (!group) {
    console.error("Group not found:", gid);
    return;
  } else if (group.members.length !== 2) {
    console.warn("Group does not have exactly two members:", gid);
  }

  for (const otherUid of group.members.filter((id) => id !== uid)) {
    await swipe(uid, otherUid, SwipeAction.Pass);
  }
}
