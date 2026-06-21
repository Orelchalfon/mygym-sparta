import * as React from "react";

/** The non-standard event Chrome/Edge/Android fire when a PWA is installable. */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "sparta-install-dismissed";
/** Re-offer after this many days if the user dismissed (didn't install). */
const DISMISS_DAYS = 14;

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

function recentlyDismissed() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

type InstallState = {
  /** Whether the install banner should be shown. */
  canShow: boolean;
  /** True on iOS Safari, where install is manual (Share → Add to Home Screen). */
  isIos: boolean;
  /** Trigger the native install dialog (Android/Chrome/Edge). */
  promptInstall: () => Promise<void>;
  /** Hide and remember dismissal for a while. */
  dismiss: () => void;
};

/**
 * Drives the "install this app" experience after sign-in. Registers a service
 * worker (needed for installability), captures `beforeinstallprompt`, and on
 * iOS falls back to manual Add-to-Home-Screen instructions.
 */
export function useInstallPrompt(): InstallState {
  const deferredRef = React.useRef<BeforeInstallPromptEvent | null>(null);
  const [canShow, setCanShow] = React.useState(false);
  const ios = React.useMemo(() => isIos(), []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // Register the service worker so the browser considers us installable.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* installability still works on iOS without an SW; ignore failures */
      });
    }

    if (isStandalone() || recentlyDismissed()) return;

    // Android / Chrome / Edge: stash the event and reveal our own UI.
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEvent;
      setCanShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const onInstalled = () => {
      deferredRef.current = null;
      setCanShow(false);
      try {
        localStorage.removeItem(DISMISS_KEY);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("appinstalled", onInstalled);

    // iOS never fires beforeinstallprompt — show the manual hint after a beat.
    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (ios) {
      iosTimer = setTimeout(() => setCanShow(true), 1200);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, [ios]);

  const promptInstall = React.useCallback(async () => {
    const evt = deferredRef.current;
    if (!evt) return;
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    deferredRef.current = null;
    setCanShow(false);
    if (outcome === "dismissed") {
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const dismiss = React.useCallback(() => {
    setCanShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  }, []);

  return { canShow, isIos: ios, promptInstall, dismiss };
}
