import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, LogIn, UserPlus, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "כניסה — כושר" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/areas" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "up") {
        if (!fullName.trim()) {
          toast.error("אנא הזן את שמך המלא");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        toast.success("נרשמת בהצלחה! ברוך הבא 💪");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/areas" });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const isSignUp = mode === "up";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background relative overflow-hidden">
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 right-10 size-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Dumbbell className="size-7" />
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight">אימון אישי</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            עקוב, בצע ושפר את האימונים שלך
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-2xl backdrop-blur sm:p-8">
          {/* Mode tabs */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1">
            <button
              type="button"
              onClick={() => setMode("in")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all ${
                !isSignUp
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LogIn className="size-4" />
              התחברות
            </button>
            <button
              type="button"
              onClick={() => setMode("up")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all ${
                isSignUp
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="size-4" />
              הרשמה
            </button>
          </div>

          <div className="mb-5">
            <h2 className="text-xl font-bold">
              {isSignUp ? "יצירת חשבון חדש" : "ברוך שובך"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isSignUp
                ? "מלא את הפרטים כדי להתחיל להתאמן"
                : "הזן את פרטי הכניסה שלך כדי להמשיך"}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {isSignUp && (
              <FieldRow icon={<User className="size-4" />} htmlFor="fullName" label="שם מלא">
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ישראל ישראלי"
                  required
                  autoComplete="name"
                  maxLength={60}
                  className="ps-10"
                />
              </FieldRow>
            )}
            <FieldRow icon={<Mail className="size-4" />} htmlFor="email" label="אימייל">
              <Input
                id="email"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="ps-10"
              />
            </FieldRow>
            <FieldRow icon={<Lock className="size-4" />} htmlFor="password" label="סיסמה">
              <Input
                id="password"
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? "לפחות 6 תווים" : "הסיסמה שלך"}
                required
                minLength={6}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className="ps-10"
              />
            </FieldRow>

            <Button
              type="submit"
              className="h-12 w-full text-base font-bold shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading
                ? "..."
                : isSignUp
                ? "צור חשבון והתחל להתאמן"
                : "התחבר לחשבון שלי"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {isSignUp ? "כבר יש לך חשבון?" : "אין לך חשבון עדיין?"}{" "}
            <button
              onClick={() => setMode(isSignUp ? "in" : "up")}
              className="font-bold text-primary hover:underline"
            >
              {isSignUp ? "התחבר כאן" : "הירשם עכשיו"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function FieldRow({
  icon,
  htmlFor,
  label,
  children,
}: {
  icon: React.ReactNode;
  htmlFor: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-semibold">
        {label}
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-muted-foreground">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

function getErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";
  if (msg.includes("Invalid login credentials")) {
    return "האימייל או הסיסמה שגויים. אנא בדוק שוב ונסה להתחבר.";
  }
  if (msg.includes("Email not confirmed")) {
    return "האימייל עוד לא אושר. אנא בדוק את תיבת הדואר שלך לקבלת קישור אימות.";
  }
  if (msg.includes("User already registered")) {
    return "המשתמש כבר רשום. נסה להתחבר במקום להרשם.";
  }
  if (msg.includes("Password should be at least")) {
    return "הסיסמה קצרה מדי. יש לבחור סיסמה באורך של לפחות 6 תווים.";
  }
  if (msg.includes("Unable to validate email address")) {
    return "כתובת האימייל אינה תקינה. אנא בדוק והזן שוב.";
  }
  if (msg.includes("weak_password")) {
    return "הסיסמה חלשה מדי. נסה לבחור סיסמה חזקה יותר.";
  }
  return "אירעה שגיאה בלתי צפויה. אנא נסה שוב מאוחר יותר.";
}
