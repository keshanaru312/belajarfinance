import en from "@/locales/en.json";
import bm from "@/locales/bm.json";

const dictionaries = { en, bm };

export function getDictionary(lang: string) {
  if (lang in dictionaries) {
    return dictionaries[lang as keyof typeof dictionaries];
  }
  return dictionaries.en;
}
