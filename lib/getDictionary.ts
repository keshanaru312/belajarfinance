import en from "@/locales/en.json";
import bm from "@/locales/bm.json";

const dictionaries = { en, bm };

export function getDictionary(lang: string) {
  return dictionaries[lang] || dictionaries.en;
}
