import { cookies } from "next/headers";
import { defaultLocale, locales, type Locale } from "./config";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value;
  if (lang && (locales as readonly string[]).includes(lang)) {
    return lang as Locale;
  }
  return defaultLocale;
}
