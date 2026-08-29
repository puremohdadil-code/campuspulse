import { useEffect, useState } from "react";
import { http } from "../api/http";

interface Options {
  enabled?: boolean;
  debounceMs?: number;
}

// Debounced POST to a server-side "preview calculation" endpoint (line-item
// totals, VAT, discounts, ...). Screens that let a user tweak an invoice /
// quotation live use this so the numbers shown while editing come from the
// exact same math the save endpoint will use — never a client-side guess
// that could drift from what actually gets persisted.
export default function useServerCalculation<TPayload, TResult = Record<string, unknown>>(
  endpoint: string,
  payload: TPayload,
  { enabled = true, debounceMs = 300 }: Options = {}
): { result: TResult | null; loading: boolean } {
  const [result, setResult] = useState<TResult | null>(null);
  const [loading, setLoading] = useState(false);
  const payloadKey = JSON.stringify(payload);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      if (!enabled) {
        setResult(null);
        return;
      }
      setLoading(true);
      try {
        const { data: json } = await http.post(endpoint, payload);
        if (!cancelled) setResult(json.data ?? json);
      } catch {
        if (!cancelled) setResult(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // Deliberately keyed on `payloadKey` (content), not `payload` (object
    // reference) — callers rarely memoize their payload, so depending on the
    // reference itself would re-fire this on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, payloadKey, enabled, debounceMs]);

  return { result, loading };
}
