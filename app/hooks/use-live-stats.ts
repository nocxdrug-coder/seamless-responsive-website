/**
 * useLiveStats — Simulated realistic live statistics for Haven Card.
 *
 * All values are client-side only. No database or API calls.
 * Designed to feel alive for an early-stage platform without overhyping.
 */

import { useState, useEffect, useRef } from "react";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Clamp a number between min and max */
function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

/** Format user count as "1.2K+" style */
function formatUsers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K+`;
  return `${n}+`;
}

/** Format dollar amount as "$12K+" or "$1.2M+" */
function formatProcessed(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M+`;
  if (dollars >= 1_000) return `$${Math.floor(dollars / 1_000)}K+`;
  return `$${Math.floor(dollars)}`;
}

// ── SSR guard — never run on server ──────────────────────────────────────────
function isBrowser() {
  return typeof window !== "undefined";
}

// ── Seeded initial values (stable across renders, unique per browser session) ─
const INITIAL_USERS     = 1_247;
const INITIAL_PROCESSED = 12_840 * 100; // stored in cents for fine increments
const INITIAL_COUNTRIES = 40;
const INITIAL_UPTIME    = 99.5;

export interface LiveStats {
  /** "1.2K+" */
  usersDisplay: string;
  /** "$12K+" */
  processedDisplay: string;
  /** "40+" */
  countriesDisplay: string;
  /** "99.5%" */
  uptimeDisplay: string;
  /** Raw user count (integer) */
  rawUsers: number;
}

export function useLiveStats(): LiveStats {
  const [users,     setUsers]     = useState(INITIAL_USERS);
  const [processed, setProcessed] = useState(INITIAL_PROCESSED);
  const [countries, setCountries] = useState(INITIAL_COUNTRIES);
  const [uptime,    setUptime]    = useState(INITIAL_UPTIME);

  // Track next country tick to avoid spamming
  const countryTickRef = useRef(0);

  useEffect(() => {
    if (!isBrowser()) return;

    // ── Active Users: fluctuate ±1–5% every 5–9 seconds ──────────────────
    const userInterval = setInterval(() => {
      setUsers((prev) => {
        const pct = (Math.random() * 4 + 1) / 100; // 1%–5%
        const delta = Math.round(prev * pct);
        const dir = Math.random() > 0.42 ? 1 : -1; // slight upward bias
        return clamp(prev + dir * delta, 900, 7_000);
      });
    }, 5_000 + Math.random() * 4_000);

    // ── Processed: only increase, +$50–$300 every 6–12 seconds ──────────
    const processedInterval = setInterval(() => {
      setProcessed((prev) => {
        const increment = (Math.floor(Math.random() * 251) + 50) * 100; // $50–$300 in cents
        return Math.min(prev + increment, 25_000 * 100); // cap at $25K
      });
    }, 6_000 + Math.random() * 6_000);

    // ── Countries: rare increase every ~3 minutes ─────────────────────────
    const countryInterval = setInterval(() => {
      countryTickRef.current += 1;
      if (countryTickRef.current % 4 === 0) { // ~every 3 min at 45s interval
        setCountries((prev) => clamp(prev + 1, 40, 60));
      }
    }, 45_000);

    // ── Uptime: tiny float ±0.05% every 15 seconds ────────────────────────
    const uptimeInterval = setInterval(() => {
      setUptime((prev) => {
        const delta = (Math.random() * 0.1 - 0.05); // ±0.05%
        return parseFloat(clamp(prev + delta, 99.3, 99.7).toFixed(1));
      });
    }, 15_000);

    return () => {
      clearInterval(userInterval);
      clearInterval(processedInterval);
      clearInterval(countryInterval);
      clearInterval(uptimeInterval);
    };
  }, []);

  return {
    usersDisplay:    formatUsers(users),
    processedDisplay: formatProcessed(processed),
    countriesDisplay: `${countries}+`,
    uptimeDisplay:   `${uptime}%`,
    rawUsers:        users,
  };
}
