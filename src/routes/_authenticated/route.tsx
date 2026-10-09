import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SpotifyPlayer } from "@/components/spotify-player";
import { MusicProvider } from "@/components/music/music-provider";
import { MobileDock } from "@/components/mobile-dock";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    let user = null;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error) user = data.user;
    } catch {
      // Treat a failed auth check as signed out.
    }
    // Keep the requested page (e.g. a machine's QR link) so sign-in can return to it.
    if (!user) throw redirect({ to: "/auth", search: { redirect: location.href } });
    return { user };
  },
  component: () => (
    <MusicProvider>
      {/* Mobile: room for the floating dock. Desktop: room for the Spotify bar. */}
      <div className="pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-[calc(72px+env(safe-area-inset-bottom))]">
        <Outlet />
      </div>
      <SpotifyPlayer />
      <MobileDock />
      <InstallPrompt />
    </MusicProvider>
  ),
});
