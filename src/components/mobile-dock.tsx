import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  AudioLines,
  ChevronLeft,
  CirclePlay,
  LogOut,
  Moon,
  Music,
  Music2,
  Settings,
  Sun,
} from "lucide-react";
import {
  FloatingMenu,
  FloatingMenuItem,
  RollingText,
} from "@/components/ui/liquid-morph-floating-menu";
import { useMusic, type MusicApp } from "@/components/music/music-provider";
import { useTheme } from "@/components/theme-provider";
import { useProfile, useSignOut } from "@/components/user-actions";
import { cn } from "@/lib/utils";

const ROUTES = [
  { to: "/areas", label: "אזורי אימון" },
  { to: "/history", label: "היסטוריית אימונים" },
] as const;

const APPS: { id: MusicApp; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: "spotify", label: "Spotify", icon: AudioLines },
  { id: "apple", label: "Apple Music", icon: Music2 },
  { id: "youtube", label: "YouTube Music", icon: CirclePlay },
];

const ring =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground";

const tile = cn(
  "flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl bg-primary-foreground/10 px-1 text-xs font-semibold transition-colors hover:bg-primary-foreground/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-primary-foreground/10",
  ring,
);

/**
 * Mobile-only bottom dock. Closed: hamburger + a preview of what's inside
 * (profile, music, settings, theme). Open: profile, routes, music and system
 * sections. Desktop keeps the header avatar menu and the Spotify bar.
 */
export function MobileDock() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const music = useMusic();
  const profile = useProfile();
  const { resolvedTheme, setTheme } = useTheme();
  const signOut = useSignOut();
  const isDark = resolvedTheme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  const initial = profile?.name.trim().charAt(0).toUpperCase() || "?";

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
      label="תפריט ניווט"
      className="md:hidden"
      bar={
        <DockPreview
          initial={initial}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpen={() => setOpen(true)}
        />
      }
    >
      <div className="px-5 pt-5 pb-3">
        {/* Profile */}
        <FloatingMenuItem open={open} index={i++} className="flex items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-foreground text-lg font-black text-primary">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-black leading-tight">{profile?.name || "—"}</div>
            {profile?.email && (
              <div dir="ltr" className="truncate text-end text-sm opacity-80">
                {profile.email}
              </div>
            )}
          </div>
        </FloatingMenuItem>

        <Section title="ניווט" open={open} index={i++}>
          <nav aria-label="ניווט ראשי" className="-mx-2 flex flex-col">
            {ROUTES.map((r) => (
              <Link
                key={r.to}
                to={r.to}
                className={cn(
                  "group flex min-h-12 items-center rounded-xl px-2 text-[1.375rem] leading-none transition-colors hover:bg-primary-foreground/10",
                  ring,
                )}
              >
                {({ isActive }) => (
                  <>
                    <RollingText
                      text={r.label}
                      className={cn(
                        "transition-opacity",
                        isActive
                          ? "font-black"
                          : "font-bold opacity-75 group-hover:opacity-100 group-focus-visible:opacity-100",
                      )}
                    />
                    {/* Points the way in RTL; bolds and steps toward the label when current/hovered. */}
                    <ChevronLeft
                      aria-hidden
                      className={cn(
                        "ms-3 size-6 shrink-0 transition-[translate,stroke-width,opacity] duration-200",
                        isActive
                          ? "translate-x-1.5 stroke-3"
                          : "stroke-2 opacity-75 group-hover:translate-x-1.5 group-hover:stroke-3 group-hover:opacity-100 group-focus-visible:translate-x-1.5 group-focus-visible:stroke-3 group-focus-visible:opacity-100",
                      )}
                    />
                  </>
                )}
              </Link>
            ))}
          </nav>
        </Section>

        <Section title="מוזיקה לאימון" open={open} index={i++}>
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
                    tile,
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
        </Section>

        <Section title="מערכת" open={open} index={i++}>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={isDark}
              onClick={toggleTheme}
              className={tile}
            >
              {isDark ? (
                <Moon className="size-5" aria-hidden />
              ) : (
                <Sun className="size-5" aria-hidden />
              )}
              מצב כהה
            </button>
            {/* No settings page yet — shown (not hidden) so it's clear it's coming. */}
            <button type="button" disabled className={tile}>
              <Settings className="size-5" aria-hidden />
              הגדרות
              <span className="rounded-full bg-primary-foreground/15 px-1.5 text-[10px] font-normal">
                בקרוב
              </span>
            </button>
            <button type="button" onClick={signOut} className={tile}>
              <LogOut className="size-5 rtl:-scale-x-100" aria-hidden />
              התנתקות
            </button>
          </div>
        </Section>
      </div>
    </FloatingMenu>
  );
}

/** A divided, titled group inside the open panel. */
function Section({
  title,
  open,
  index,
  children,
}: {
  title: string;
  open: boolean;
  index: number;
  children: ReactNode;
}) {
  return (
    <FloatingMenuItem
      open={open}
      index={index}
      className="mt-4 border-t border-primary-foreground/20 pt-3"
    >
      <h2 className="mb-2 text-xs font-semibold tracking-wide opacity-80">{title}</h2>
      {children}
    </FloatingMenuItem>
  );
}

/** Closed-dock preview: one icon per panel section. */
function DockPreview({
  initial,
  isDark,
  onToggleTheme,
  onOpen,
}: {
  initial: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpen: () => void;
}) {
  const { connected, track, paused, setPlayerOpen, preferredApp, openMusicApp } = useMusic();

  const icon = cn(
    "relative grid size-11 shrink-0 place-items-center rounded-full text-foreground transition-colors hover:bg-muted",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  );

  const app =
    preferredApp && preferredApp !== "spotify" ? APPS.find((a) => a.id === preferredApp) : null;

  let music: ReactNode;
  if (connected) {
    music = (
      <button
        type="button"
        onClick={() => setPlayerOpen(true)}
        aria-label={
          track ? `נגן ספוטיפיי: ${track.name} (${paused ? "מושהה" : "מנגן"})` : "נגן ספוטיפיי"
        }
        className={icon}
      >
        {track?.image ? (
          <img src={track.image} alt="" className="size-8 rounded-lg object-cover" />
        ) : (
          <AudioLines className="size-5" aria-hidden />
        )}
        <span
          aria-hidden
          className={cn(
            "absolute bottom-1 end-1 size-2.5 rounded-full ring-2 ring-card",
            track && !paused ? "bg-[#1DB954]" : "bg-muted-foreground",
          )}
        />
      </button>
    );
  } else if (app) {
    const Icon = app.icon;
    music = (
      <button
        type="button"
        onClick={() => openMusicApp(app.id)}
        aria-label={`פתיחת ${app.label}`}
        className={icon}
      >
        <Icon className="size-5" aria-hidden />
      </button>
    );
  } else {
    music = (
      <button type="button" onClick={onOpen} aria-label="חיבור מוזיקה" className={icon}>
        <Music className="size-5" aria-hidden />
      </button>
    );
  }

  return (
    <div className="flex w-full items-center justify-around border-s border-border ps-1">
      <button type="button" onClick={onOpen} aria-label="פרופיל" className={icon}>
        <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-black text-primary-foreground">
          {initial}
        </span>
      </button>
      {music}
      <button type="button" onClick={onOpen} aria-label="הגדרות" className={icon}>
        <Settings className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="מצב כהה"
        onClick={onToggleTheme}
        className={icon}
      >
        {isDark ? <Moon className="size-5" aria-hidden /> : <Sun className="size-5" aria-hidden />}
      </button>
    </div>
  );
}
