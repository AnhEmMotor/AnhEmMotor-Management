import { createI18n } from "vue-i18n";
import messages from "@/i18n/package";
import { langList } from "@/common/utils/langList";
import { getSystemStorage } from "@/common/utils/storage";

const langListArr: string[] = langList.map((lang) => lang.category);

const resolveStoredLanguage = (): string => {
  try {
    const sys = getSystemStorage();
    if (sys) {
      const data = JSON.parse(sys);
      if (data.user?.language && langListArr.includes(data.user.language)) {
        return data.user.language;
      }
    }

    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.language && langListArr.includes(user.language)) {
        return user.language;
      }
    }
  } catch {
    // ignore parse errors, fall through to default
  }
  return "vi";
};

export function setLocale(lang: string): void {
  if (!langListArr.includes(lang)) return;
  i18n.global.locale.value = lang as any;
  localStorage.setItem("app-lang", lang);
}

const i18n = createI18n({
  locale: resolveStoredLanguage(),
  fallbackLocale: "vi",
  legacy: false,
  globalInjection: true,
  allowComposition: true,
  messages,
});

export const languageOptions = langList.map((item) => ({
  value: item.category,
  label: item.lang,
}));

export const $t = i18n.global.t;

export default i18n;
