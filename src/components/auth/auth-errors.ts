/** Maps Supabase auth errors to clear Hebrew messages with a recovery hint. */
export function authErrorMessage(err: { message?: string; status?: number } | null | undefined) {
  const msg = err?.message?.toLowerCase() ?? "";
  if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
    return "האימייל או הסיסמה שגויים. בדקו ונסו שוב.";
  }
  if (msg.includes("not confirmed")) {
    return "האימייל עוד לא אומת. בדקו את תיבת הדואר ולחצו על קישור האימות.";
  }
  if (msg.includes("already registered") || msg.includes("already")) {
    return "המשתמש כבר רשום. נסו להתחבר במקום להירשם.";
  }
  if (msg.includes("pwned")) {
    return "הסיסמה הזו הופיעה בדליפת מידע. בחרו סיסמה אחרת.";
  }
  if (msg.includes("weak_password") || msg.includes("password should be at least")) {
    return "הסיסמה חלשה או קצרה מדי. בחרו סיסמה של 6 תווים לפחות.";
  }
  if (msg.includes("unable to validate email") || msg.includes("invalid email")) {
    return "כתובת האימייל אינה תקינה. בדקו והזינו שוב.";
  }
  if (msg.includes("too many requests") || err?.status === 429) {
    return "יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.";
  }
  return import.meta.env.DEV && err?.message
    ? `שגיאה: ${err.message}`
    : "אירעה שגיאה בלתי צפויה. נסו שוב.";
}
