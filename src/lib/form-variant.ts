import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie, getRequestUrl, setCookie } from "@tanstack/react-start/server";
import { formVariant, type FormVariant } from "@/lib/box-enquiry";

/** Cookie mirror of the sticky homepage form split, so the server renders the same version the browser shows. */
export const FORM_VARIANT_COOKIE = "snaplogo_form_variant";
const ONE_YEAR = 60 * 60 * 24 * 365;

const asVariant = (value: string | null | undefined): FormVariant | null => (value === "v2" || value === "classic" ? value : null);

export const initialFormVariant = createIsomorphicFn()
  .server((): FormVariant => {
    const variant: FormVariant = new URL(getRequestUrl()).searchParams.get("form") === "classic" ? "classic" : "v2";
    if (asVariant(getCookie(FORM_VARIANT_COOKIE)) !== "v2") setCookie(FORM_VARIANT_COOKIE, "v2", { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
    return variant;
  })
  .client((): FormVariant => {
    try { return formVariant(window.location.search, localStorage); } catch { return "v2"; }
  });

/** Keeps the browser copies (localStorage and cookie) aligned with the version shown. */
export function rememberFormVariant(variant: FormVariant) {
  void variant;
  try { localStorage.setItem("snaplogo.form.variant", "v2"); } catch { /* storage unavailable */ }
  document.cookie = `${FORM_VARIANT_COOKIE}=v2; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}
