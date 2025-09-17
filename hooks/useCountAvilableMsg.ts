import { MsgCounts } from "@/types/msg.usage.type";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

export function useMsgCounts(shopId?: string | null) {
  const [data, setData] = useState<MsgCounts | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // store abort controller so we can cancel in-flight request
  const abortRef = useRef<AbortController | null>(null);
  console.log("shop id",shopId);

  const fetchCounts = useCallback(async () => {
    if (!shopId) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    // cancel previous request if any
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:5002",
  timeout: 10000,
});

    try {
      const res = await api.get(`/api/v1/page/shop/${encodeURIComponent(shopId)}/msg-counts`, {
        // axios supports AbortSignal via `signal`
        signal: controller.signal,
      });
console.log("res",res);
      // server might return { success: true, data: { ... } } or directly { ... }
      const payload = res.data?.data ?? res.data;

      // optional defensive normalization
      const normalized: MsgCounts = {
        msgCount: Number(payload?.msgCount ?? payload?.msg_count ?? 0),
        cmtCount: Number(payload?.cmtCount ?? payload?.cmt_count ?? 0),
        totalUsage: Number(payload?.total ?? 0),
        totalTokensAvailable: Number(payload?.totalTokensAvailable ?? 0),
      };

      setData(normalized);
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.message === "canceled") {
        // request was cancelled; ignore
      } else {
        console.error("useMsgCounts fetch error:", err);
        setError(err?.message ?? "Failed to fetch message counts");
      }
    } finally {
      setLoading(false);
      // leave abortRef so caller can cancel if needed
    }
  }, [shopId]);

  // auto fetch when shopId changes
  useEffect(() => {
    fetchCounts();
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [fetchCounts,shopId]);
console.log("data",data);
  // expose refetch for manual refresh
  return { tData:data, tLoading:loading, tError:error, refetch: fetchCounts };
}