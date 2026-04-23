import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useLocation } from "react-router";
import { TriangleAlert, X, Clock, CheckCircle } from "lucide-react";
import styles from "./action-required-modal.module.css";

const REMIND_KEY = "cc_shop_popup_remind_until";
const REMIND_SCOPE_KEY = "cc_shop_popup_remind_scope";
const ZERO_AT_KEY = "cc_shop_last_balance_zero_at";
const FIRST_SEEN_KEY = "cc_shop_first_seen_at";
const REMIND_MS = 2 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const NEW_USER_DAYS = 5;
const EXISTING_USER_AGE_THRESHOLD_DAYS = 7;
const EXISTING_USER_ZERO_BALANCE_LIMIT_DAYS = 7;

type PopupScope = "new_user" | "existing_user" | "failsafe";

interface UserResponse {
  id?: string;
  createdAt?: number;
  walletUsd?: number;
  walletDisplay?: string;
  accountLifecycle?: {
    showPopup?: boolean;
    remainingMs?: number;
  };
}

function formatRemainingDays(ms: number) {
  const remainingDays = Math.max(0, Math.ceil(ms / DAY_MS));
  return `${remainingDays} day${remainingDays === 1 ? "" : "s"}`;
}

function readNumber(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function ActionRequiredModal() {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [scope, setScope] = useState<PopupScope>("failsafe");
  const [remainingMs, setRemainingMs] = useState(0);
  const [reminded, setReminded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const syncLifecycle = async (trigger: string) => {
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (!mounted || !res.ok) {
          setIsVisible(false);
          return;
        }

        const data = (await res.json()) as UserResponse;
        const userId = data.id ?? "unknown";
        const now = Date.now();

        const walletFromCents = typeof data.walletUsd === "number" ? data.walletUsd / 100 : NaN;
        const walletFromDisplay = typeof data.walletDisplay === "string" ? Number(data.walletDisplay) : NaN;
        const balance = Number.isFinite(walletFromCents)
          ? walletFromCents
          : (Number.isFinite(walletFromDisplay) ? walletFromDisplay : NaN);

        const serverCreatedAt = typeof data.createdAt === "number" ? data.createdAt : null;
        const firstSeenStorageKey = `${FIRST_SEEN_KEY}:${userId}`;
        const existingFirstSeen = readNumber(localStorage.getItem(firstSeenStorageKey));
        const firstSeenAt = serverCreatedAt ?? existingFirstSeen ?? now;
        if (!existingFirstSeen) localStorage.setItem(firstSeenStorageKey, String(firstSeenAt));

        const accountAgeDays = Math.floor((now - firstSeenAt) / DAY_MS);
        const isZeroBalance = Number.isFinite(balance) ? balance === 0 : true;

        const zeroStorageKey = `${ZERO_AT_KEY}:${userId}`;
        const serverZeroAt = (data as { lastBalanceZeroAt?: number }).lastBalanceZeroAt;
        let lastBalanceZeroAt = typeof serverZeroAt === "number" ? serverZeroAt : readNumber(localStorage.getItem(zeroStorageKey));

        if (isZeroBalance && !lastBalanceZeroAt) {
          lastBalanceZeroAt = now;
          localStorage.setItem(zeroStorageKey, String(lastBalanceZeroAt));
        } else if (!isZeroBalance && lastBalanceZeroAt) {
          localStorage.removeItem(zeroStorageKey);
          lastBalanceZeroAt = null;
        }

        let nextScope: PopupScope = "failsafe";
        let shouldShow = false;
        let nextRemainingMs = EXISTING_USER_ZERO_BALANCE_LIMIT_DAYS * DAY_MS;

        if (isZeroBalance && accountAgeDays <= NEW_USER_DAYS) {
          nextScope = "new_user";
          shouldShow = true;
          nextRemainingMs = Math.max(0, (NEW_USER_DAYS * DAY_MS) - (now - firstSeenAt));
        } else if (isZeroBalance && accountAgeDays > EXISTING_USER_AGE_THRESHOLD_DAYS) {
          nextScope = "existing_user";
          shouldShow = true;
          const ref = lastBalanceZeroAt ?? now;
          nextRemainingMs = Math.max(0, (EXISTING_USER_ZERO_BALANCE_LIMIT_DAYS * DAY_MS) - (now - ref));
        } else if (!Number.isFinite(balance) || !firstSeenAt) {
          nextScope = "failsafe";
          shouldShow = true;
        } else {
          shouldShow = false;
        }

        if (data.accountLifecycle?.showPopup === true && !shouldShow) {
          shouldShow = true;
          nextRemainingMs = Math.max(0, data.accountLifecycle.remainingMs ?? nextRemainingMs);
          nextScope = accountAgeDays <= NEW_USER_DAYS ? "new_user" : "existing_user";
        }

        if (!shouldShow) {
          setIsVisible(false);
          localStorage.removeItem(REMIND_KEY);
          localStorage.removeItem(REMIND_SCOPE_KEY);
          return;
        }

        setScope(nextScope);
        setRemainingMs(nextRemainingMs);
        setIsVisible(true);

        const remindUntil = Number(localStorage.getItem(REMIND_KEY) ?? "0");
        const remindScope = localStorage.getItem(REMIND_SCOPE_KEY);
        setReminded(remindUntil > now && remindScope === nextScope);

        console.log("[deposit-popup]", {
          trigger,
          userType: nextScope,
          balance,
          daysRemaining: Math.ceil(nextRemainingMs / DAY_MS),
          popupTriggerStatus: shouldShow,
        });
      } catch {
        if (!mounted) return;
        setScope("failsafe");
        setRemainingMs(EXISTING_USER_ZERO_BALANCE_LIMIT_DAYS * DAY_MS);
        setIsVisible(true);
        setReminded(false);
        console.log("[deposit-popup]", {
          trigger,
          userType: "failsafe",
          balance: "unknown",
          daysRemaining: EXISTING_USER_ZERO_BALANCE_LIMIT_DAYS,
          popupTriggerStatus: true,
        });
      }
    };

    void syncLifecycle("mount_or_route_change");
    const pollId = window.setInterval(() => void syncLifecycle("poll"), 15000);
    const onFocus = () => { void syncLifecycle("window_focus"); };
    window.addEventListener("focus", onFocus);
    return () => {
      mounted = false;
      window.clearInterval(pollId);
      window.removeEventListener("focus", onFocus);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isVisible || reminded) return;
    const id = window.setInterval(() => {
      setRemainingMs((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isVisible, reminded]);

  useEffect(() => {
    if (!isVisible || reminded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible, reminded]);

  const copy = useMemo(() => {
    if (scope === "new_user") {
      return {
        title: "Action Required - Deposit Needed",
        message: "You must deposit within 5 days or your account may be removed.",
      };
    }
    if (scope === "existing_user") {
      return {
        title: "Action Required - Deposit Needed",
        message: "Your balance is empty. Deposit within 7 days to keep your account active.",
      };
    }
    return {
      title: "Warning - Deposit Required",
      message: "We could not confirm account status. Deposit now to keep your account active.",
    };
  }, [scope]);

  const handleRemindLater = () => {
    const until = Date.now() + REMIND_MS;
    localStorage.setItem(REMIND_KEY, String(until));
    localStorage.setItem(REMIND_SCOPE_KEY, scope);
    setReminded(true);
  };

  if (!isVisible || reminded) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Deposit required">
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <TriangleAlert size={20} color="#ff2e2e" />
          </div>
          <div className={styles.headerText}>
            <div className={styles.headerTitle}>{copy.title}</div>
            <div className={styles.headerSubtitle}>{copy.message}</div>
          </div>
          <button className={styles.closeBtn} onClick={handleRemindLater} aria-label="Close">
            <X size={14} />
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.bodyText}>{copy.message}</p>

          <div className={styles.deadlineBanner}>
            <div className={styles.deadlineIcon}>
              <Clock size={16} color="#ff2e2e" />
            </div>
            <div className={styles.deadlineContent}>
              <div className={styles.deadlineTitle}>Remaining Time: {formatRemainingDays(remainingMs)}</div>
              <div className={styles.deadlineDesc}>
                Countdown is recalculated on every login, refresh, and route change.
              </div>
            </div>
          </div>

          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <CheckCircle size={16} className={styles.featureCheck} />
              Secure Payment and crypto supported
            </div>
            <div className={styles.featureItem}>
              <CheckCircle size={16} className={styles.featureCheck} />
              Secure wallet credit with real-time confirmation
            </div>
            <div className={styles.featureItem}>
              <CheckCircle size={16} className={styles.featureCheck} />
              Minimum deposit shown at checkout
            </div>
          </div>

          <div className={styles.actions}>
            <Link to="/deposit" className={styles.topUpBtn}>Deposit Now</Link>
            <button className={styles.remindBtn} onClick={handleRemindLater}>Remind Me Later</button>
          </div>
        </div>
      </div>
    </div>
  );
}
