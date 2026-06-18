import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getSpotifyClientId = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    return { clientId: process.env.SPOTIFY_CLIENT_ID ?? null };
  });

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  token_type?: string;
};

function expiresAtIso(expiresInSec: number): string {
  // Refresh 60s early
  return new Date(Date.now() + (expiresInSec - 60) * 1000).toISOString();
}

export const exchangeSpotifyCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { code: string; verifier: string; redirectUri: string }) => data,
  )
  .handler(async ({ data, context }) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("Spotify credentials not configured");
    }

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code: data.code,
      redirect_uri: data.redirectUri,
      client_id: clientId,
      code_verifier: data.verifier,
    });

    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Spotify token exchange failed", res.status, text);
      throw new Error(`Spotify token exchange failed: ${res.status}`);
    }

    const tokens = (await res.json()) as TokenResponse;
    if (!tokens.refresh_token) {
      throw new Error("Spotify did not return a refresh token");
    }

    const { error } = await context.supabase
      .from("user_spotify_tokens")
      .upsert({
        user_id: context.userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAtIso(tokens.expires_in),
        scope: tokens.scope ?? null,
      });

    if (error) {
      console.error("Failed to store Spotify tokens", error);
      throw new Error("Failed to store Spotify tokens");
    }

    return { ok: true };
  });

export const getSpotifyAccessToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: row, error } = await context.supabase
      .from("user_spotify_tokens")
      .select("access_token, refresh_token, expires_at")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!row) return { accessToken: null as string | null };

    const expiresAt = new Date(row.expires_at).getTime();
    if (expiresAt > Date.now()) {
      return { accessToken: row.access_token };
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("Spotify credentials not configured");
    }

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: row.refresh_token,
      client_id: clientId,
    });

    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Spotify token refresh failed", res.status, text);
      // Token likely revoked — delete row so user can reconnect.
      await context.supabase
        .from("user_spotify_tokens")
        .delete()
        .eq("user_id", context.userId);
      return { accessToken: null as string | null };
    }

    const tokens = (await res.json()) as TokenResponse;
    const newRefresh = tokens.refresh_token ?? row.refresh_token;

    await context.supabase
      .from("user_spotify_tokens")
      .update({
        access_token: tokens.access_token,
        refresh_token: newRefresh,
        expires_at: expiresAtIso(tokens.expires_in),
        scope: tokens.scope ?? null,
      })
      .eq("user_id", context.userId);

    return { accessToken: tokens.access_token };
  });

export const transferSpotifyPlayback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { deviceId: string; play?: boolean }) => data)
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("user_spotify_tokens")
      .select("access_token")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row?.access_token) throw new Error("Not connected to Spotify");

    const res = await fetch("https://api.spotify.com/v1/me/player", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${row.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device_ids: [data.deviceId],
        play: data.play ?? false,
      }),
    });

    if (!res.ok && res.status !== 204) {
      const text = await res.text();
      console.error("Spotify transfer failed", res.status, text);
      return { ok: false, status: res.status };
    }
    return { ok: true, status: res.status };
  });

export const disconnectSpotify = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("user_spotify_tokens")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
