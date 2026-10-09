import { useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  LogOut,
  Music,
  ChevronUp,
  ChevronDown,
  Volume2,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMusic } from "@/components/music/music-provider";

function fmtTime(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/**
 * Spotify player UI. The bottom bar is desktop-only (the mobile dock takes its place);
 * the full-player drawer is shared, so the dock can open it too.
 */
export function SpotifyPlayer() {
  const {
    connected,
    ready,
    track,
    paused,
    position,
    volume,
    deviceId,
    connect: handleConnect,
    disconnect: handleDisconnect,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    claimDevice: handleClaimDevice,
    playerOpen: expanded,
    setPlayerOpen: setExpanded,
  } = useMusic();

  const handleVolume = useCallback((v: number[]) => setVolume((v[0] ?? 0) / 100), [setVolume]);
  const handleSeek = useCallback((v: number[]) => seek(v[0] ?? 0), [seek]);

  if (connected === null) return null;

  if (!connected) {
    return (
      <div
        dir="ltr"
        className="fixed bottom-0 inset-x-0 z-50 hidden border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-card/80 md:block"
      >
        <div className="mx-auto flex h-[72px] max-w-3xl items-center justify-center px-3">
          <Button
            onClick={handleConnect}
            size="touch"
            variant="outline"
            className="rounded-full font-bold"
          >
            <Music className="text-[#1DB954]" aria-hidden />
            חבר ספוטיפיי למוזיקה באימון
          </Button>
        </div>
      </div>
    );
  }

  const duration = track?.duration ?? 0;

  return (
    <Drawer open={expanded} onOpenChange={setExpanded}>
      <div
        dir="ltr"
        className="fixed bottom-0 inset-x-0 z-50 hidden border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-card/80 md:block"
      >
        <div className="mx-auto flex h-[72px] max-w-3xl items-center gap-3 px-3">
          <DrawerTrigger asChild>
            <button
              className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer hover:opacity-90"
              aria-label="הרחב נגן"
            >
              {track?.image ? (
                <img src={track.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <Music className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate text-foreground">
                  {track?.name ?? (ready ? "מוכן — הקש להרחבה" : "מתחבר…")}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {track?.artist ?? (ready ? "Workout Buddy" : "")}
                </div>
              </div>
              <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          </DrawerTrigger>
          <div className="flex items-center gap-1">
            <Button
              size="icon-touch"
              variant="ghost"
              onClick={prev}
              disabled={!ready}
              aria-label="השיר הקודם"
            >
              <SkipBack />
            </Button>
            <Button
              size="icon-touch"
              onClick={togglePlay}
              disabled={!ready}
              aria-label={paused ? "נגן" : "השהה"}
              className="rounded-full"
            >
              {paused ? <Play /> : <Pause />}
            </Button>
            <Button
              size="icon-touch"
              variant="ghost"
              onClick={next}
              disabled={!ready}
              aria-label="השיר הבא"
            >
              <SkipForward />
            </Button>
          </div>
        </div>
      </div>

      <DrawerContent dir="ltr">
        <DrawerHeader className="flex flex-row items-center justify-between">
          <DrawerTitle>מתנגן עכשיו</DrawerTitle>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setExpanded(false)}
            aria-label="מזער נגן"
          >
            <ChevronDown className="w-5 h-5" />
          </Button>
        </DrawerHeader>

        <div className="px-6 pb-8 flex flex-col items-center gap-5">
          {track?.image ? (
            <img src={track.image} alt="" className="w-56 h-56 rounded-xl object-cover shadow-lg" />
          ) : (
            <div className="w-56 h-56 rounded-xl bg-muted flex items-center justify-center">
              <Music className="w-16 h-16 text-muted-foreground" />
            </div>
          )}

          <div className="text-center w-full">
            <div className="text-lg font-semibold truncate text-foreground">
              {track?.name ?? "שום דבר לא מתנגן"}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {track?.artist ?? "הפעל שיר כדי להתחיל"}
            </div>
          </div>

          <div className="w-full space-y-1">
            <Slider
              value={[Math.min(position, duration || position)]}
              max={duration || 1}
              step={1000}
              onValueChange={handleSeek}
              aria-label="מיקום בשיר"
              disabled={!ready || !duration}
            />
            <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>{fmtTime(position)}</span>
              <span>{fmtTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              onClick={prev}
              aria-label="השיר הקודם"
              disabled={!ready}
              className="h-12 w-12"
            >
              <SkipBack className="w-6 h-6" />
            </Button>
            <Button
              size="icon"
              onClick={togglePlay}
              aria-label={paused ? "נגן" : "השהה"}
              disabled={!ready}
              className="h-16 w-16 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {paused ? <Play className="w-7 h-7" /> : <Pause className="w-7 h-7" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={next}
              aria-label="השיר הבא"
              disabled={!ready}
              className="h-12 w-12"
            >
              <SkipForward className="w-6 h-6" />
            </Button>
          </div>

          <div className="w-full flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
            <Slider
              value={[Math.round(volume * 100)]}
              max={100}
              step={1}
              onValueChange={handleVolume}
              aria-label="עוצמת שמע"
              disabled={!ready}
            />
          </div>

          <div className="w-full flex items-center justify-between pt-2 border-t border-border">
            <Button variant="ghost" size="sm" onClick={handleClaimDevice} disabled={!deviceId}>
              <Radio className="w-4 h-4 mr-2" />
              נגן במכשיר הזה
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDisconnect}>
              <LogOut className="w-4 h-4 mr-2" />
              התנתק
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
