/** Self-contained (no app CSS or fonts): it renders exactly when SSR is broken. */
export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>העמוד לא נטען — ספרטא</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 16px/1.6 system-ui, -apple-system, "Segoe UI", Arial, sans-serif; background: #0a0a0a; color: #fafafa; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #a3a3a3; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { min-height: 44px; padding: 0.5rem 1.5rem; border-radius: 0.75rem; font: inherit; font-weight: 700; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #d93a40; color: #fff; }
      .secondary { background: transparent; color: #fafafa; border-color: #404040; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>העמוד לא נטען</h1>
      <p>משהו השתבש אצלנו. אפשר לנסות שוב או לחזור לדף הבית.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">נסה שוב</button>
        <a class="secondary" href="/">לדף הבית</a>
      </div>
    </div>
  </body>
</html>`;
}
