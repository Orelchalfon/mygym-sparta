/** Maps Supabase auth errors to clear Hebrew messages with a recovery hint. */
export function authErrorMessage(
  err: { message?: string; status?: number; code?: string } | null | undefined,
) {
  const msg = err?.message?.toLowerCase() ?? "";
  // Project-wide email quota (Supabase mailer), not the user's own attempts — check
  // before the generic 429 branch so we don't blame the user.
  if (err?.code === "over_email_send_rate_limit" || msg.includes("email rate limit")) {
    return "לא הצלחנו לשלוח את המייל כרגע — מכסת המיילים של השרת נוצלה. נסו שוב מאוחר יותר.";
  }
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
  if (msg.includes("different from the old password") || msg.includes("same_password")) {
    return "הסיסמה החדשה זהה לישנה. בחרו סיסמה אחרת.";
  }
  if (msg.includes("auth session missing") || msg.includes("session_not_found")) {
    return "הקישור פג תוקף. בקשו קישור חדש לאיפוס הסיסמה.";
  }
  if (msg.includes("too many requests") || msg.includes("rate limit") || err?.status === 429) {
    return "יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.";
  }
  return import.meta.env.DEV && err?.message
    ? `שגיאה: ${err.message}`
    : "אירעה שגיאה בלתי צפויה. נסו שוב.";
}
