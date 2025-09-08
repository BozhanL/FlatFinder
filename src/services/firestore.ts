import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export function matchIdFor(a:string,b:string){
    return [a,b].sort().join("_");
}

/** Set of swiped users */
export async function fetchSwipedSet(me:string): Promise<Set<string>> {
     const s = await firestore()
    .collection("users").doc(me)
    .collection("swipes")
    .orderBy("createdAt", "desc")
    .limit(500)
    .get();
  return new Set(s.docs.map(d => d.id));
}

/** Load unswiped candidates */
export async function loadCandidates(
  me: string,
  { area, maxBudget, limit = 30 }: { area?: string; maxBudget?: number; limit?: number } = {}
) {
  const swiped = await fetchSwipedSet(me);

  let q: FirebaseFirestoreTypes.Query = firestore().collection("users");

  // Filter myself
  q = q.where(firestore.FieldPath.documentId(), "!=", me);

  if (area) q = q.where("location", "==", area);
  if (maxBudget) q = q.where("budget", "<=", maxBudget).orderBy("budget", "asc");

  q = q.orderBy("lastActiveAt", "desc").limit(limit);

  const s = await q.get();
  return s.docs
    .map(d => ({ id: d.id, ...(d.data() as any) }))
    .filter(u => !swiped.has(u.id));
}

/**record like/pass */
export async function swipe(me: string, target: string, dir: "like" | "pass") {
  await firestore()
    .collection("users").doc(me)
    .collection("swipes").doc(target)
    .set(
      { dir, createdAt: firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
}

/** Create match between users if mutual like*/
export async function ensureMatchIfMutualLike(me: string, target: string) {
  const back = await firestore()
    .collection("users").doc(target)
    .collection("swipes").doc(me)
    .get();

  if (back.exists() && back.data()?.["dir"] === "like") {
    const id = matchIdFor(me, target);
    await firestore().collection("matches").doc(id).set(
      {
        participants: [me, target],
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastMessageAt: null,
        lastMessageText: "",
      },
      { merge: true }
    );
    await firestore().collection("chats").doc(id).set(
      { createdAt: firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
    return id;
  }
  return null;
}

/** function to show matched list (from James?) */
export function showMatches(){};

/** function to show Messages (from James?) */
export function showMessages(){};

/** function to send Messages (from James?) */
export function sendMessages(){};