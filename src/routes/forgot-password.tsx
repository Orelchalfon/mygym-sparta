import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { KeyRound, Loader2, LogIn, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { authErrorMessage } from "@/components/auth/auth-errors";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{ title: "שכחתי סיסמה — ספרטא" }, { name: "robots", content: "noindex" }],
  }),
  validateSearch: (search: Record<string, unknown>): { email?: string } => ({
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { email: initialEmail = "" } = Route.useSearch();
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: new URL("/reset-password", window.location.origin).toString(),
    });
    setLoading(false);
    if (resetError) {
      setError(authErrorMessage(resetError));
      return;
    }
    // Same message whether or not the address is registered — never reveal accounts.
    setSent(true);
  };

  if (sent) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Mail className="size-7" aria-hidden />
          </span>
          <h1 className="text-2xl font-bold text-foreground">בדקו את המייל</h1>
          <p role="status" className="text-sm text-muted-foreground">
            אם קיים חשבון עם הכתובת{" "}
            <span dir="ltr" className="font-medium text-foreground">
              {email.trim()}
            </span>
            , שלחנו אליו קישור לאיפוס הסיסמה.
          </p>
          <p className="text-sm text-muted-foreground">לא רואים את המייל? בדקו בתיקיית הספאם.</p>
          <Button asChild variant="outline" size="touch" className="w-full">
            <Link to="/auth">
              <LogIn aria-hidden />
              חזרה להתחברות
            </Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">שכחתי סיסמה</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            הזינו את האימייל שלכם ונשלח קישור לבחירת סיסמה חדשה
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="forgot-email">אימייל</Label>
            <div className="relative">
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                dir="ltr"
                className="h-11 ps-12"
              />
              <Mail
                className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
            </div>
          </div>
          <Button
            type="submit"
            size="touch"
            className="mt-2 w-full font-bold"
            disabled={loading || !email.trim()}
          >
            {loading ? <Loader2 className="animate-spin" aria-hidden /> : <KeyRound aria-hidden />}
            {loading ? "שולח..." : "שלחו לי קישור"}
          </Button>
          <Button asChild variant="link" className="h-11">
            <Link to="/auth">חזרה להתחברות</Link>
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
