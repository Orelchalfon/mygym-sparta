I’ll fix the current header implementation instead of replacing the whole site.

Plan:
1. Update `src/components/ui/header-2.tsx` so the header matches the intended animation more closely:
   - Keep the mobile menu height animation, but add opacity/translate transitions so it visibly slides/fades open and closed.
   - Ensure the hamburger `MenuToggleIcon` remains wired to the open state.
   - Add `aria-expanded`/state styling for clearer behavior.
2. Fix top-of-page contrast in light mode:
   - When the header is transparent over the dark hero image, force header brand, nav links, menu icon, and ghost buttons to use a high-contrast light-on-dark style.
   - Once scrolled or mobile menu is open, switch back to normal theme foreground/background colors.
3. Preserve dashboard behavior:
   - Dashboard header will keep normal themed contrast because it sits over the app background, not the hero image.
   - I’ll add a prop such as `transparentOnTop` and enable it only on the landing page.
4. Remove hardcoded button colors introduced around the header actions where possible and use semantic/theme-safe classes or existing button variants, while keeping the red Sparta CTA look.
5. Validate in preview on desktop and mobile:
   - Light mode top of landing page: nav links visible.
   - Scrolled header: background/blur visible and readable.
   - Mobile menu: animated open/close with readable links and actions.