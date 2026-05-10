import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./index";

const LocaleContext = createContext(null);
const RTL_LANGUAGES = new Set(["ar"]);

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(i18n.language || "en");

  useEffect(() => {
    const lang = locale;
    const direction = RTL_LANGUAGES.has(lang) ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = direction;
    localStorage.setItem("treadx_locale", lang);
  }, [locale]);

  useEffect(() => {
    const syncState = (lang) => setLocaleState(lang);
    i18n.on("languageChanged", syncState);
    return () => i18n.off("languageChanged", syncState);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      isRTL: RTL_LANGUAGES.has(locale),
      setLocale: (lang) => i18n.changeLanguage(lang),
    }),
    [locale],
  );

  return (
    <I18nextProvider i18n={i18n}>
      <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
    </I18nextProvider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within I18nProvider");
  }
  return context;
}
