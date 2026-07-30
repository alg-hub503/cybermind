import { getLocale } from "./get-locale";
import { defaultLocale } from "./config";
import ar from "./messages/ar.json";
import en from "./messages/en.json";

const messages: Record<string, Record<string, string>> = { ar, en };

export async function t(key: string): Promise<string> {
  const locale = await getLocale();
  return messages[locale]?.[key] ?? messages[defaultLocale]?.[key] ?? key;
}
