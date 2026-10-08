import { useNavigate } from "@tanstack/react-router";
import { useRef, useState, type FormEvent, type RefObject } from "react";
import { Loader2, LogIn, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { authErrorMessage } from "@/components/auth/auth-errors";

interface SignInFormProps {
  /** Shared with the sign-up form so the address survives a mode switch. */
  email: string;
  onEmailChange: (email: string) => void;
  /** First field, focused by AuthSwitch after the user switches into this mode. */
  firstFieldRef?: RefObject<HTMLInputElement | null>;
}

export function SignInForm({ email, onEmailChange, firstFieldRef }: SignInFormProps) {
  const navigate = useNavigate();
  const passwordRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(authErrorMessage(error));
      setLoading(false);
      requestAnimationFrame(() => passwordRef.current?.focus());
      return;
    }

    navigate({ to: "/areas" });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">התחברות</h1>
        <p className="mt-1 text-sm text-muted-foreground">הכנסו לחשבון ספרטא שלכם</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="signin-email">אימייל</Label>
          <div className="relative">
            <Input
              ref={firstFieldRef}
              id="signin-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="you@example.com"
              required
              dir="ltr"
              aria-invalid={!!error || undefined}
              aria-describedby={error ? "signin-error" : undefined}
              // Same LTR-input/RTL-wrapper slot as PasswordInput so the two fields' text aligns.
              className="h-11 ps-12 transition-[padding,color,box-shadow]"
            />
            <Mail
              className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="signin-password">סיסמה</Label>
          <PasswordInput
            inputRef={passwordRef}
            id="signin-password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            invalid={!!error}
            describedBy={error ? "signin-error" : undefined}
          />
          {error && (
            <p id="signin-error" role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <Button type="submit" size="touch" className="mt-2 w-full font-bold" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" aria-hidden /> : <LogIn aria-hidden />}
          {loading ? "מתחבר..." : "התחברות"}
        </Button>
      </form>
    </div>
  );
}
