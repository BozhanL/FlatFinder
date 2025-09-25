/* istanbul ignore file */
// This file mainly contains code for IO, and unable to be tested in unit tests.
import { loadCandidates } from "@/services/swipe";
import type { Flatmate } from "@/types/Flatmate";
import { useEffect, useState } from "react";

// IMPROVE: add return type, use export default @G2CCC
export function useCandidates(me: string | null) {
  const [items, setItems] = useState<Flatmate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    if (!me) {
      setItems([]);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const rows = await loadCandidates(me, { limit: 30 });
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
  }, [me]);

  return { items, loading, setItems };
}
