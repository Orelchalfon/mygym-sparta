## Add facility photos for machines 12, 13, 15

### What you'll get
- Facility cards & the exercise detail page show a real photo of the machine.
- Three new facilities created and seeded with the uploaded photos:
  - **מכשיר 12** — חזה (Hammer Strength chest press)
  - **מכשיר 13** — רגליים (leg press)
  - **מכשיר 15** — גב (Iron cable/functional trainer)
- The T-Row and black photos are skipped as requested.

### Steps
1. **Database** — add an `image_url text` column to `public.exercises` (nullable). No policy changes needed.
2. **Upload photos to CDN** via `lovable-assets` for the three matched images; save `.asset.json` pointers under `src/assets/facilities/`.
3. **Seed constants** — add machines 12, 13, 15 to `SEED_EXERCISES` in `src/lib/workout.constants.ts` with an `image_url` field pointing at the CDN URL, and update the `Exercise` type + `listExercises` seeder to include `image_url`.
4. **Backfill for existing users** — inside `listExercises`, if a matching row exists (by area + name) but has no `image_url`, patch it once with the seed URL so already-signed-in users see the photos too.
5. **UI** —
   - Facility list card (`areas.$areaId.index.tsx`): render `image_url` as a rounded thumbnail on the card (fallback to current emoji/number badge when null).
   - Exercise detail page (`areas.$areaId.exercise.$exerciseId.tsx`): show the photo at the top as a hero.
6. **Verify** — run build + take a Playwright screenshot of the גב and חזה area pages to confirm the images render.

### Technical notes
- Image field is a plain string column, no storage bucket needed.
- Photo → machine mapping is inferred from the number visible in each photo (12, 13, 15). If any of these facilities already exists under a different area, we keep the seed's area assignment (chest/legs/back).
