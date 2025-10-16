/* istanbul ignore file */
// This file mainly contains code for IO, and unable to be tested in unit tests.
// react-native-firebase does not work in jest unit test environment.
// Mocking it is possible, but it may not represent real world situation.
import { loadCandidates } from "@/services/swipe";
import type { Flatmate } from "@/types/Flatmate";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

type CandidatesResult = {
  items: Flatmate[];
  loading: boolean;
  setItems: Dispatch<SetStateAction<Flatmate[]>>;
};

export default function useCandidates(my_uid: string | null): CandidatesResult {
  const [items, setItems] = useState<Flatmate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true as boolean;

    if (!my_uid) {
      setItems([]);
      setLoading(false);
      return;
    }

    void (async (): Promise<void> => {
      try {
        setLoading(true);
        const rows = await loadCandidates(my_uid, { limit: 30 });
        if (alive) {
          setItems(rows);
        }
        console.log(
          "candidates:",
          rows.map((r) => r.id),
        );
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();
    return (): void => {
      alive = false;
    };
  }, [my_uid]);

  return { items, loading, setItems };
}
