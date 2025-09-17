// hooks/useFetchUsage.ts
import { useCallback, useEffect, useRef, useState } from "react";

export type Options = {
  range?: "daily" | "weekly" | "month-week";
  days?: number;
  weeks?: number;
  months?:number;
  startDate?: string;
  endDate?: string;
  totalTokensAvailable?: number;
};

export type TokenUsagePoint = { date: string; msg: number };
export type TokenUsageResponse = {
  totalTokensAvailable: number;
  totalTokensUsed: number;
  range?: string;
  points: TokenUsagePoint[];
};

export default function useFetchUsage(shopId: string | null, opts: Options = {}) {
  const [data, setData] = useState<TokenUsageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // cancel controller for in-flight request
  const abortRef = useRef<AbortController | null>(null);

  // Build URL with params helper
  const buildUrl = (shopIdVal: string, p: Options) => {
    const base = process.env.NEXT_PUBLIC_BASE_URL;
    const url = `/api/v1/page/shop/${encodeURIComponent(shopIdVal)}/token-count`;
    const params = new URLSearchParams();
    if (p.range) params.set("range", p.range);
    if (p.days) params.set("days", String(p.days));
    if (p.weeks) params.set("weeks", String(p.weeks));
    if (p.months) params.set("months", String(p.months));
    if (p.startDate) params.set("startDate", p.startDate);
    if (p.endDate) params.set("endDate", p.endDate);
    if (p.totalTokensAvailable) params.set("totalTokensAvailable", String(p.totalTokensAvailable));
    return `${base}${url}?${params.toString()}`;

  };

  // fetchUsage uses only shopId and the override/options passed to it (no closed-over opts)
  const fetchUsage = useCallback(
    async (override?: Options) => {
      const params = { ...(opts ?? {}), ...(override ?? {}) } as Options; // final params to use
      console.debug("fetchUsage called, shopId=", shopId, "params=", params);

      if (!shopId) {
        console.debug("fetchUsage aborted: no shopId");
        return;
      }

      // cancel previous request
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const url = buildUrl(shopId, params);
        console.debug("fetchUsage request url:", url);

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          const txt = await res.text().catch(() => res.statusText);
          throw new Error(`Request failed: ${res.status} ${txt}`);
        }

        const json = await res.json();
        const payload: any = json?.data ?? json;

        if (payload?.points) {
          setData(payload as TokenUsageResponse);
        } else {
          const maybe = json?.points ?? json?.data ?? payload;
          setData(maybe as TokenUsageResponse);
        }
        setError(null);
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.debug("fetchUsage aborted");
        } else {
          console.error("fetchUsage error", err);
          setError(err?.message ?? "Failed to fetch usage");
        }
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [shopId]
  );
  useEffect(() => {
    fetchUsage(opts);
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [shopId, opts.range, opts.days, opts.weeks, opts.startDate, opts.endDate]);

  return { data, loading, error, fetchUsage };
}
