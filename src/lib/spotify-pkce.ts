// Client-side PKCE helpers for Spotify Authorization Code flow.

function base64UrlEncode(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let str = "";
  for (let i = 0; i < arr.length; i++) str += String.fromCharCode(arr[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generateVerifier(length = 64): string {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let out = "";
  for (let i = 0; i < arr.length; i++) out += charset[arr[i] % charset.length];
  return out;
}

export async function challengeFromVerifier(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(digest);
}

export const SPOTIFY_SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
].join(" ");

export function getRedirectUri(): string {
  return `${window.location.origin}/spotify/callback`;
}

export async function beginSpotifyLogin(clientId: string): Promise<void> {
  if (!clientId) throw new Error("Missing Spotify client ID");
  const verifier = generateVerifier();
  const challenge = await challengeFromVerifier(verifier);
  sessionStorage.setItem("spotify_pkce_verifier", verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: getRedirectUri(),
    code_challenge_method: "S256",
    code_challenge: challenge,
    scope: SPOTIFY_SCOPES,
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}
