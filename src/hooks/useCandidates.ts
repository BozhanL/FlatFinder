/* istanbul ignore file */
// This file mainly contains code for IO, and unable to be tested in unit tests.
import { loadCandidates } from "@/services/swipe";
import type { Flatmate } from "@/types/Flatmate";
import { useEffect, useState } from "react";

// IMPROVE: add return type @G2CCC
export default function useCandidates(my_uid: string | null) {
  const [items, setItems] = useState<Flatmate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    if (!my_uid) {
      setItems([]);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const rows = await loadCandidates(my_uid, { limit: 30 });
        if (alive) setItems(rows);
        console.log(
          "candidates:",
          rows.map((r: any) => r.id),
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [my_uid]);

  return { items, loading, setItems };
}
