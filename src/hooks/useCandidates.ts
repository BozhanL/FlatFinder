import { loadCandidates } from "@/services/firestore";
import type { Flatmate } from "@/types/flatmate";
import { useEffect, useState } from "react";

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
          rows.map((r: any) => r.id)
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
