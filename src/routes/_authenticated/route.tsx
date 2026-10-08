import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SpotifyPlayer } from "@/components/spotify-player";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw redirect({ to: "/auth" });
      return { user: data.user };
    } catch {
      throw redirect({ to: "/auth" });
    }
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
