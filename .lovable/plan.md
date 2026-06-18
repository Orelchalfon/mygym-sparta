## Why play does nothing right now

The Web Playback SDK registers a new device called "Workout Buddy" in your browser, but it does **not** automatically become the active device. When you hit play with no active context and no track queued on that device, Spotify has nothing to play — so silence.

Two fixes are needed:

1. **Auto-transfer playback** to the Workout Buddy device as soon as the SDK is ready, using Spotify's Web API (`PUT /me/player` with `device_ids: [deviceId]`).
2. If nothing is currently playing on the account, the play button should **start something** — either resume the user's last context or start a default (we'll resume; if no context exists, surface a hint to pick something in Spotify or in the new expanded view).

We'll capture `device_id` from the SDK `ready` event and call transfer automatically once. After that, the play/pause/skip buttons control playback on this tab directly.

## Expanded player

Tap the mini-player (or a chevron) to expand into a bottom sheet with:

- Large album artwork
- Track name + artist (larger)
- Progress bar with current / total time (updated from `player_state_changed` + interval)
- Volume slider (uses `player.setVolume`)
- Prev / Play-Pause / Next (bigger)
- A "Play on this device" button (manual re-transfer, useful if user switched devices in Spotify app)
- Disconnect button
- Collapse handle

Mini-player stays as the collapsed state (same height as today, 72px). Expansion uses a Sheet/Drawer from the bottom; the rest of the app remains scrollable behind a backdrop.

## Files to change

- `src/components/spotify-player.tsx` — keep current mini layout; add expanded `Drawer` (shadcn) state, capture `device_id`, auto-call new `transferPlaybackToDevice` server fn on ready, wire progress/volume.
- `src/lib/spotify.functions.ts` — add `transferSpotifyPlayback({ deviceId, play })` server fn that calls `PUT https://api.spotify.com/v1/me/player` with the user's access token.

No DB / schema changes. No new secrets.

## Technical notes

- Transfer call: `fetch('https://api.spotify.com/v1/me/player', { method: 'PUT', headers: { Authorization: Bearer <token>, 'Content-Type': 'application/json' }, body: JSON.stringify({ device_ids: [deviceId], play: false }) })`. 204 = success, 404 = device not found yet (retry once after short delay).
- Only auto-transfer once per session to avoid stealing playback if the user intentionally switches devices.
- Progress: read `state.position` / `state.duration` from `player_state_changed`, then tick locally every 500ms while not paused.
- Volume: `player.getVolume()` / `player.setVolume(0..1)`.
- RTL: keep `dir="ltr"` on the player container as today so controls don't flip.

## Out of scope

- Search / playlist browsing inside the app (can be added later).
- Playing a hard-coded default playlist when account has no context.
