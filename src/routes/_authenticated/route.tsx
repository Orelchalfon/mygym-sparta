import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SpotifyPlayer } from "@/components/spotify-player";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => (
    <>
      <div className="pb-[72px]">
        <Outlet />
      </div>
      <SpotifyPlayer />
      <InstallPrompt />
    </>
  ),
});
