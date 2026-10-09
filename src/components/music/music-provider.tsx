import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useServerFn } from "@tanstack/react-start";
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

export type TrackInfo = {
  name: string;
  artist: string;
  image?: string;
  duration: number;
};

export type MusicApp = "spotify" | "apple" | "youtube";

/** Apple Music / YouTube Music have no usable web playback API — universal links open the native app. */
const APP_URLS: Record<Exclude<MusicApp, "spotify">, string> = {
  apple: "https://music.apple.com/",
  youtube: "https://music.youtube.com/",
};

const APP_KEY = "music-app";

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

type MusicContextValue = {
  /** null while the Spotify connection check is in flight. */
  connected: boolean | null;
  ready: boolean;
  track: TrackInfo | null;
  paused: boolean;
  position: number;
  volume: number;
  deviceId: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (ms: number) => void;
  setVolume: (vol: number) => void;
  claimDevice: () => Promise<void>;
  /** Full-screen Spotify player drawer. */
  playerOpen: boolean;
  setPlayerOpen: (open: boolean) => void;
  /** The music app the user last picked; remembered on this device. */
  preferredApp: MusicApp | null;
  openMusicApp: (app: MusicApp) => void;
};

const MusicContext = createContext<MusicContextValue | undefined>(undefined);

/**
 * Owns the Spotify Web Playback SDK connection and the user's preferred music app,
 * so the desktop player bar and the mobile dock share one player.
 */
export function MusicProvider({ children }: { children: ReactNode }) {
  const getToken = useServerFn(getSpotifyAccessToken);
  const disconnectFn = useServerFn(disconnectSpotify);
  const transferPlayback = useServerFn(transferSpotifyPlayback);

  const [connected, setConnected] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [track, setTrack] = useState<TrackInfo | null>(null);
  const [paused, setPaused] = useState(true);
  const [position, setPosition] = useState(0);
  const [volume, setVolumeState] = useState(0.5);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [preferredApp, setPreferredApp] = useState<MusicApp | null>(null);
  const transferredRef = useRef(false);
  const playerRef = useRef<any>(null);
  const pausedRef = useRef(true);
  pausedRef.current = paused;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(APP_KEY);
      if (saved === "spotify" || saved === "apple" || saved === "youtube") setPreferredApp(saved);
    } catch {
      // Storage unavailable (private mode) — just don't remember.
    }
  }, []);

  const rememberApp = useCallback((app: MusicApp) => {
    setPreferredApp(app);
    try {
      localStorage.setItem(APP_KEY, app);
    } catch {
      // ignore
    }
  }, []);

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
        toast.error("החיבור לספוטיפיי פג — התחבר מחדש");
        setConnected(false);
      });
      player.addListener("account_error", ({ message }: any) => {
        console.error("Spotify account error:", message);
        toast.error("נדרש מנוי Spotify Premium");
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
        setPosition((p) => (pausedRef.current ? p : p + 500));
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
  }, [connected, getToken, transferPlayback]);

  const connect = useCallback(async () => {
    try {
      const { clientId } = await getSpotifyClientId();
      if (!clientId) throw new Error("Spotify not configured");
      await beginSpotifyLogin(clientId);
    } catch {
      toast.error("לא הצלחנו להתחבר לספוטיפיי. נסה שוב.");
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await disconnectFn();
      setConnected(false);
      setTrack(null);
      setPlayerOpen(false);
      toast.success("ספוטיפיי נותק");
    } catch {
      toast.error("הניתוק נכשל");
    }
  }, [disconnectFn]);

  const togglePlay = useCallback(() => playerRef.current?.togglePlay(), []);
  const next = useCallback(() => playerRef.current?.nextTrack(), []);
  const prev = useCallback(() => playerRef.current?.previousTrack(), []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    playerRef.current?.setVolume(vol);
  }, []);

  const seek = useCallback((pos: number) => {
    setPosition(pos);
    playerRef.current?.seek(pos);
  }, []);

  const claimDevice = useCallback(async () => {
    if (!deviceId) return;
    try {
      const res = await transferPlayback({
        data: { deviceId, play: !pausedRef.current },
      });
      if (res.ok) toast.success("מנגן במכשיר הזה");
      else toast.error("לא הצלחנו להעביר — הפעל שיר בספוטיפיי קודם");
    } catch {
      toast.error("החלפת המכשיר נכשלה");
    }
  }, [deviceId, transferPlayback]);

  const openMusicApp = useCallback(
    (app: MusicApp) => {
      rememberApp(app);
      if (app === "spotify") {
        if (connected) setPlayerOpen(true);
        else void connect();
        return;
      }
      window.open(APP_URLS[app], "_blank", "noopener");
    },
    [connected, connect, rememberApp],
  );

  return (
    <MusicContext.Provider
      value={{
        connected,
        ready,
        track,
        paused,
        position,
        volume,
        deviceId,
        connect,
        disconnect,
        togglePlay,
        next,
        prev,
        seek,
        setVolume,
        claimDevice,
        playerOpen,
        setPlayerOpen,
        preferredApp,
        openMusicApp,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used within MusicProvider");
  return ctx;
}
