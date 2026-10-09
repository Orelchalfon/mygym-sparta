import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowRight, Check, KeyRound, Loader2, Mail, RotateCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { authErrorMessage } from "@/components/auth/auth-errors";

// Supabase rate-limits recovery emails per address (~60 s); the resend button waits it out.
const RESEND_COOLDOWN_S = 60;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(initialEmail);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const trimmed = email.trim();
  // Validate on blur (not per keystroke); after that, re-check as the user fixes it.
  const formatError =
    touched && trimmed && !EMAIL_RE.test(trimmed) ? "כתובת האימייל לא נראית תקינה" : "";
  const fieldError = formatError || error;

  const sendLink = async () => {
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: new URL("/reset-password", window.location.origin).toString(),
    });
    if (resetError) {
      const rateLimited = resetError.status === 429;
      if (rateLimited) setCooldown(RESEND_COOLDOWN_S);
      return authErrorMessage(resetError);
    }
    setCooldown(RESEND_COOLDOWN_S);
    return "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setTouched(true);
    if (!EMAIL_RE.test(trimmed)) {
      inputRef.current?.focus();
      return;
    }
    setError("");
    setLoading(true);
    const message = await sendLink();
    setLoading(false);
    if (message) {
      setError(message);
      inputRef.current?.focus();
      return;
    }
    // Same screen whether or not the address is registered — never reveal accounts.
    setSent(true);
  };

  const handleResend = async () => {
    if (loading || cooldown > 0) return;
    setLoading(true);
    const message = await sendLink();
    setLoading(false);
    if (message) toast.error(message);
    else toast.success("שלחנו שוב את הקישור");
  };

  if (sent) {
    return (
      <AuthShell step={2}>
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="relative flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Mail className="size-8" aria-hidden />
            <span className="absolute -end-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground ring-4 ring-card animate-in zoom-in-50 [animation-duration:300ms]">
              <Check className="size-3.5" aria-hidden />
            </span>
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">בדקו את המייל</h1>
            <p role="status" className="mt-2 text-base leading-relaxed text-muted-foreground">
              אם יש חשבון עם הכתובת
              <br />
              <span dir="ltr" className="font-semibold break-all text-foreground">
                {trimmed}
              </span>
              <br />
              שלחנו אליו קישור לבחירת סיסמה חדשה.
            </p>
          </div>

          <ul className="w-full rounded-2xl bg-muted/60 p-4 text-start text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span aria-hidden className="text-primary">
                •
              </span>
              לא רואים? בדקו בתיקיית הספאם או בקידומי מכירות.
            </li>
            <li className="mt-1.5 flex gap-2">
              <span aria-hidden className="text-primary">
                •
              </span>
              הקישור תקף לזמן קצר ולשימוש אחד.
            </li>
          </ul>

          <div className="flex w-full flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="touch"
              className="w-full"
              onClick={handleResend}
              disabled={loading || cooldown > 0}
            >
              {loading ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : (
                <RotateCw aria-hidden />
              )}
              {loading ? (
                "שולח..."
              ) : cooldown > 0 ? (
                <>
                  שלחו שוב בעוד <span className="tabular-nums">{cooldown}</span> שניות
                </>
              ) : (
                "שלחו שוב"
              )}
            </Button>
            <Button
              type="button"
              variant="link"
              className="h-11"
              onClick={() => {
                setSent(false);
                setCooldown(0);
                requestAnimationFrame(() => inputRef.current?.select());
              }}
            >
              טעיתי בכתובת
            </Button>
          </div>

          <BackToSignIn />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell step={1}>
      <div className="flex flex-col gap-7">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[0_0_0_8px] shadow-primary/5">
            <KeyRound className="size-8" aria-hidden />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-foreground">שכחתם סיסמה?</h1>
          <p className="mt-2 max-w-xs text-base leading-relaxed text-muted-foreground">
            קורה לכולם. הזינו את האימייל ונשלח קישור לבחירת סיסמה חדשה.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="forgot-email">אימייל</Label>
            <div className="relative">
              <Input
                ref={inputRef}
                id="forgot-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                onBlur={() => setTouched(true)}
                placeholder="you@example.com"
                required
                autoFocus
                dir="ltr"
                aria-invalid={!!fieldError || undefined}
                aria-describedby={fieldError ? "forgot-email-error" : "forgot-email-hint"}
                // Same LTR-input/RTL-wrapper slot as the sign-in form.
                className="h-12 ps-12 text-base"
              />
              <Mail
                className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
            </div>
            {fieldError ? (
              <p id="forgot-email-error" role="alert" className="text-sm text-destructive">
                {fieldError}
              </p>
            ) : (
              <p id="forgot-email-hint" className="text-xs text-muted-foreground">
                הכתובת שאיתה נרשמתם לספרטא
              </p>
            )}
          </div>

          <Button type="submit" size="touch" className="w-full font-bold" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" aria-hidden /> : <Mail aria-hidden />}
            {loading ? "שולח..." : "שלחו לי קישור"}
          </Button>
        </form>

        <BackToSignIn />
      </div>
    </AuthShell>
  );
}

function BackToSignIn() {
  return (
    <Link
      to="/auth"
      className="mx-auto flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Points "back" in RTL (toward the inline start). */}
      <ArrowRight className="size-4" aria-hidden />
      חזרה להתחברות
    </Link>
  );
}
