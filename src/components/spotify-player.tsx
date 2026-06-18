import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
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
import { toast } from "sonner";
import {
  getSpotifyAccessToken,
  disconnectSpotify,
  getSpotifyClientId,
  transferSpotifyPlayback,
} from "@/lib/spotify.functions";
import { beginSpotifyLogin } from "@/lib/spotify-pkce";

declare global {
  interface Window {
    Spotify?: any;
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

type TrackInfo = {
  name: string;
  artist: string;
  image?: string;
  duration: number;
};

let sdkPromise: Promise<void> | null = null;
function loadSpotifySDK(): Promise<void> {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<void>((resolve) => {
    if (typeof window === "undefined") return resolve();
    if (window.Spotify) return resolve();
    window.onSpotifyWebPlaybackSDKReady = () => resolve();
    const s = document.createElement("script");
    s.src = "https://sdk.scdn.co/spotify-player.js";
    s.async = true;
    document.body.appendChild(s);
  });
  return sdkPromise;
}

function fmtTime(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function SpotifyPlayer() {
  const getToken = useServerFn(getSpotifyAccessToken);
  const disconnect = useServerFn(disconnectSpotify);
  const transferPlayback = useServerFn(transferSpotifyPlayback);

  const [connected, setConnected] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [track, setTrack] = useState<TrackInfo | null>(null);
  const [paused, setPaused] = useState(true);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [expanded, setExpanded] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const transferredRef = useRef(false);
  const playerRef = useRef<any>(null);

  // Check connection status on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { accessToken } = await getToken();
        if (cancelled) return;
        setConnected(!!accessToken);
      } catch {
        if (!cancelled) setConnected(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  // Initialize SDK when connected.
  useEffect(() => {
    if (!connected) return;
    let disposed = false;
    let poll: ReturnType<typeof setInterval> | null = null;
    let tick: ReturnType<typeof setInterval> | null = null;

    (async () => {
      await loadSpotifySDK();
      if (disposed || !window.Spotify) return;

      const player = new window.Spotify.Player({
        name: "Workout Buddy",
        getOAuthToken: async (cb: (t: string) => void) => {
          try {
            const { accessToken } = await getToken();
            if (accessToken) cb(accessToken);
          } catch (e) {
            console.error("Spotify token fetch failed", e);
          }
        },
        volume: 0.5,
      });

      player.addListener("ready", async ({ device_id }: any) => {
        if (disposed) return;
        setReady(true);
        setDeviceId(device_id);
        if (!transferredRef.current) {
          transferredRef.current = true;
          try {
            await transferPlayback({
              data: { deviceId: device_id, play: false },
            });
          } catch (e) {
            console.error("Transfer playback failed", e);
          }
        }
      });
      player.addListener("not_ready", () => setReady(false));
      player.addListener("initialization_error", ({ message }: any) =>
        console.error("Spotify init error:", message),
      );
      player.addListener("authentication_error", ({ message }: any) => {
        console.error("Spotify auth error:", message);
        toast.error("Spotify auth expired — please reconnect");
        setConnected(false);
      });
      player.addListener("account_error", ({ message }: any) => {
        console.error("Spotify account error:", message);
        toast.error("Spotify Premium is required");
      });
      player.addListener("player_state_changed", (state: any) => {
        if (!state) return;
        const t = state.track_window?.current_track;
        if (t) {
          setTrack({
            name: t.name,
            artist: t.artists?.map((a: any) => a.name).join(", ") ?? "",
            image: t.album?.images?.[0]?.url,
            duration: state.duration ?? t.duration_ms ?? 0,
          });
        }
        setPaused(state.paused);
        setPosition(state.position ?? 0);
      });

      await player.connect();
      playerRef.current = player;

      poll = setInterval(async () => {
        const state = await player.getCurrentState();
        if (!state) return;
        setPaused(state.paused);
        setPosition(state.position ?? 0);
      }, 3000);

      tick = setInterval(() => {
        setPosition((p) => (paused ? p : p + 500));
      }, 500);
    })();

    return () => {
      disposed = true;
      if (poll) clearInterval(poll);
      if (tick) clearInterval(tick);
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, getToken, transferPlayback]);

  const handleConnect = async () => {
    try {
      const { clientId } = await getSpotifyClientId();
      if (!clientId) throw new Error("Spotify not configured");
      await beginSpotifyLogin(clientId);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to start Spotify login");
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setConnected(false);
      setTrack(null);
      setExpanded(false);
      toast.success("Spotify disconnected");
    } catch {
      toast.error("Failed to disconnect");
    }
  };

  const togglePlay = () => playerRef.current?.togglePlay();
  const next = () => playerRef.current?.nextTrack();
  const prev = () => playerRef.current?.previousTrack();

  const handleVolume = useCallback((v: number[]) => {
    const vol = (v[0] ?? 0) / 100;
    setVolume(vol);
    playerRef.current?.setVolume(vol);
  }, []);

  const handleSeek = useCallback((v: number[]) => {
    const pos = v[0] ?? 0;
    setPosition(pos);
    playerRef.current?.seek(pos);
  }, []);

  const handleClaimDevice = async () => {
    if (!deviceId) return;
    try {
      const res = await transferPlayback({
        data: { deviceId, play: !paused },
      });
      if (res.ok) toast.success("Playback on this device");
      else toast.error("Couldn't take over — start a track in Spotify first");
    } catch {
      toast.error("Failed to switch device");
    }
  };

  if (connected === null) return null;

  if (!connected) {
    return (
      <div
        dir="ltr"
        className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
      >
        <div className="mx-auto flex h-[72px] max-w-3xl items-center justify-center px-3">
          <Button
            onClick={handleConnect}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-black"
          >
            <Music className="w-4 h-4 mr-2" />
            Connect Spotify
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
        className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
      >
        <div className="mx-auto flex h-[72px] max-w-3xl items-center gap-3 px-3">
          <DrawerTrigger asChild>
            <button
              className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer hover:opacity-90"
              aria-label="Expand player"
            >
              {track?.image ? (
                <img
                  src={track.image}
                  alt=""
                  className="w-12 h-12 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                  <Music className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate text-foreground">
                  {track?.name ?? (ready ? "Ready — tap to expand" : "Connecting…")}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {track?.artist ?? (ready ? "Workout Buddy" : "")}
                </div>
              </div>
              <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          </DrawerTrigger>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={prev} disabled={!ready}>
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              onClick={togglePlay}
              disabled={!ready}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={next} disabled={!ready}>
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <DrawerContent dir="ltr">
        <DrawerHeader className="flex flex-row items-center justify-between">
          <DrawerTitle>Now Playing</DrawerTitle>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setExpanded(false)}
            aria-label="Collapse"
          >
            <ChevronDown className="w-5 h-5" />
          </Button>
        </DrawerHeader>

        <div className="px-6 pb-8 flex flex-col items-center gap-5">
          {track?.image ? (
            <img
              src={track.image}
              alt=""
              className="w-56 h-56 rounded-xl object-cover shadow-lg"
            />
          ) : (
            <div className="w-56 h-56 rounded-xl bg-muted flex items-center justify-center">
              <Music className="w-16 h-16 text-muted-foreground" />
            </div>
          )}

          <div className="text-center w-full">
            <div className="text-lg font-semibold truncate text-foreground">
              {track?.name ?? "Nothing playing"}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {track?.artist ?? "Start a track to begin"}
            </div>
          </div>

          <div className="w-full space-y-1">
            <Slider
              value={[Math.min(position, duration || position)]}
              max={duration || 1}
              step={1000}
              onValueChange={handleSeek}
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
              disabled={!ready}
              className="h-12 w-12"
            >
              <SkipBack className="w-6 h-6" />
            </Button>
            <Button
              size="icon"
              onClick={togglePlay}
              disabled={!ready}
              className="h-16 w-16 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {paused ? <Play className="w-7 h-7" /> : <Pause className="w-7 h-7" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={next}
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
              disabled={!ready}
            />
          </div>

          <div className="w-full flex items-center justify-between pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClaimDevice}
              disabled={!deviceId}
            >
              <Radio className="w-4 h-4 mr-2" />
              Play on this device
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDisconnect}>
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
