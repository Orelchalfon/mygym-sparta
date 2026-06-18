import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("נרשמת בהצלחה");
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-6 bg-card border border-border rounded-2xl p-8 shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">אימון אישי</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === "in" ? "התחבר כדי להתחיל" : "צור חשבון חדש"}
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">סיסמה</Label>
            <Input
              id="password"
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "..." : mode === "in" ? "התחבר" : "הירשם"}
          </Button>
        </form>
        <button
          onClick={() => setMode(mode === "in" ? "up" : "in")}
          className="w-full text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === "in" ? "אין לך חשבון? הירשם" : "כבר רשום? התחבר"}
        </button>
      </div>
    </div>
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
