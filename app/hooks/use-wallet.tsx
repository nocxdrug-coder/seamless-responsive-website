/**
 * Hook for fetching and managing the user's wallet state.
 *
 * SOURCE OF TRUTH: /api/wallet which computes balance from transactions table.
 * Auto-refreshes every 10 seconds so admin credits appear without page reload.
 * Manual refresh available via the returned `refresh` function.
 */
import { useState, useEffect, useCallback, useRef } from "react";

export interface WalletState {
  id: string | null;
  email: string | null;
  name: string | null;
  role: "user" | "admin" | null;
  balanceUsd: string;
  totalDeposited: string;
  isLoading: boolean;
  error: string | null;
}

const INITIAL: WalletState = {
  id: null,
  email: null,
  name: null,
  role: null,
  balanceUsd: "0.00",
  totalDeposited: "0.00",
  isLoading: true,
  error: null,
};

const POLL_INTERVAL_MS = 10_000; // auto-refresh every 10s

export function useWallet() {
  const [state, setState] = useState<WalletState>(INITIAL);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch_data = useCallback(async () => {
    try {
      const res = await fetch("/api/wallet", {
        credentials: "include",
        // Bust any remaining browser cache
        headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" },
      });

      if (res.status === 401) {
        setState({ ...INITIAL, isLoading: false });
        return;
      }
      if (!res.ok) {
        setState((s) => ({ ...s, isLoading: false, error: "Failed to fetch wallet" }));
        return;
      }

      const data = await res.json();
      console.log("USER [cart/wallet]:", data.id);
      console.log("WALLET [cart/wallet]:", data.walletDisplay);

      setState({
        id: data.id ?? null,
        email: data.email ?? null,
        name: data.name ?? null,
        role: data.role ?? null,
        balanceUsd: data.walletDisplay ?? "0.00",
        totalDeposited: data.totalDepositedDisplay ?? "0.00",
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    setState((s) => ({ ...s, isLoading: true }));
    void fetch_data();

    // Auto-refresh every 10s so admin credits appear without manual refresh
    timerRef.current = setInterval(() => { void fetch_data(); }, POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetch_data]);

  return { ...state, refresh: fetch_data };
}
