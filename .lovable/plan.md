# Spotify Player Overlay (Web Playback SDK)

A persistent player bar pinned to the bottom of all authenticated pages. Each user signs in with their own Spotify Premium account and can play/pause/skip any track from their library.

## What you'll see
- A slim bar fixed to the bottom of `/areas`, `/areas/$areaId`, and the active exercise page.
- When not connected: a "Connect Spotify" button.
- When connected: album art, track name, artist, play/pause, prev/next, and a disconnect button.
- During the rest timer, the bar stays visible so you can control music between sets.

## Spotify setup you'll need to do (one-time, ~5 min)
This requires **your own** Spotify developer credentials — Spotify doesn't allow shared app credentials for Web Playback, and each end user must have **Spotify Premium**.

1. Go to https://developer.spotify.com/dashboard → Create an app.
2. Add Redirect URI: `https://mygym-sparta.lovable.app/spotify/callback` (and the preview URL too).
3. Copy the **Client ID** and **Client Secret**.
4. I'll prompt for `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` via the secrets tool.

## Technical implementation

**Auth flow** — Spotify Authorization Code with PKCE, per user.
- New route `src/routes/spotify.callback.tsx` handles the OAuth redirect.
- Server functions in `src/lib/spotify.functions.ts`:
  - `exchangeSpotifyCode({ code, verifier })` — swap auth code for tokens.
  - `refreshSpotifyToken({ refreshToken })` — refresh on expiry.
- Tokens stored in a new table `user_spotify_tokens` (user_id, access_token, refresh_token, expires_at) with RLS so each user only reads their own row. Includes `GRANT`s for `authenticated` and `service_role`.

**Player** — `src/components/spotify-player.tsx`
- Loads the Spotify Web Playback SDK script (`https://sdk.scdn.co/spotify-player.js`).
- Initializes a `Spotify.Player` with the user's access token; auto-refreshes when the token expires.
- Renders the bottom bar UI using existing shadcn `Button` + `lucide-react` icons (Play, Pause, SkipBack, SkipForward).
- Polls `player.getCurrentState()` for track metadata and playback state.

**Mounting** — added to `src/routes/_authenticated/route.tsx` so it appears on every authenticated route. Bar height (~72px) added as bottom padding to the layout so it never covers content.

**RTL/styling** — uses existing dark theme tokens (`bg-card`, `border-border`, `text-foreground`), matches the orange `--primary` accent for the play button.

## Files to create
- `src/lib/spotify.functions.ts` — token exchange/refresh server fns
- `src/lib/spotify-pkce.ts` — PKCE verifier/challenge helpers (client)
- `src/components/spotify-player.tsx` — the overlay bar
- `src/routes/spotify.callback.tsx` — OAuth callback route
- `supabase/migrations/<ts>_user_spotify_tokens.sql` — token storage

## Files to edit
- `src/routes/_authenticated/route.tsx` — mount `<SpotifyPlayer />` and add bottom padding

## Limitations to know
- End users **must have Spotify Premium** — the Web Playback SDK refuses free accounts (Spotify rule, not ours).
- Works on desktop and mobile browsers, but iOS Safari has known SDK quirks; mobile users may need to tap once to start audio.
- You'll need to add each tester's Spotify email under "Users and Access" in your Spotify dashboard until the app is submitted for extension (Spotify's quota mode).
