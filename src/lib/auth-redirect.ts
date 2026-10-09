/** Where signed-in users land when no return target was requested. */
export const DEFAULT_AFTER_AUTH = "/areas";

/**
 * Accepts only same-origin paths ("/areas/legs?x=1"). Anything else — absolute URLs,
 * protocol-relative "//evil.com", backslash tricks — is dropped to block open redirects.
 */
export function safeRedirect(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.startsWith("/")) return undefined;
  if (value.startsWith("//") || value.startsWith("/\\")) return undefined;
  if (value.startsWith("/auth")) return undefined;
  return value;
}

/** Email-link landing page: /auth forwards a signed-in user on to the target. */
export function authCallbackUrl(target: string): string {
  const url = new URL("/auth", window.location.origin);
  if (target !== DEFAULT_AFTER_AUTH) url.searchParams.set("redirect", target);
  return url.toString();
}
