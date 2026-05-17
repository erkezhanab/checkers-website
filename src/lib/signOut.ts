import { createClient } from "@/lib/supabase/client";

export function signOut() {
  try {
    const supabase = createClient();
    supabase.auth.signOut();
  } catch {}

  // Remove Supabase auth token (key derived from project ref in URL)
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const ref = new URL(url).hostname.split(".")[0];
    localStorage.removeItem(`sb-${ref}-auth-token`);
    localStorage.removeItem(`sb-${ref}-auth-token-code-verifier`);
  } catch {}

  // Remove any remaining sb- prefixed keys
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sb-")) localStorage.removeItem(key);
    });
  } catch {}

  // Clear cookies that Supabase may have set
  try {
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  } catch {}

  window.location.href = "/";
}
