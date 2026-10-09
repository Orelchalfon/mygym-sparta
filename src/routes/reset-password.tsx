import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2, TriangleAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { authErrorMessage } from "@/components/auth/auth-errors";
import { DEFAULT_AFTER_AUTH } from "@/lib/auth-redirect";

// Lands here from the recovery email. Top-level on purpose: /auth would bounce the
// (now signed-in) user to /areas before they could choose a new password.
export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [{ title: "בחירת סיסמה חדשה — ספרטא" }, { name: "robots", content: "noindex" }],
  }),
  component: ResetPasswordPage,
});

type Status = "checking" | "ready" | "invalid";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Touching the (lazy) client initializes it, which reads the recovery token from
    // the URL hash and signs the user in for this one purpose.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setStatus("ready");
    });
    supabase.auth
      .getSession()
      .then(({ data }) => setStatus(data.session ? "ready" : "invalid"))
      .catch(() => setStatus("invalid"));
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(authErrorMessage(updateError));
      setLoading(false);
      return;
    }
    toast.success("הסיסמה עודכנה");
    navigate({ to: DEFAULT_AFTER_AUTH, replace: true });
  };

  if (status === "checking") {
    return (
      <AuthShell step={3}>
        <div role="status" className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          בודקים את הקישור...
        </div>
      </AuthShell>
    );
  }

  if (status === "invalid") {
    return (
      <AuthShell step={3}>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <TriangleAlert className="size-7" aria-hidden />
          </span>
          <h1 className="text-2xl font-bold text-foreground">הקישור לא תקף</h1>
          <p className="text-sm text-muted-foreground">
            ייתכן שפג תוקפו או שכבר השתמשו בו. בקשו קישור חדש לאיפוס הסיסמה.
          </p>
          <Button asChild size="touch" className="w-full">
            <Link to="/forgot-password">
              <KeyRound aria-hidden />
              שלחו לי קישור חדש
            </Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell step={3}>
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">בחירת סיסמה חדשה</h1>
          <p className="mt-1 text-sm text-muted-foreground">אחרי השמירה תיכנסו ישר לאימונים</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="reset-password">סיסמה חדשה</Label>
            <PasswordInput
              id="reset-password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              placeholder="לפחות 6 תווים"
              minLength={6}
              describedBy="reset-password-hint"
            />
            <p id="reset-password-hint" className="text-xs text-muted-foreground">
              לפחות 6 תווים
            </p>
          </div>
          <Button
            type="submit"
            size="touch"
            className="mt-2 w-full font-bold"
            disabled={loading || password.length < 6}
          >
            {loading ? <Loader2 className="animate-spin" aria-hidden /> : <KeyRound aria-hidden />}
            {loading ? "שומר..." : "שמירת סיסמה"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
