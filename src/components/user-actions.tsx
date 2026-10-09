import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { History, LogOut, Moon, Settings, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

type Profile = { name: string; email: string };

function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => {
        const u = data.user;
        if (!u) return;
        const meta = u.user_metadata as { full_name?: string } | undefined;
        const email = u.email ?? "";
        setProfile({ name: meta?.full_name || email.split("@")[0] || "", email });
      })
      .catch(() => {});
  }, []);
  return profile;
}

const item =
  "min-h-11 cursor-pointer gap-3 rounded-lg px-3 text-[15px] font-medium [&_svg]:size-5 [&_svg]:shrink-0";

/**
 * Profile menu for the app header: one avatar button that opens, top to bottom,
 * profile → history → settings → theme → sign out. Sign-out sits last, after a divider,
 * in the destructive color so it's never hit by accident.
 */
export function UserActions() {
  const profile = useProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const initial = profile?.name.trim().charAt(0).toUpperCase() || "?";

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-touch"
          aria-label={profile ? `תפריט פרופיל: ${profile.name}` : "תפריט פרופיל"}
          className="rounded-full"
        >
          <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-black text-primary-foreground ring-2 ring-background">
            {initial}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-72 rounded-2xl p-2">
        {/* Profile */}
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-lg font-black text-primary-foreground">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-bold">{profile?.name || "—"}</div>
            {profile?.email && (
              <div dir="ltr" className="truncate text-end text-sm text-muted-foreground">
                {profile.email}
              </div>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem className={item} onSelect={() => navigate({ to: "/history" })}>
          <History aria-hidden />
          היסטוריית אימונים
        </DropdownMenuItem>

        {/* Settings — no page yet; shown (not hidden) so it's clear it's coming. */}
        <DropdownMenuItem disabled className={item}>
          <Settings aria-hidden />
          הגדרות
          <span className="ms-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            בקרוב
          </span>
        </DropdownMenuItem>

        {/* Theme — toggles in place; the menu stays open so the change is visible. */}
        <DropdownMenuItem
          role="menuitemcheckbox"
          aria-checked={isDark}
          className={item}
          onSelect={(e) => {
            e.preventDefault();
            setTheme(isDark ? "light" : "dark");
          }}
        >
          {isDark ? <Moon aria-hidden /> : <Sun aria-hidden />}
          מצב כהה
          <span
            aria-hidden
            className={cn(
              "ms-auto flex h-6 w-11 items-center rounded-full p-0.5 transition-colors duration-200",
              isDark ? "bg-primary" : "bg-input",
            )}
          >
            <span
              className={cn(
                "size-5 rounded-full bg-white shadow transition-transform duration-200",
                // RTL: "on" moves the knob toward the inline end (left).
                isDark ? "-translate-x-5" : "translate-x-0",
              )}
            />
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          onSelect={signOut}
          className={cn(item, "text-destructive focus:bg-destructive/10 focus:text-destructive")}
        >
          <LogOut aria-hidden className="rtl:-scale-x-100" />
          התנתקות
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
