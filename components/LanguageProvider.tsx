"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  LanguageCode,
  TranslationKey,
  defaultLanguage,
  getHtmlLanguage,
  isLanguageCode,
  isRtl,
  translate,
} from "@/lib/i18n/translations";

type TranslationParams = Record<string, string | number>;

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

const storageKey = "expensio-language";

const detectInitialLanguage = (): LanguageCode => {
  if (typeof window === "undefined") {
    return defaultLanguage;
  }

  const stored = window.localStorage.getItem(storageKey);
  if (stored && isLanguageCode(stored)) {
    return stored;
  }

  const browserLanguage = window.navigator.language?.toLowerCase() ?? "";

  if (browserLanguage.startsWith("es")) {
    return "es";
  }
  if (browserLanguage.startsWith("fr")) {
    return "fr";
  }
  if (browserLanguage.startsWith("ar")) {
    return "ar";
  }

  return defaultLanguage;
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(
    typeof window === "undefined" ? defaultLanguage : detectInitialLanguage(),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setLanguageState(detectInitialLanguage());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(storageKey, language);
    document.documentElement.lang = getHtmlLanguage(language);
    document.documentElement.dir = isRtl(language) ? "rtl" : "ltr";
  }, [language]);

  const setLanguage = useCallback((next: LanguageCode) => {
    setLanguageState(next);
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey, params?: TranslationParams) =>
        translate(language, key, params),
    }),
    [language, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
