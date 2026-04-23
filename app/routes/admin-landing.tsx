import { useCallback, useEffect, useRef, useState } from "react";
import type { SyntheticEvent } from "react";
import { useNavigate } from "react-router";
import { ADMIN_LOGIN_PATH } from "~/config/admin-routes";
import styles from "./admin-landing.module.css";

const CTA_REVEAL_DELAY_MS = 1900;
const REDIRECT_DELAY_MS = 420;
const CTA_REVEAL_TIME_S = 1.8;

export function meta() {
  return [
    { title: "Heaven Admin Control" },
    { name: "description", content: "Secure access. Powerful control." },
  ];
}

export default function AdminLandingPage() {
  const navigate = useNavigate();
  const revealTimerRef = useRef<number | null>(null);
  const redirectTimerRef = useRef<number | null>(null);

  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [isVideoFailed, setIsVideoFailed] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const revealButton = useCallback(() => {
    setIsButtonVisible((visible) => visible || true);
  }, []);

  const scheduleReveal = useCallback(() => {
    if (isButtonVisible) return;
    if (revealTimerRef.current !== null) {
      window.clearTimeout(revealTimerRef.current);
    }
    revealTimerRef.current = window.setTimeout(() => {
      revealButton();
      revealTimerRef.current = null;
    }, CTA_REVEAL_DELAY_MS);
  }, [isButtonVisible, revealButton]);

  useEffect(() => {
    return () => {
      if (revealTimerRef.current !== null) window.clearTimeout(revealTimerRef.current);
      if (redirectTimerRef.current !== null) window.clearTimeout(redirectTimerRef.current);
    };
  }, []);

  function handleVideoError() {
    setIsVideoFailed(true);
    revealButton();
  }

  function handleVideoTimeUpdate(event: SyntheticEvent<HTMLVideoElement>) {
    if (isButtonVisible) return;
    if (event.currentTarget.currentTime >= CTA_REVEAL_TIME_S) {
      revealButton();
      if (revealTimerRef.current !== null) {
        window.clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    }
  }

  function handleGetStartedClick() {
    if (isRedirecting) return;
    setIsRedirecting(true);

    if (redirectTimerRef.current !== null) {
      window.clearTimeout(redirectTimerRef.current);
    }
    redirectTimerRef.current = window.setTimeout(() => {
      navigate(ADMIN_LOGIN_PATH);
    }, REDIRECT_DELAY_MS);
  }

  return (
    <main className={`${styles.page} ${isVideoFailed ? styles.videoFallback : ""}`}>
      {!isVideoFailed && (
        <video
          src="/media/admin-get-start.mp4"
          className={styles.videoBackground}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={scheduleReveal}
          onPlay={scheduleReveal}
          onTimeUpdate={handleVideoTimeUpdate}
          onError={handleVideoError}
        />
      )}

      <div className={styles.overlay} />

      <section className={`${styles.content} ${isRedirecting ? styles.contentExit : ""}`}>
        <p className={styles.eyebrow}>ADMIN PANEL</p>
        <h1 className={styles.heading}>Heaven Admin Control</h1>
        <p className={styles.subtext}>Secure access. Powerful control.</p>

        <button
          type="button"
          className={[
            styles.getStartedButton,
            isButtonVisible ? styles.getStartedButtonVisible : "",
            isRedirecting ? styles.getStartedButtonExit : "",
          ].join(" ")}
          onClick={handleGetStartedClick}
          disabled={isRedirecting}
        >
          Get Started
        </button>
      </section>
    </main>
  );
}
