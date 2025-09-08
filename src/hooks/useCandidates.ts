import { loadCandidates } from "@/services/firestore";
import type { Flatmate } from "@/types/flatmate";
import { useEffect, useState } from "react";

export function useCandidates(
  meUid: string,
  filters?: { area?: string; maxBudget?: number }
) {
  const [items, setItems] = useState<Flatmate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const rows = await loadCandidates(meUid, { ...filters, limit: 30 });
        if (alive) setItems(rows as any);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [meUid, filters?.area, filters?.maxBudget]);

  return { items, loading, setItems };
}
