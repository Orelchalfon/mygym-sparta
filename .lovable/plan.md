## Plan

Open the secure secret-update form so you can paste your newly rotated Spotify Client Secret.

### What will happen

1. A secure input box will appear for `SPOTIFY_CLIENT_SECRET`.
2. You paste the new rotated value from the Spotify dashboard.
3. The secret is encrypted and made available to the server functions immediately — nothing is stored in chat or code.

### About the "users email"

I'm not sure what app field you mean by "users email" — there isn't one in the current Spotify flow (login uses OAuth, so no email input is needed). If you meant adding a tester email in the Spotify Developer Dashboard, that's done directly on Spotify's site under **Users and Access**, not in this app. If you meant something else (e.g. an email field somewhere in the UI), tell me where it should appear and I'll add it.

For now I'll just open the secret-update form for the rotated Client Secret.