import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Play, Pause, SkipBack, SkipForward, LogOut, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getSpotifyAccessToken,
  disconnectSpotify,
  getSpotifyClientId,
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

export function SpotifyPlayer() {
  const getToken = useServerFn(getSpotifyAccessToken);
  const disconnect = useServerFn(disconnectSpotify);

  const [connected, setConnected] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [track, setTrack] = useState<TrackInfo | null>(null);
  const [paused, setPaused] = useState(true);
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

      player.addListener("ready", () => {
        if (disposed) return;
        setReady(true);
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
          });
        }
        setPaused(state.paused);
      });

      await player.connect();
      playerRef.current = player;

      poll = setInterval(async () => {
        const state = await player.getCurrentState();
        if (!state) return;
        setPaused(state.paused);
      }, 2000);
    })();

    return () => {
      disposed = true;
      if (poll) clearInterval(poll);
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
      setReady(false);
    };
  }, [connected, getToken]);

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
      toast.success("Spotify disconnected");
    } catch {
      toast.error("Failed to disconnect");
    }
  };

  const togglePlay = () => playerRef.current?.togglePlay();
  const next = () => playerRef.current?.nextTrack();
  const prev = () => playerRef.current?.previousTrack();

  if (connected === null) return null;

  return (
    <div
      dir="ltr"
      className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
    >
      <div className="mx-auto flex h-[72px] max-w-3xl items-center gap-3 px-3">
        {!connected ? (
          <Button
            onClick={handleConnect}
            className="ml-auto mr-auto bg-[#1DB954] hover:bg-[#1ed760] text-black"
          >
            <Music className="w-4 h-4 mr-2" />
            Connect Spotify
          </Button>
        ) : (
          <>
            <div className="flex items-center gap-3 min-w-0 flex-1">
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
              <div className="min-w-0">
                <div className="text-sm font-medium truncate text-foreground">
                  {track?.name ?? (ready ? "Ready — play from Spotify app" : "Connecting…")}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {track?.artist ?? (ready ? "Select 'Workout Buddy' as device" : "")}
                </div>
              </div>
            </div>
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
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDisconnect}
                title="Disconnect Spotify"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
