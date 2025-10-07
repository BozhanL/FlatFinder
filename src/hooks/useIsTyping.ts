import { getDatabase, onValue, ref } from "@react-native-firebase/database";
import { useEffect, useState } from "react";

export default function useIsTyping(gid: string, uid: string): boolean {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const db = getDatabase();
    const groupRef = ref(db, `typing/${gid}`);
    console.log(groupRef);
    return onValue(
      groupRef,
      (snapshot) => {
        let typing = false;
        console.log(snapshot.toJSON());
        snapshot.forEach((child) => {
          console.log(child.key);
          if (child.key !== uid && child.val() === true) {
            typing = true;
            return true; // stop iterating
          }

          return undefined;
        });
        setIsTyping(typing);
      },
      (e) => {
        console.error(e);
      },
    );
  }, [gid, uid]);

  return isTyping;
}
