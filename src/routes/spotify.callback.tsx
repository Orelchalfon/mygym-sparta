import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { exchangeSpotifyCode } from "@/lib/spotify.functions";
import { getRedirectUri } from "@/lib/spotify-pkce";

export const Route = createFileRoute("/spotify/callback")({
  ssr: false,
  component: SpotifyCallback,
});

function SpotifyCallback() {
  const navigate = useNavigate();
  const exchange = useServerFn(exchangeSpotifyCode);
  const [status, setStatus] = useState("Connecting to Spotify…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    const verifier = sessionStorage.getItem("spotify_pkce_verifier");

    if (error) {
      setStatus(`Spotify error: ${error}`);
      setTimeout(() => navigate({ to: "/areas" }), 1500);
      return;
    }
    if (!code || !verifier) {
      setStatus("Missing authorization code");
      setTimeout(() => navigate({ to: "/areas" }), 1500);
      return;
    }

    exchange({
      data: { code, verifier, redirectUri: getRedirectUri() },
    })
      .then(() => {
        sessionStorage.removeItem("spotify_pkce_verifier");
        setStatus("Connected! Redirecting…");
        navigate({ to: "/areas" });
      })
      .catch((e) => {
        console.error(e);
        setStatus("Failed to connect Spotify");
        setTimeout(() => navigate({ to: "/areas" }), 2000);
      });
  }, [exchange, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-foreground">{status}</p>
    </div>
  );
}
