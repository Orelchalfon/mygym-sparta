# Spotify Player Overlay (Web Playback SDK)

A persistent player bar pinned to the bottom of all authenticated pages. Each user signs in with their own Spotify Premium account and can play/pause/skip any track from their library.

## What you'll see
- A slim bar fixed to the bottom of `/areas`, `/areas/$areaId`, and the active exercise page.
- When not connected: a "Connect Spotify" button.
- When connected: album art, track name, artist, play/pause, prev/next, and a disconnect button.
- During the rest timer, the bar stays visible so you can control music between sets.

## Status of prerequisites
- `user_spotify_tokens` table — already created with RLS.
- `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` — already saved as secrets.
- Redirect URIs registered in your Spotify app — done.

## Technical implementation

**Auth flow** — Spotify Authorization Code with PKCE, per user.
- New route `src/routes/spotify.callback.tsx` handles the OAuth redirect, calls the server fn, then navigates back to `/areas`.
- Server functions in `src/lib/spotify.functions.ts` (auth-gated with `requireSupabaseAuth`):
  - `exchangeSpotifyCode({ code, verifier, redirectUri })` — swap auth code for tokens, store in DB.
  - `getSpotifyAccessToken()` — returns a fresh access token, auto-refreshing if expired.
  - `disconnectSpotify()` — deletes the user's row.
- `src/lib/spotify-pkce.ts` — client-side PKCE verifier/challenge helpers (Web Crypto).

**Player** — `src/components/spotify-player.tsx`
- Loads the Spotify Web Playback SDK script (`https://sdk.scdn.co/spotify-player.js`).
- Initializes `Spotify.Player` with a callback that calls `getSpotifyAccessToken` on demand (handles refresh automatically).
- Polls `player.getCurrentState()` every 1s for track metadata and playback state.
- Renders the bottom bar with shadcn `Button` + lucide icons (Play, Pause, SkipBack, SkipForward, LogOut).
- Uses semantic tokens (`bg-card`, `border-border`, `text-foreground`) with the orange `--primary` accent.

**Mounting** — added to `src/routes/_authenticated/route.tsx`. Bar height (~72px) added as bottom padding to the layout so it never covers content.

## Files to create
- `src/lib/spotify.functions.ts`
- `src/lib/spotify-pkce.ts`
- `src/components/spotify-player.tsx`
- `src/routes/spotify.callback.tsx`

## Files to edit
- `src/routes/_authenticated/route.tsx` — mount `<SpotifyPlayer />`, add bottom padding, render `<Outlet />`.

## Limitations to know
- Each end user **must have Spotify Premium** — the Web Playback SDK refuses free accounts.
- While your Spotify app is in "development mode", you must add each tester's Spotify email under **Users and Access** in your Spotify dashboard.
- iOS Safari requires one user tap to unlock audio.

## Security note
Rotate the Client Secret you pasted in chat before going live — see message above.