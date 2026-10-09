import { useEffect, useState, type ComponentType } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  AudioLines,
  CirclePlay,
  LogOut,
  Moon,
  Music,
  Music2,
  Pause,
  Play,
  Sun,
} from "lucide-react";
import {
  FloatingMenu,
  FloatingMenuItem,
  RollingText,
} from "@/components/ui/liquid-morph-floating-menu";
import { useMusic, type MusicApp } from "@/components/music/music-provider";
import { useTheme } from "@/components/theme-provider";
import { useSignOut } from "@/components/user-actions";
import { cn } from "@/lib/utils";

const ROUTES = [
  { to: "/areas", label: "אזורי אימון" },
  { to: "/history", label: "היסטוריה" },
] as const;

const APPS: { id: MusicApp; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: "spotify", label: "Spotify", icon: AudioLines },
  { id: "apple", label: "Apple Music", icon: Music2 },
  { id: "youtube", label: "YouTube Music", icon: CirclePlay },
];

const panelButton =
  "flex items-center justify-center gap-2 rounded-full bg-primary-foreground/10 text-sm font-semibold transition-colors hover:bg-primary-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground";

/**
 * Mobile-only bottom dock: routes, music connection and account actions in one
 * liquid-morph menu. Desktop keeps the header avatar menu and the Spotify bar.
 */
export function MobileDock() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const music = useMusic();
  const { resolvedTheme, setTheme } = useTheme();
  const signOut = useSignOut();
  const isDark = resolvedTheme === "dark";

  // Navigating closes the dock.
  useEffect(() => setOpen(false), [pathname]);

  function pickApp(app: MusicApp) {
    setOpen(false);
    music.openMusicApp(app);
  }

  let i = 0;

  return (
    <FloatingMenu
      open={open}
      onOpenChange={setOpen}
      label="ניווט נייד"
      className="md:hidden"
      bar={<MusicChip onChoose={() => setOpen(true)} />}
    >
      <nav aria-label="ניווט נייד" className="flex flex-col items-center gap-3 px-5 pt-8">
        {ROUTES.map((r) => (
          <FloatingMenuItem key={r.to} open={open} index={i++}>
            <Link
              to={r.to}
              className="group relative flex min-h-11 items-center gap-2 rounded-xl px-3 text-[1.75rem] font-black leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden
                    className={cn(
                      "size-2 rounded-full bg-current transition-opacity",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <RollingText text={r.label} className={isActive ? "" : "opacity-75"} />
                </>
              )}
            </Link>
          </FloatingMenuItem>
        ))}
      </nav>

      <FloatingMenuItem open={open} index={i++} className="mx-5 mt-6">
        <div className="mb-2 text-sm font-semibold opacity-85">מוזיקה לאימון</div>
        <div className="grid grid-cols-3 gap-2">
          {APPS.map(({ id, label, icon: Icon }) => {
            const spotifyOn = id === "spotify" && !!music.connected;
            const chosen = music.preferredApp === id || spotifyOn;
            return (
              <button
                key={id}
                type="button"
                onClick={() => pickApp(id)}
                aria-pressed={chosen}
                className={cn(
                  "flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-2xl bg-primary-foreground/10 px-1 text-xs font-semibold transition-colors hover:bg-primary-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground",
                  chosen && "bg-primary-foreground/20 ring-2 ring-primary-foreground/70",
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span className="leading-tight">{label}</span>
                {spotifyOn && <span className="text-[11px] font-normal opacity-85">מחובר</span>}
              </button>
            );
          })}
        </div>
      </FloatingMenuItem>

      <FloatingMenuItem open={open} index={i++} className="mx-5 mt-4 grid grid-cols-2 gap-2 pb-2">
        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={cn(panelButton, "h-11")}
        >
          {isDark ? (
            <Moon className="size-4" aria-hidden />
          ) : (
            <Sun className="size-4" aria-hidden />
          )}
          מצב כהה
        </button>
        <button type="button" onClick={signOut} className={cn(panelButton, "h-11")}>
          <LogOut className="size-4 rtl:-scale-x-100" aria-hidden />
          התנתקות
        </button>
      </FloatingMenuItem>
    </FloatingMenu>
  );
}

/** Closed-dock music control: now playing when Spotify is live, otherwise a shortcut/connect. */
function MusicChip({ onChoose }: { onChoose: () => void }) {
  const { connected, ready, track, paused, togglePlay, setPlayerOpen, preferredApp, openMusicApp } =
    useMusic();

  const chip =
    "flex min-h-11 min-w-0 flex-1 items-center gap-2.5 rounded-full px-1.5 text-start transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (connected) {
    return (
      <>
        <button
          type="button"
          onClick={() => setPlayerOpen(true)}
          aria-label="פתיחת נגן ספוטיפיי"
          className={chip}
        >
          {track?.image ? (
            <img src={track.image} alt="" className="size-9 shrink-0 rounded-lg object-cover" />
          ) : (
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
              <AudioLines className="size-4 text-[#1DB954]" aria-hidden />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span dir="auto" className="block truncate text-sm font-semibold leading-tight">
              {track?.name ?? (ready ? "ספוטיפיי מחובר" : "מתחבר…")}
            </span>
            <span dir="auto" className="block truncate text-xs text-muted-foreground">
              {track?.artist ?? "הקישו לפתיחת הנגן"}
            </span>
          </span>
        </button>
        {track && (
          <button
            type="button"
            onClick={togglePlay}
            disabled={!ready}
            aria-label={paused ? "נגן" : "השהה"}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            {paused ? (
              <Play className="size-5" aria-hidden />
            ) : (
              <Pause className="size-5" aria-hidden />
            )}
          </button>
        )}
      </>
    );
  }

  const app =
    preferredApp && preferredApp !== "spotify" ? APPS.find((a) => a.id === preferredApp) : null;
  if (app) {
    const Icon = app.icon;
    return (
      <button type="button" onClick={() => openMusicApp(app.id)} className={chip}>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold leading-tight">{app.label}</span>
          <span className="block truncate text-xs text-muted-foreground">פתיחת האפליקציה</span>
        </span>
      </button>
    );
  }

  return (
    <button type="button" onClick={onChoose} className={chip}>
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Music className="size-4" aria-hidden />
      </span>
      <span className="truncate text-sm font-semibold">חיבור מוזיקה</span>
    </button>
  );
}
