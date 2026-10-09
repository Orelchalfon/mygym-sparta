import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SpotifyPlayer } from "@/components/spotify-player";
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
    <>
      <div className="pb-[calc(72px+env(safe-area-inset-bottom))]">
        <Outlet />
      </div>
      <SpotifyPlayer />
      <InstallPrompt />
    </>
  ),
});
